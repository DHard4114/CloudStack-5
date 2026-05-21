import { useEffect, useState, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Trophy, Zap, CheckCircle2, XCircle, Users, Crown,
  ArrowRight, Triangle, Square, Circle, Hexagon
} from 'lucide-react'
import toast from 'react-hot-toast'

import { connectSocket, getSocket, disconnectSocket } from '@/api/socket'
import { sessionService } from '@/api/axios'
import { useAuth } from '@/contexts/AuthContext'
import { useCountdown } from '@/hooks/useCountdown'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

// ============================================================
// QuizRoom — Live game arena untuk student
// ============================================================
// Phases:
//  - LOBBY    : menunggu host start
//  - QUESTION : soal aktif, timer running, bisa submit jawaban
//  - REVEAL   : tampilkan jawaban benar + score yang didapat
//  - LEADERBOARD: leaderboard antar soal
//  - FINISHED : podium + summary akhir
// ============================================================

const OPTION_STYLES = [
  { icon: Triangle, color: 'bg-red-500',    text: 'text-white', label: 'A' },
  { icon: Square,   color: 'bg-blue-600',   text: 'text-white', label: 'B' },
  { icon: Circle,   color: 'bg-amber-500',  text: 'text-ink-900', label: 'C' },
  { icon: Hexagon,  color: 'bg-emerald-600',text: 'text-white', label: 'D' },
]

