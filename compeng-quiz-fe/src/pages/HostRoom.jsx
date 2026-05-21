import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, SkipForward, Square, Copy, Check, Users, Radio, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { connectSocket, getSocket, disconnectSocket } from '@/api/socket'
import { sessionService } from '@/api/axios'
import { useAuth } from '@/contexts/AuthContext'
import { formatPin, formatNumber, initials } from '@/utils/format'
import { cn } from '@/utils/cn'

// ============================================================
// HostRoom — Control panel pengajar untuk sesi live
// ============================================================

const HostRoom = () => {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()

  const [session, setSession]         = useState(null)
  const [players, setPlayers]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [phase, setPhase]             = useState('lobby')
  const [copied, setCopied]           = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [answerStats, setAnswerStats] = useState({ submitted: 0, total: 0 })

  // ----------- Bootstrap session info -----------
  useEffect(() => {
    const sess = location.state?.session || null
    if (sess) setSession(sess)
    setLoading(false)
  }, [location.state])

  // ----------- Socket listeners -----------
  useEffect(() => {
    const socket = connectSocket(token)
    const joinCode = session?.join_code || location.state?.pin
    socket.emit('host:join', { session_uuid: uuid })

    // Disabled sementara: backend socket saat ini hanya support:
    // - join-session
    // - request-leaderboard
    // - leaderboard-update
    //
    // Event FE lama (host:join, host:session_info, host:question_started,
    // host:answer_submitted, host:session_ended) disimpan sebagai referensi:
    //
    // socket.emit('host:join', { session_uuid: uuid })
    // socket.on('host:session_info', ...)
    // socket.on('host:question_started', ...)
    // socket.on('host:answer_submitted', ...)
    // socket.on('host:session_ended', ...)

    if (joinCode) {
      socket.emit('join-session', { join_code: joinCode, player_nickname: 'HOST' })
      socket.emit('request-leaderboard', { join_code: joinCode })
    }

    socket.on('leaderboard-update', (data) => {
      const list = data?.leaderboard || []
      setLeaderboard(list.map((p) => ({
        nickname: p.player_nickname,
        score: p.total_score,
        rank: p.current_rank,
      })))
      setPlayers(list.map((p, i) => ({ id: i, nickname: p.player_nickname, score: p.total_score })))
      setAnswerStats((prev) => ({ ...prev, total: list.length }))
    })

    socket.on('host:session_info', (data) => {
      setSession((prev) => ({ ...(prev || {}), ...data }))
      setTotalQuestions(data.total_questions || 0)
    })

    socket.on('host:question_started', (data) => {
      setCurrentQuestion(data.question)
      setQuestionIdx(data.index || 1)
      setTotalQuestions(data.total || totalQuestions)
      setPhase('question')
    })

    socket.on('host:session_ended', () => {
      setPhase('finished')
    })

    socket.on('host:session_error', (err) => {
      toast.error(err?.message || 'Gagal memulai sesi live')
    })

    return () => {
      socket.off('leaderboard-update')
      socket.off('host:session_info')
      socket.off('host:question_started')
      socket.off('host:session_ended')
      socket.off('host:session_error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, token, session, location.state])

  useEffect(() => () => disconnectSocket(), [])

  // ----------- Actions -----------
  const onStart = async () => {
    if (players.length === 0) {
      if (!confirm('Belum ada peserta. Mulai sesi?')) return
    }
    try {
      await sessionService.start(uuid)
      const joinCode = session?.join_code || location.state?.pin
      if (joinCode) getSocket()?.emit('request-leaderboard', { join_code: joinCode })
      getSocket()?.emit('host:start_session', { session_uuid: uuid })
      toast.success('Sesi dimulai')
    } catch (err) {
      toast.error(err?.message || 'Gagal memulai sesi')
    }
  }

  const onNext = async () => {
    try {
      const joinCode = session?.join_code || location.state?.pin
      if (joinCode) getSocket()?.emit('request-leaderboard', { join_code: joinCode })
      getSocket()?.emit('host:next_question', { session_uuid: uuid })
    } catch {}
  }

  const onEnd = async () => {
    if (!confirm('Akhiri sesi sekarang?')) return
    try {
      await sessionService.finish(uuid)
      getSocket()?.emit('host:end_session', { session_uuid: uuid })
      disconnectSocket()
      toast.success('Sesi berakhir')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {}
  }

  const copyPin = () => {
    const pin = session?.join_code || session?.pin || session?.code || location.state?.pin
    if (!pin) return
    navigator.clipboard.writeText(String(pin))
    setCopied(true)
    toast.success('PIN disalin')
    setTimeout(() => setCopied(false), 2000)
  }

  const pin = session?.join_code || session?.pin || session?.code || location.state?.pin

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="font-mono text-sm text-ink-400 flex items-center gap-3">
          <span className="w-2 h-2 bg-flame-500 rounded-full animate-pulse" />
          MEMUAT SESI...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-900 text-ink-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-ink-700 bg-ink-950">
        <div className="container-editorial flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-flame-500 flex items-center justify-center rounded-sm">
              <span className="font-display text-ink-900 text-base font-bold -translate-y-px">QL</span>
            </div>
            <div>
              <p className="font-display text-base">Host Mode</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                {session?.quiz_title || 'Live Quiz Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="badge-live">
              <span className="w-1.5 h-1.5 bg-flame-500 rounded-full animate-pulse" />
              LIVE · {phase.toUpperCase()}
            </span>
            <button
              onClick={() => { if (confirm('Keluar dari host mode?')) navigate('/dashboard') }}
              className="text-ink-400 hover:text-ink-50 p-2"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-20 pointer-events-none" />

        <div className="container-editorial py-8 sm:py-12 relative">

          {/* ===================== LOBBY ===================== */}
          {phase === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8">

              {/* PIN Display */}
              <div className="lg:col-span-7">
                <p className="eyebrow text-flame-400 mb-4 before:bg-flame-400">PIN UNTUK PESERTA</p>
                <div className="bg-ink-50 text-ink-900 p-8 sm:p-12 border-2 border-flame-500 rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-paper opacity-40 pointer-events-none" />

                  <p className="font-display text-display tracking-editorial mb-6 relative">
                    Bagikan PIN ini:
                  </p>
                  <div className="relative">
                    <p className="font-display text-[clamp(4rem,12vw,9rem)] leading-none tabular font-semibold text-ink-900 tracking-tightest">
                      {formatPin(pin)}
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 relative">
                    <button
                      onClick={copyPin}
                      className="btn-secondary !text-ink-900 !border-ink-900 hover:!bg-ink-900 hover:!text-ink-50"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'TERSALIN' : 'SALIN PIN'}
                    </button>
                    <p className="font-mono text-xs uppercase tracking-widest text-ink-600">
                      → quizlive.local/join
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-3">
                  <button onClick={onStart} disabled={players.length === 0} className="btn-brutal flex-1">
                    <Play size={16} /> MULAI SESI
                  </button>
                  <button onClick={() => { if (confirm('Batalkan sesi?')) navigate('/dashboard') }}
                    className="btn-secondary !text-ink-50 !border-ink-50 hover:!bg-ink-50 hover:!text-ink-900">
                    BATALKAN
                  </button>
                </div>
              </div>

              {/* Players panel */}
              <div className="lg:col-span-5">
                <div className="bg-ink-800 border border-ink-700 rounded-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
                    <div>
                      <p className="eyebrow text-ink-400 mb-1">PESERTA TERGABUNG</p>
                      <p className="font-display text-3xl tabular">{formatNumber(players.length)}</p>
                    </div>
                    <Users size={28} className="text-flame-400" strokeWidth={1.5} />
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {players.length === 0 ? (
                      <div className="py-12 text-center text-ink-500">
                        <Radio size={28} className="mx-auto mb-3 opacity-50 animate-pulse" />
                        <p className="font-mono text-xs uppercase tracking-widest">MENUNGGU PESERTA...</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-ink-700">
                        <AnimatePresence>
                          {players.map((p, i) => (
                            <motion.li
                              key={p.id || p.nickname || i}
                              layout
                              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 px-6 py-3"
                            >
                              <div className="w-8 h-8 bg-flame-500 text-ink-900 font-mono text-xs font-bold
                                              flex items-center justify-center rounded-sm">
                                {initials(p.nickname || p.name || 'A')}
                              </div>
                              <span className="flex-1 text-sm font-medium">{p.nickname || p.name}</span>
                              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                                #{String(i + 1).padStart(2, '0')}
                              </span>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== QUESTION ACTIVE ===================== */}
          {phase === 'question' && currentQuestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <p className="eyebrow text-flame-400 before:bg-flame-400">
                  SOAL {questionIdx} / {totalQuestions}
                </p>
                <p className="font-mono text-xs text-ink-400 uppercase tracking-widest">
                  JAWABAN MASUK · <span className="text-flame-400">{answerStats.submitted}</span> / {answerStats.total}
                </p>
              </div>

              <div className="bg-ink-50 text-ink-900 p-8 sm:p-12 mb-6 rounded-sm">
                <h2 className="font-display text-3xl sm:text-4xl tracking-editorial">
                  {currentQuestion.question || currentQuestion.text}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {(currentQuestion.options || []).map((opt, i) => (
                  <div key={i} className="bg-ink-800 border border-ink-700 p-4 rounded-sm">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-flame-400 mb-1">OPSI {String.fromCharCode(65 + i)}</p>
                    <p className="text-base">{typeof opt === 'string' ? opt : opt.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={onNext} className="btn-brutal">
                  <SkipForward size={16} /> LANJUT KE SOAL BERIKUTNYA
                </button>
                <button onClick={onEnd} className="btn-secondary !text-danger !border-danger hover:!bg-danger hover:!text-white">
                  <Square size={14} /> AKHIRI SESI
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================== LEADERBOARD ===================== */}
          {phase === 'leaderboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
              <p className="eyebrow text-flame-400 mb-4 before:bg-flame-400 justify-center">PERINGKAT</p>
              <h2 className="font-display text-display tracking-editorial text-center mb-10">
                Setelah Soal {questionIdx}
              </h2>

              <div className="bg-ink-800 border border-ink-700 rounded-sm overflow-hidden mb-8">
                {leaderboard.slice(0, 10).map((player, i) => (
                  <motion.div
                    key={player.id || player.nickname || i}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3.5 border-b border-ink-700 last:border-b-0',
                      i === 0 && 'bg-flame-500/10'
                    )}
                  >
                    <span className="font-display text-xl tabular text-flame-400 w-8">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 font-medium">{player.nickname || player.name}</span>
                    <span className="font-display text-xl tabular">{formatNumber(player.score || 0)}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <button onClick={onNext} className="btn-brutal">
                  <SkipForward size={16} /> SOAL BERIKUTNYA
                </button>
                <button onClick={onEnd} className="btn-secondary !text-danger !border-danger hover:!bg-danger hover:!text-white">
                  <Square size={14} /> AKHIRI
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================== FINISHED ===================== */}
          {phase === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center">
              <p className="eyebrow text-flame-400 mb-4 before:bg-flame-400 justify-center">SESI BERAKHIR</p>
              <h2 className="font-display text-display-xl tracking-editorial mb-6">
                Terima kasih<span className="text-flame-500">.</span>
              </h2>
              <p className="text-ink-400 mb-10">
                Hasil sesi telah disimpan. Anda akan diarahkan kembali ke dashboard.
              </p>
              <button onClick={() => navigate('/dashboard')} className="btn-brutal">
                KEMBALI KE DASHBOARD
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default HostRoom
