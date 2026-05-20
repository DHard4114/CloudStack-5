import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// Login — Split-screen editorial layout
// Left: brand/visual canvas · Right: form
// ============================================================

const Login = () => {
  const { login } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    setLoading(true)
    await login(form)
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-ink-50">

      {/* ===================== LEFT CANVAS ===================== */}
      <aside className="hidden lg:flex lg:col-span-5 bg-ink-900 text-ink-50 relative overflow-hidden p-12 flex-col justify-between">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30 pointer-events-none" />
        {/* Diagonal accent */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-flame-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-flame-500 flex items-center justify-center rounded-sm">
              <span className="font-display text-ink-900 text-lg font-bold leading-none -translate-y-px">QL</span>
            </div>
            <span className="font-display text-lg tracking-editorial">QuizLive CompEng</span>
          </Link>
          <Link to="/" className="text-xs font-mono uppercase tracking-widest text-ink-400 hover:text-flame-400 transition flex items-center gap-1.5">
            <ArrowLeft size={12} /> KEMBALI
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md"
        >
          <p className="eyebrow text-flame-400 mb-6 before:bg-flame-400">EDISI / 01</p>
          <h2 className="font-display text-display-xl text-ink-50 mb-6 leading-tight tracking-editorial">
            "Build the system,<br />then <em className="text-flame-400 font-light">test the mind</em>."
          </h2>
          <p className="text-ink-400 leading-relaxed">
            Login untuk membuka workspace pengajaran Anda, atau gabung sebagai mahasiswa
            menggunakan PIN sesi.
          </p>
        </motion.div>

        <div className="relative z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ink-500">
          <span>SECURE / JWT HS256</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            VR_GATEWAY · ONLINE
          </span>
        </div>
      </aside>

      {/* ===================== RIGHT FORM ===================== */}
      <main className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-grid-paper opacity-50 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md relative"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-ink-900 flex items-center justify-center rounded-sm">
                <span className="font-display text-flame-400 text-base font-bold -translate-y-px">QL</span>
              </div>
              <span className="font-display text-lg">QuizLive</span>
            </Link>
            <Link to="/" className="text-xs font-mono uppercase tracking-widest text-ink-500">← KEMBALI</Link>
          </div>

          <p className="eyebrow mb-4">LOGIN / AUTHENTIKASI</p>
          <h1 className="font-display text-display tracking-editorial mb-3">
            Masuk ke akun Anda
          </h1>
          <p className="text-ink-600 mb-10">
            Belum punya akun?{' '}
            <Link to="/register" className="text-ink-900 underline underline-offset-4 decoration-flame-500 decoration-2 font-medium">
              Daftar di sini
            </Link>
          </p>

          <form onSubmit={onSubmit} className="space-y-7">

            <div className="relative">
              <label htmlFor="email" className="input-label flex items-center gap-2">
                <Mail size={11} /> EMAIL
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@kampus.ac.id"
                className="input-field"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="input-label flex items-center gap-2">
                <Lock size={11} /> PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-ink-500 hover:text-ink-900"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-600 cursor-pointer">
                <input type="checkbox" className="rounded-xs accent-flame-500" />
                Ingat saya
              </label>
              <Link to="/forgot" className="text-ink-600 hover:text-ink-900 underline underline-offset-4">
                Lupa password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-brutal w-full justify-between mt-4">
              {loading ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-ink-900 rounded-full animate-blink" />
                    AUTHENTICATING...
                  </span>
                </>
              ) : (
                <>MASUK <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-6 border-t border-ink-200">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mb-2">
              ATAU GABUNG SEBAGAI MAHASISWA
            </p>
            <Link to="/join" className="text-ink-900 font-medium hover:text-flame-500 transition flex items-center gap-2">
              Masuk dengan PIN Sesi <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Login
