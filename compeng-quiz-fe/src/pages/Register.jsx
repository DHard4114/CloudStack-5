import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, ArrowLeft, GraduationCap, BookOpen, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/cn'

// ============================================================
// Register — 2-step flow: pilih role, lalu data akun
// ============================================================

const Register = () => {
  const { register } = useAuth()
  const [step, setStep] = useState(1)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    role: '',
    username: '',
    email: '',
    password: '',
  })

  const pickRole = (role) => {
    setForm({ ...form, role })
    setStep(2)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password || !form.role) return
    if (form.password.length < 6) return
    setLoading(true)
    await register(form)
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-ink-50">

      {/* ===================== LEFT BRAND ===================== */}
      <aside className="hidden lg:flex lg:col-span-5 bg-ink-900 text-ink-50 relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-flame-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-flame-500 flex items-center justify-center rounded-sm">
              <span className="font-display text-ink-900 text-lg font-bold leading-none -translate-y-px">QL</span>
            </div>
            <span className="font-display text-lg tracking-editorial">QuizLive CompEng</span>
          </Link>
          <Link to="/login" className="text-xs font-mono uppercase tracking-widest text-ink-400 hover:text-flame-400 transition">
            SUDAH PUNYA AKUN →
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <p className="eyebrow text-flame-400 mb-6 before:bg-flame-400">REGISTRASI</p>
          <h2 className="font-display text-display-xl mb-6 leading-tight tracking-editorial">
            Satu akun.<br /><em className="font-light text-flame-400">Dua peran besar.</em>
          </h2>
          <ul className="space-y-4 text-ink-300">
            {[
              'Authoring soal multi-pilihan & true/false',
              'PIN generator untuk sesi live',
              'Leaderboard real-time via WebSocket',
              'Riwayat performa per mahasiswa',
            ].map((it) => (
              <li key={it} className="flex items-start gap-3 text-sm">
                <Check size={16} className="text-flame-400 mt-0.5 flex-shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative z-10">
          <div className="flex gap-2 mb-3">
            {[1, 2].map((s) => (
              <div key={s} className={cn(
                'h-1 flex-1 transition-all duration-300',
                step >= s ? 'bg-flame-500' : 'bg-ink-700'
              )} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
            STEP {step} OF 2 · {step === 1 ? 'PILIH PERAN' : 'DATA AKUN'}
          </p>
        </div>
      </aside>

      {/* ===================== RIGHT FORM ===================== */}
      <main className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-grid-paper opacity-50 pointer-events-none" />

        <div className="w-full max-w-md relative">
          <div className="lg:hidden flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-ink-900 flex items-center justify-center rounded-sm">
                <span className="font-display text-flame-400 text-base font-bold -translate-y-px">QL</span>
              </div>
              <span className="font-display text-lg">QuizLive</span>
            </Link>
            <Link to="/login" className="text-xs font-mono uppercase tracking-widest text-ink-500">
              MASUK →
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              // ----------- STEP 1: ROLE -----------
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="eyebrow mb-4">STEP 01 / PILIH PERAN</p>
                <h1 className="font-display text-display tracking-editorial mb-3">
                  Anda bergabung sebagai?
                </h1>
                <p className="text-ink-600 mb-10">
                  Pilih peran sesuai kebutuhan Anda di platform ini.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => pickRole('teacher')}
                    className="w-full border-2 border-ink-900 p-6 text-left group hover:bg-ink-900 hover:text-ink-50 transition-all rounded-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-flame-500 flex items-center justify-center rounded-sm flex-shrink-0">
                        <BookOpen size={22} className="text-ink-900" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display text-xl tracking-editorial">Pengajar</h3>
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <p className="text-sm text-ink-600 group-hover:text-ink-300 leading-relaxed">
                          Buat bank soal, kelola sesi live, dan pantau performa kelas.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => pickRole('student')}
                    className="w-full border-2 border-ink-300 p-6 text-left group hover:border-ink-900 hover:bg-ink-100 transition-all rounded-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-ink-100 border border-ink-900 flex items-center justify-center rounded-sm flex-shrink-0">
                        <GraduationCap size={22} className="text-ink-900" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-display text-xl tracking-editorial">Mahasiswa</h3>
                          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <p className="text-sm text-ink-600 leading-relaxed">
                          Gabung sesi kuis dengan PIN, jawab soal, dan kejar skor di leaderboard.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <p className="text-sm text-ink-500 mt-8 text-center">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-ink-900 underline underline-offset-4 decoration-flame-500 decoration-2 font-medium">
                    Masuk
                  </Link>
                </p>
              </motion.div>
            ) : (
              // ----------- STEP 2: DATA -----------
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-ink-600 hover:text-ink-900 mb-6">
                  <ArrowLeft size={14} /> Ganti peran
                </button>
                <p className="eyebrow mb-4">STEP 02 / DATA AKUN</p>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="font-display text-display tracking-editorial">Buat akun</h1>
                  <span className="badge-accent">{form.role === 'teacher' ? 'PENGAJAR' : 'MAHASISWA'}</span>
                </div>
                <p className="text-ink-600 mb-10">
                  Lengkapi data berikut untuk memulai.
                </p>

                <form onSubmit={onSubmit} className="space-y-7">
                  <div>
                    <label className="input-label">USERNAME</label>
                    <input
                      type="text"
                      required
                      minLength={3}
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      placeholder="nama_anda"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">EMAIL</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="nama@kampus.ac.id"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">PASSWORD</label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
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

                  <button type="submit" disabled={loading} className="btn-brutal w-full justify-between mt-4">
                    {loading ? 'MENDAFTARKAN...' : <>BUAT AKUN <ArrowRight size={16} /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default Register
