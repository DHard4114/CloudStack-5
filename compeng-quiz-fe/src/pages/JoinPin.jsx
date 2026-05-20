import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Radio } from 'lucide-react'
import toast from 'react-hot-toast'
import { sessionService } from '@/api/axios'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// JoinPin — Halaman input PIN sesi untuk student
// PIN 6-digit dengan UX inputs terpisah ala OTP
// ============================================================

const JoinPin = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [pin, setPin]         = useState(['', '', '', '', '', ''])
  const [nickname, setNickname] = useState(user?.username || '')
  const [step, setStep]       = useState(1)  // 1 = PIN, 2 = nickname (jika belum login)
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  // Focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const onDigitChange = (idx, val) => {
    const v = val.replace(/\D/g, '').slice(0, 1)
    const next = [...pin]
    next[idx] = v
    setPin(next)
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const onKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const onPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6)
    setPin(next)
    const lastIdx = Math.min(text.length, 5)
    inputRefs.current[lastIdx]?.focus()
  }

  const onContinue = (e) => {
    e?.preventDefault()
    const pinStr = pin.join('')
    if (pinStr.length !== 6) {
      toast.error('PIN harus 6 digit')
      return
    }
    if (!isAuthenticated && step === 1) {
      setStep(2)
      return
    }
    onJoin(pinStr, nickname)
  }

  const onJoin = async (pinStr, nick) => {
    setLoading(true)
    const t = toast.loading('Bergabung ke sesi...')
    try {
      const { data } = await sessionService.join({
        join_code: pinStr,
        player_nickname: nick || user?.username,
      })
      const sess = data?.data || data
      toast.success('Berhasil bergabung!', { id: t })
      navigate(`/play/${sess.session_uuid || sess.uuid}`, {
        state: { pin: pinStr, nickname: nick, session: sess },
      })
    } catch {
      // toast handled
    } finally {
      setLoading(false)
    }
  }

  const isPinComplete = pin.every((d) => d !== '')

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-ink-200">
        <div className="container-editorial flex items-center justify-between py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-ink-900 flex items-center justify-center rounded-sm">
              <span className="font-display text-flame-400 text-base font-bold -translate-y-px">QL</span>
            </div>
            <span className="font-display text-lg">QuizLive CompEng</span>
          </Link>
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="text-sm text-ink-600 hover:text-ink-900 flex items-center gap-2">
            <ArrowLeft size={14} /> {isAuthenticated ? 'Dashboard' : 'Masuk'}
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-grid-paper opacity-50 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl relative"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6 font-mono text-eyebrow uppercase tracking-widest text-flame-700">
              <Radio size={12} className="animate-pulse" /> LIVE SESSION
            </div>
            <h1 className="font-display text-display-xl tracking-editorial mb-4">
              Masukkan PIN<br />
              <em className="font-light text-ink-500">untuk bergabung.</em>
            </h1>
            <p className="text-ink-600 max-w-md mx-auto">
              PIN 6-digit diberikan oleh pengajar Anda saat sesi dimulai.
            </p>
          </div>

          <form onSubmit={onContinue} className="space-y-8">
            {step === 1 && (
              <>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={onPaste}>
                  {pin.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => onDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => onKeyDown(idx, e)}
                      className={`w-12 h-16 sm:w-16 sm:h-20 text-center font-display text-3xl sm:text-4xl tabular
                                  bg-white border-2 rounded-sm transition-all duration-200
                                  focus:outline-none focus:border-flame-500 focus:bg-flame-50 focus:scale-105
                                  ${digit ? 'border-ink-900 text-ink-900' : 'border-ink-300 text-ink-400'}`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs font-mono text-ink-500 uppercase tracking-widest">
                  Tip — paste PIN dari clipboard langsung di sini
                </p>
              </>
            )}

            {step === 2 && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-3 max-w-sm mx-auto"
              >
                <label className="input-label text-center">NAMA TAMPILAN ANDA</label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="nama panggilan..."
                  autoFocus
                  className="input-field text-center text-2xl font-display"
                />
                <p className="text-center text-xs text-ink-500">
                  Nama ini akan muncul di leaderboard.
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!isPinComplete || (step === 2 && !nickname.trim()) || loading}
              className="btn-brutal w-full justify-between mx-auto max-w-md flex"
            >
              {loading ? 'BERGABUNG...' : (
                <>{step === 1 && !isAuthenticated ? 'LANJUT' : 'GABUNG SESI'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {!isAuthenticated && step === 1 && (
            <p className="text-center text-sm text-ink-500 mt-10">
              Punya akun pengajar?{' '}
              <Link to="/login" className="text-ink-900 underline underline-offset-4 decoration-flame-500 decoration-2 font-medium">
                Masuk
              </Link>
            </p>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default JoinPin