const QuizRoom = () => {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()

  const [phase, setPhase]             = useState('lobby')
  const [question, setQuestion]       = useState(null)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [selected, setSelected]       = useState(null)
  const [revealed, setRevealed]       = useState(null)
  const [score, setScore]             = useState(0)
  const [streak, setStreak]           = useState(0)
  const [rank, setRank]               = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [players, setPlayers]         = useState([])
  const [finalResult, setFinalResult] = useState(null)
  const submitTimeRef = useRef(null)
  const phaseRef = useRef('lobby')

  const sessionInfo = location.state?.session
  const nickname    = location.state?.nickname || user?.username || 'Anonim'

  // Countdown hook
  const { seconds, progress, start, reset } = useCountdown(30, () => {
    // auto-submit kalau belum jawab
    if (!selected && question) handleSubmit(null)
  })

  // ============================================================
  // SOCKET CONNECTION & EVENT HANDLERS
  // ============================================================
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    const socket = connectSocket(token)
    const joinCode = location.state?.pin
    // Disabled sementara: backend socket saat ini hanya support:
    // join-session, request-leaderboard, leaderboard-update.
    // Event FE lama disimpan sebagai referensi:
    // session:join, session:question, session:reveal,
    // session:leaderboard, session:end, session:error.
    if (joinCode) {
      socket.emit('join-session', { join_code: joinCode, player_nickname: nickname })
      socket.emit('request-leaderboard', { join_code: joinCode })
    }

    socket.on('session:question', (data) => {
      const q = data?.question
      if (!q) return
      setQuestion(q)
      setQuestionIdx(data?.index || 1)
      setTotalQuestions(data?.total || 0)
      setSelected(null)
      setRevealed(null)
      setPhase('question')
      submitTimeRef.current = Date.now()
      reset(q.time_limit || 30)
      setTimeout(() => start(q.time_limit || 30), 100)
    })

    socket.on('session:end', (data) => {
      setFinalResult(data || null)
      setPhase('finished')
    })

    socket.on('leaderboard-update', (data) => {
      const list = data?.leaderboard || []
      setLeaderboard(list.map((p) => ({
        nickname: p.player_nickname,
        score: p.total_score,
        rank: p.current_rank,
      })))
      setPlayers(list.map((p, i) => ({ id: i, nickname: p.player_nickname })))
      // Jangan paksa pindah ke leaderboard saat masih lobby (join awal).
      if (phaseRef.current !== 'lobby') {
        setPhase('leaderboard')
      }
    })

    return () => {
      socket.off('session:question')
      socket.off('session:end')
      socket.off('leaderboard-update')
      // Note: tidak disconnect socket di unmount karena bisa dipakai di tempat lain
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, token, nickname, location.state?.pin])

  // Cleanup socket saat keluar dari quiz room sepenuhnya
  useEffect(() => () => disconnectSocket(), [])

  // ============================================================
  // SUBMIT ANSWER
  // ============================================================
  const handleSubmit = async (answerIdx) => {
    if (selected !== null || !question) return
    setSelected(answerIdx ?? -1)
    const timeTakenMs = Math.max(0, Date.now() - (submitTimeRef.current || Date.now()))
    const options = question?.options || question?.choices || []
    const selectedOption = answerIdx !== null && answerIdx !== undefined ? options[answerIdx] : null
    const selectedOptionId = typeof selectedOption === 'object'
      ? (selectedOption?.id || selectedOption?.option_id || selectedOption?.optionId)
      : null

    // Disabled sementara (backend belum support session:answer).
    // const socket = getSocket()
    // socket?.emit('session:answer', {
    //   session_uuid: uuid,
    //   question_uuid: question.uuid || question.id,
    //   selected_option_id: selectedOptionId,
    //   time_taken_ms: timeTakenMs,
    // })

    // Submit utama via HTTP sesuai kontrak backend
    try {
      if (!selectedOptionId) return
      await sessionService.submit(uuid, {
        question_uuid: question.uuid || question.id,
        selected_option_id: selectedOptionId,
        time_taken_ms: timeTakenMs,
      })
      const joinCode = location.state?.pin
      if (joinCode) getSocket()?.emit('request-leaderboard', { join_code: joinCode })
    } catch {
      // ignored
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Top Status Bar */}
      <div className="bg-ink-900 text-ink-50 border-b-2 border-flame-500">
        <div className="container-editorial flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-flame-500 flex items-center justify-center rounded-sm flex-shrink-0">
              <span className="font-display text-ink-900 text-sm font-bold -translate-y-px">QL</span>
            </div>
            <div className="min-w-0">
              <p className="font-display text-sm truncate">{sessionInfo?.quiz_title || 'Live Session'}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-400">
                {nickname} · PIN {location.state?.pin || '------'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-flame-400" />
              <span className="text-ink-400 hidden sm:inline">STREAK</span>
              <span className="text-flame-400 tabular font-semibold">{streak}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={12} className="text-flame-400" />
              <span className="text-ink-400 hidden sm:inline">SCORE</span>
              <span className="text-flame-400 tabular font-semibold">{formatNumber(score)}</span>
            </div>
            {rank && (
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-flame-400" />
                <span className="text-flame-400 tabular font-semibold">#{rank}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute inset-0 bg-grid-paper opacity-50 pointer-events-none" />

        <AnimatePresence mode="wait">
          {phase === 'lobby'        && <LobbyPhase key="lobby" players={players} nickname={nickname} sessionInfo={sessionInfo} />}
          {phase === 'question'     && <QuestionPhase key="q" question={question} selected={selected} onSubmit={handleSubmit} seconds={seconds} progress={progress} questionIdx={questionIdx} totalQuestions={totalQuestions} />}
          {phase === 'reveal'       && <RevealPhase key="r" revealed={revealed} question={question} selected={selected} />}
          {phase === 'leaderboard'  && <LeaderboardPhase key="lb" leaderboard={leaderboard} myNickname={nickname} />}
          {phase === 'finished'     && <FinishedPhase key="end" leaderboard={leaderboard} finalResult={finalResult} myNickname={nickname} onExit={() => navigate('/')} />}
        </AnimatePresence>
      </main>
    </div>
  )
}

// ============================================================
// PHASE: LOBBY
// ============================================================
const LobbyPhase = ({ players, nickname, sessionInfo }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
    className="w-full max-w-3xl text-center relative"
  >
    <p className="eyebrow justify-center mb-6">RUANG TUNGGU</p>
    <h1 className="font-display text-display-xl tracking-editorial mb-4">
      Bersiap...
    </h1>
    <p className="text-ink-600 mb-12">
      Menunggu pengajar memulai sesi. Sebanyak{' '}
      <span className="font-mono font-semibold text-ink-900">{players.length}</span>{' '}
      mahasiswa sudah bergabung.
    </p>

    <div className="bg-white border-2 border-ink-900 p-8 shadow-brutal rounded-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="eyebrow">PESERTA AKTIF</p>
        <span className="badge-live">LIVE</span>
      </div>

      {players.length === 0 ? (
        <div className="py-12 text-ink-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1.5} />
          <p className="text-sm">Belum ada peserta lain</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {players.map((p, i) => (
            <motion.div
              key={p.id || p.nickname || i}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'px-3 py-1.5 border rounded-sm text-sm font-medium',
                (p.nickname || p.name) === nickname
                  ? 'bg-flame-500 border-flame-500 text-ink-900'
                  : 'bg-ink-100 border-ink-300 text-ink-700'
              )}
            >
              {p.nickname || p.name || 'Anonim'}
              {(p.nickname || p.name) === nickname && <span className="ml-1.5 text-[10px]">(KAMU)</span>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </motion.div>
)

// ============================================================
// PHASE: QUESTION
// ============================================================
const QuestionPhase = ({ question, selected, onSubmit, seconds, progress, questionIdx, totalQuestions }) => {
  const options = question?.options || question?.choices || []
  const isUrgent = seconds <= 5

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-5xl relative"
    >
      {/* Question header */}
      <div className="flex items-center justify-between mb-6">
        <p className="eyebrow">SOAL {questionIdx}/{totalQuestions || '?'}</p>
        <div className={cn(
          'flex items-center gap-2 font-mono text-sm font-semibold tabular',
          isUrgent ? 'text-danger animate-pulse' : 'text-ink-700'
        )}>
          <Clock size={14} />
          {String(seconds).padStart(2, '0')}s
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-ink-200 mb-8 overflow-hidden rounded-sm">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'linear' }}
          className={cn('h-full transition-colors', isUrgent ? 'bg-danger' : 'bg-flame-500')}
        />
      </div>

      {/* Question text */}
      <div className="bg-white border-2 border-ink-900 p-8 sm:p-12 mb-8 shadow-brutal-lg rounded-sm">
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-editorial text-balance leading-tight">
          {question?.question || question?.text || question?.body}
        </h2>
        {question?.image_url && (
          <img src={question.image_url} alt="Question" className="mt-6 max-h-64 rounded-sm" />
        )}
      </div>

      {/* Options grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((opt, idx) => {
          const style = OPTION_STYLES[idx % 4]
          const isSelected = selected === idx
          const isDisabled = selected !== null && !isSelected

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06 }}
              onClick={() => onSubmit(idx)}
              disabled={selected !== null}
              className={cn(
                'group relative overflow-hidden border-2 border-ink-900 p-5 sm:p-6 text-left rounded-sm transition-all',
                style.color, style.text,
                isSelected && 'ring-4 ring-flame-500 scale-[0.98]',
                isDisabled && 'opacity-30 grayscale',
                !isDisabled && !isSelected && 'hover:scale-[1.02] hover:shadow-brutal cursor-pointer',
                'disabled:cursor-not-allowed'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm border border-white/40
                                flex items-center justify-center rounded-sm flex-shrink-0">
                  <style.icon size={20} fill="currentColor" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest opacity-80 mb-1">OPSI {style.label}</p>
                  <p className="font-display text-lg sm:text-xl leading-tight">
                    {typeof opt === 'string' ? opt : opt.text || opt.label}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {selected !== null && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center mt-6 font-mono text-xs uppercase tracking-widest text-ink-500"
        >
          ✓ JAWABAN TERKIRIM · MENUNGGU PESERTA LAIN...
        </motion.p>
      )}
    </motion.div>
  )
}

// ============================================================
// PHASE: REVEAL
// ============================================================
const RevealPhase = ({ revealed, question, selected }) => {
  if (!revealed) return null
  const isCorrect = revealed.my_correct
  const correctIdx = revealed.correct_answer
  const options = question?.options || question?.choices || []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="w-full max-w-3xl text-center"
    >
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className={cn(
          'inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 border-4',
          isCorrect ? 'bg-success border-success text-white' : 'bg-danger border-danger text-white'
        )}
      >
        {isCorrect ? <CheckCircle2 size={42} /> : <XCircle size={42} />}
      </motion.div>

      <p className="eyebrow justify-center mb-3">{isCorrect ? 'JAWABAN BENAR' : 'JAWABAN SALAH'}</p>
      <h2 className="font-display text-display tracking-editorial mb-4">
        {isCorrect ? 'Bagus sekali!' : 'Sayang sekali.'}
      </h2>

      {isCorrect && revealed.points_earned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="inline-block bg-flame-500 text-ink-900 px-6 py-3 rounded-sm shadow-brutal border-2 border-ink-900 mb-8"
        >
          <span className="font-mono text-xs uppercase tracking-widest">+</span>
          <span className="font-display text-3xl mx-1 tabular font-semibold">{formatNumber(revealed.points_earned)}</span>
          <span className="font-mono text-xs uppercase tracking-widest">POIN</span>
        </motion.div>
      )}

      {correctIdx !== undefined && options[correctIdx] && (
        <div className="bg-white border-2 border-ink-900 p-6 rounded-sm shadow-brutal-sm mb-6 text-left">
          <p className="eyebrow mb-3">JAWABAN BENAR</p>
          <p className="font-display text-xl text-ink-900">
            {typeof options[correctIdx] === 'string' ? options[correctIdx] : options[correctIdx].text}
          </p>
        </div>
      )}

      {revealed.explanation && (
        <div className="bg-ink-100 p-6 rounded-sm text-left">
          <p className="eyebrow mb-3">PENJELASAN</p>
          <p className="text-ink-700 leading-relaxed">{revealed.explanation}</p>
        </div>
      )}
    </motion.div>
  )
}

// ============================================================
// PHASE: LEADERBOARD
// ============================================================
const LeaderboardPhase = ({ leaderboard, myNickname }) => {
  const top10 = leaderboard.slice(0, 10)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="w-full max-w-2xl"
    >
      <p className="eyebrow justify-center text-center mb-4">PERINGKAT SEMENTARA</p>
      <h2 className="font-display text-display tracking-editorial text-center mb-10">
        Leaderboard
      </h2>

      <div className="bg-white border-2 border-ink-900 shadow-brutal rounded-sm overflow-hidden">
        {top10.map((player, i) => {
          const isMe = (player.nickname || player.name) === myNickname
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

          return (
            <motion.div
              key={player.id || player.nickname || i}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5 border-b border-ink-200 last:border-b-0',
                isMe && 'bg-flame-500/10',
                i === 0 && 'bg-flame-500/20'
              )}
            >
              <div className="w-10 flex justify-center">
                {medal ? (
                  <span className="text-2xl">{medal}</span>
                ) : (
                  <span className="font-mono text-sm text-ink-500 tabular">{String(i + 1).padStart(2, '0')}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-display text-base truncate', isMe && 'text-flame-700')}>
                  {player.nickname || player.name || 'Anonim'}
                  {isMe && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-flame-600">KAMU</span>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl tabular font-semibold">{formatNumber(player.score || 0)}</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-500">POIN</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-center mt-6 font-mono text-xs uppercase tracking-widest text-ink-500 animate-pulse">
        SOAL BERIKUTNYA SEGERA DIMULAI...
      </p>
    </motion.div>
  )
}

// ============================================================
// PHASE: FINISHED
// ============================================================
const FinishedPhase = ({ leaderboard, myNickname, onExit }) => {
  const podium = leaderboard.slice(0, 3)
  const myEntry = useMemo(
    () => leaderboard.find((p) => (p.nickname || p.name) === myNickname),
    [leaderboard, myNickname]
  )
  const myRank = leaderboard.findIndex((p) => (p.nickname || p.name) === myNickname) + 1

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full max-w-4xl"
    >
      <div className="text-center mb-12">
        <p className="eyebrow justify-center mb-4">SESI BERAKHIR</p>
        <h1 className="font-display text-display-xl tracking-editorial">
          Kuis Selesai<span className="text-flame-500">.</span>
        </h1>
      </div>

      {/* Podium */}
      {podium.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-12 items-end max-w-2xl mx-auto">
          {/* 2nd */}
          {podium[1] && (
            <PodiumCard player={podium[1]} rank={2} height="h-32 sm:h-44" medal="🥈" myNickname={myNickname} />
          )}
          {/* 1st */}
          {podium[0] && (
            <PodiumCard player={podium[0]} rank={1} height="h-44 sm:h-60" medal="🥇" myNickname={myNickname} highlight />
          )}
          {/* 3rd */}
          {podium[2] && (
            <PodiumCard player={podium[2]} rank={3} height="h-24 sm:h-36" medal="🥉" myNickname={myNickname} />
          )}
        </div>
      )}

      {/* My result */}
      {myEntry && (
        <div className="bg-white border-2 border-ink-900 p-6 sm:p-8 shadow-brutal mb-8 rounded-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">HASIL KAMU</p>
              <p className="font-display text-2xl">{myNickname}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="font-display text-display tabular text-ink-900">#{myRank}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">PERINGKAT</p>
              </div>
              <div className="text-center">
                <p className="font-display text-display tabular text-flame-500">{formatNumber(myEntry.score)}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">POIN</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={onExit} className="btn-brutal">
          KEMBALI KE HOME <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}

const PodiumCard = ({ player, rank, height, medal, myNickname, highlight }) => {
  const isMe = (player.nickname || player.name) === myNickname
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.15, type: 'spring', stiffness: 100 }}
      className="flex flex-col items-center"
    >
      <div className="text-4xl mb-2">{medal}</div>
      <p className={cn(
        'font-display text-lg sm:text-xl text-center truncate w-full mb-1',
        isMe && 'text-flame-700'
      )}>
        {player.nickname || player.name}
      </p>
      <p className="font-mono text-sm tabular text-ink-700 mb-3">{formatNumber(player.score)} pts</p>
      <div className={cn(
        'w-full border-2 border-ink-900 flex items-center justify-center rounded-sm',
        height,
        highlight ? 'bg-flame-500' : 'bg-white',
      )}>
        <span className="font-display text-5xl sm:text-6xl tabular text-ink-900">{rank}</span>
      </div>
    </motion.div>
  )
}

export default QuizRoom
