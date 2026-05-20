import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Plus, BookOpen, Radio, Users, TrendingUp, Clock, Play, Edit3, Trash2,
  MoreVertical, ArrowUpRight, Activity, Sparkles
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import StatusPill from '@/components/StatusPill'
import { quizService, sessionService } from '@/api/axios'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelative, formatNumber } from '@/utils/format'

// ============================================================
// Dashboard — Editorial command center untuk pengajar
// ============================================================

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quizzes, setQuizzes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating]   = useState(false)

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'computer-architecture',
    difficulty: 'medium',
    duration_per_question: 30,
  })

  // ----------- LOAD QUIZZES -----------
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const { data } = await quizService.list()
        const list = data?.data || data?.quizzes || data || []
        if (mounted) setQuizzes(Array.isArray(list) ? list : [])
      } catch (err) {
        // Toast handled di interceptor; jaga kalau API belum siap
        if (mounted) setQuizzes([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // ----------- CREATE QUIZ -----------
  const onCreateQuiz = async (e) => {
    e.preventDefault()
    if (!newQuiz.title.trim()) return
    setCreating(true)
    try {
      const { data } = await quizService.create(newQuiz)
      const created = data?.data || data
      toast.success('Kuis berhasil dibuat')
      setModalOpen(false)
      setNewQuiz({ title: '', description: '', category: 'computer-architecture', difficulty: 'medium', duration_per_question: 30 })
      // Pindah ke editor
      const id = created.uuid || created.id
      if (id) navigate(`/quizzes/${id}/edit`)
      else setQuizzes((prev) => [created, ...prev])
    } catch {
      // toast oleh interceptor
    } finally {
      setCreating(false)
    }
  }

  // ----------- START SESSION -----------
  const onStartSession = async (quiz) => {
    const id = quiz.uuid || quiz.id
    const t = toast.loading('Membuat sesi live...')
    try {
      const { data } = await sessionService.create({ quiz_uuid: id, quiz_id: id })
      const sess = data?.data || data
      toast.success(`Sesi dibuat: PIN ${sess.pin || sess.code}`, { id: t })
      navigate(`/host/${sess.uuid || sess.id}`)
    } catch {
      toast.dismiss(t)
    }
  }

  // ----------- METRICS (derived) -----------
  const totalQuizzes  = quizzes.length
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.question_count || q.questions?.length || 0), 0)
  const totalSessions  = quizzes.reduce((sum, q) => sum + (q.session_count || 0), 0)
  const avgEngagement  = quizzes.length > 0
    ? Math.round(quizzes.reduce((s, q) => s + (q.avg_score || 75), 0) / quizzes.length)
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <Navbar />

      <main className="flex-1">
        {/* ===================== HERO STRIP ===================== */}
        <section className="border-b border-ink-200 bg-white">
          <div className="container-editorial py-10 lg:py-14">
            <div className="grid lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-4">DASHBOARD / {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
                <h1 className="font-display text-display-xl tracking-editorial text-balance">
                  Halo, {user?.username || 'Pengajar'}<span className="text-flame-500">.</span>
                </h1>
                <p className="mt-4 text-ink-600 max-w-xl">
                  Workspace pengajaran Anda siap. Buat kuis baru, mulai sesi live, atau review performa kelas.
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end gap-3">
                <button onClick={() => setModalOpen(true)} className="btn-brutal flex-1 sm:flex-none">
                  <Plus size={16} /> Kuis Baru
                </button>
                <Link to="/sessions" className="btn-secondary flex-1 sm:flex-none">
                  <Radio size={14} /> Sesi Aktif
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STATS ===================== */}
        <section className="border-b border-ink-200 bg-ink-50">
          <div className="container-editorial grid grid-cols-2 lg:grid-cols-4 divide-x divide-ink-200">
            {[
              { icon: BookOpen,  label: 'Total Kuis',         value: formatNumber(totalQuizzes),    sub: 'aktif di workspace' },
              { icon: Activity,  label: 'Total Soal',         value: formatNumber(totalQuestions),  sub: 'tersedia untuk sesi' },
              { icon: Radio,     label: 'Sesi Berlangsung',   value: formatNumber(totalSessions),   sub: 'minggu ini' },
              { icon: TrendingUp,label: 'Rata-rata Skor',     value: `${avgEngagement}%`,           sub: 'partisipasi kelas' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-6 lg:p-8 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <s.icon size={18} className="text-ink-500 group-hover:text-flame-500 transition" strokeWidth={1.5} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">0{i + 1}</span>
                </div>
                <p className="font-display text-display tabular text-ink-900">{s.value}</p>
                <p className="mt-2 text-sm font-medium text-ink-900">{s.label}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================== QUIZ LIST ===================== */}
        <section className="container-editorial py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">PERPUSTAKAAN KUIS</p>
              <h2 className="font-display text-display tracking-editorial">Kuis Anda</h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-ink-500">
              <Clock size={12} /> SYNC TERAKHIR · BARU SAJA
            </div>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-200 border border-ink-200">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 h-56">
                  <div className="shimmer h-3 w-20 mb-6" />
                  <div className="shimmer h-6 w-3/4 mb-3" />
                  <div className="shimmer h-3 w-full mb-2" />
                  <div className="shimmer h-3 w-2/3 mb-8" />
                  <div className="flex gap-2 mt-auto">
                    <div className="shimmer h-8 w-20" />
                    <div className="shimmer h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Belum ada kuis di workspace Anda"
              description="Mulai dengan membuat kuis pertama. Tambahkan soal, atur durasi, lalu mulai sesi live."
              action={
                <button onClick={() => setModalOpen(true)} className="btn-brutal">
                  <Plus size={16} /> Buat Kuis Pertama
                </button>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-200 border border-ink-200">
              {quizzes.map((quiz, i) => (
                <QuizCard
                  key={quiz.uuid || quiz.id}
                  quiz={quiz}
                  index={i}
                  onStart={() => onStartSession(quiz)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* ===================== CREATE QUIZ MODAL ===================== */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Kuis Baru"
        subtitle="QUIZ / NEW"
        size="lg"
      >
        <form onSubmit={onCreateQuiz} className="space-y-7">
          <div>
            <label className="input-label">JUDUL KUIS</label>
            <input
              type="text"
              required
              maxLength={120}
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              placeholder="contoh: Computer Architecture — Mid Term"
              className="input-field text-lg"
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">DESKRIPSI (OPSIONAL)</label>
            <textarea
              rows={3}
              value={newQuiz.description}
              onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
              placeholder="Topik yang dibahas, target audience, atau catatan lain..."
              className="input-field resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="input-label">KATEGORI</label>
              <select
                value={newQuiz.category}
                onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
                className="input-field"
              >
                <option value="computer-architecture">Computer Architecture</option>
                <option value="digital-logic">Digital Logic</option>
                <option value="networking">Computer Networking</option>
                <option value="operating-system">Operating System</option>
                <option value="data-structure">Data Structure</option>
                <option value="programming">Programming</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="input-label">TINGKAT KESULITAN</label>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setNewQuiz({ ...newQuiz, difficulty: d })}
                    className={`py-2 text-xs font-mono uppercase tracking-widest rounded-sm border transition
                      ${newQuiz.difficulty === d
                        ? 'bg-ink-900 text-ink-50 border-ink-900'
                        : 'bg-white text-ink-600 border-ink-300 hover:border-ink-900'
                      }`}
                  >
                    {d === 'easy' ? 'Mudah' : d === 'medium' ? 'Sedang' : 'Sulit'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="input-label flex justify-between">
              <span>DURASI PER SOAL</span>
              <span className="text-ink-900 tabular">{newQuiz.duration_per_question}s</span>
            </label>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={newQuiz.duration_per_question}
              onChange={(e) => setNewQuiz({ ...newQuiz, duration_per_question: parseInt(e.target.value) })}
              className="w-full accent-flame-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-ink-500 mt-1">
              <span>10s</span><span>60s</span><span>120s</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-ink-200">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={creating} className="btn-brutal">
              {creating ? 'MEMBUAT...' : <>BUAT KUIS <ArrowUpRight size={16} /></>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// QuizCard — sub-component editorial
// ============================================================
const QuizCard = ({ quiz, index, onStart }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const id = quiz.uuid || quiz.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="bg-white p-7 group hover:bg-ink-50 transition relative flex flex-col"
    >
      <div className="flex items-start justify-between mb-5">
        <StatusPill status={quiz.status || 'draft'} />
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400 mr-1">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-sm hover:bg-ink-100 text-ink-500"
            aria-label="Menu"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-4 top-12 w-44 bg-white border border-ink-900 shadow-brutal-sm rounded-sm py-1 z-20">
                <Link to={`/quizzes/${id}/edit`} className="block px-4 py-2 text-sm hover:bg-ink-100">
                  <Edit3 size={12} className="inline mr-2" /> Edit Soal
                </Link>
                <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-ink-100">
                  <Trash2 size={12} className="inline mr-2" /> Hapus
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="font-display text-xl text-ink-900 tracking-editorial mb-2 line-clamp-2">
        {quiz.title}
      </h3>
      <p className="text-sm text-ink-600 line-clamp-2 mb-6 leading-relaxed">
        {quiz.description || 'Tidak ada deskripsi'}
      </p>

      <div className="grid grid-cols-3 gap-2 py-4 border-y border-ink-200 mb-5 mt-auto">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Soal</p>
          <p className="font-display text-lg tabular">{quiz.question_count || quiz.questions?.length || 0}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Sesi</p>
          <p className="font-display text-lg tabular">{quiz.session_count || 0}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Players</p>
          <p className="font-display text-lg tabular">{quiz.total_players || 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-ink-500">
          {formatRelative(quiz.created_at || Date.now())}
        </span>
        <button
          onClick={onStart}
          className="text-sm font-medium text-ink-900 hover:text-flame-500 transition inline-flex items-center gap-1.5"
        >
          <Play size={12} /> Mulai Sesi
        </button>
      </div>
    </motion.div>
  )
}

export default Dashboard
