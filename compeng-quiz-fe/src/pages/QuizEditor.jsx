import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Plus, Trash2, Save, Clock, Award, CheckCircle2,
  AlertCircle, Triangle, Square, Circle, Hexagon, Play, Edit3,
  HelpCircle, ListChecks,
} from 'lucide-react'
import { quizService, sessionService } from '@/api/axios'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EmptyState from '@/components/EmptyState'
import StatusPill from '@/components/StatusPill'
import { cn } from '@/utils/cn'
import { formatDateTime } from '@/utils/format'

// ============================================================
// QUIZ EDITOR — Authoring Studio
// ------------------------------------------------------------
// Halaman untuk guru menyusun pertanyaan kuis.
// Fitur:
//   - Load quiz by uuid → quizService.getById
//   - Tampilkan daftar pertanyaan yang ada
//   - Composer pertanyaan baru: text, 4 opsi, kunci jawaban,
//     points, time limit per soal
//   - Live preview kartu pertanyaan (Kahoot-style)
//   - Aksi: Tambah soal, simpan, mulai sesi
// ============================================================

const SHAPES = [
  { Icon: Triangle, color: 'bg-rose-500',    ring: 'ring-rose-300',    label: 'A' },
  { Icon: Square,   color: 'bg-sky-500',     ring: 'ring-sky-300',     label: 'B' },
  { Icon: Circle,   color: 'bg-flame-500',   ring: 'ring-flame-300',   label: 'C' },
  { Icon: Hexagon,  color: 'bg-emerald-500', ring: 'ring-emerald-300', label: 'D' },
]

const emptyDraft = () => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  points: 100,
  timeLimit: 30,
})

const QuizEditor = () => {
  const { uuid } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz]         = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [starting, setStarting] = useState(false)

  const [draft, setDraft] = useState(emptyDraft())

  // ----------- Bootstrap -----------
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const { data } = await quizService.getById(uuid)
        if (cancelled) return
        const payload = data?.data || data
        const q = payload?.quiz || payload
        setQuiz(q || null)
        // Pertanyaan bisa berasal dari q.questions, payload.questions, atau array sendiri
        const qs = q?.questions || payload?.questions || []
        setQuestions(Array.isArray(qs) ? qs : [])
      } catch (err) {
        console.error('Load quiz error', err)
        toast.error('Gagal memuat data kuis')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [uuid])

  // ----------- Validasi draft -----------
  const validation = useMemo(() => {
    const errs = []
    if (!draft.text.trim())                          errs.push('Teks pertanyaan kosong')
    if (draft.options.some((o) => !o.trim()))        errs.push('Semua 4 opsi wajib diisi')
    if (draft.points < 10 || draft.points > 2000)    errs.push('Poin di luar rentang 10–2000')
    if (draft.timeLimit < 5 || draft.timeLimit > 180) errs.push('Waktu di luar rentang 5–180 detik')
    return { ok: errs.length === 0, errs }
  }, [draft])

  // ----------- Tambah pertanyaan -----------
  const handleAddQuestion = async (e) => {
    e?.preventDefault?.()
    if (!validation.ok) {
      validation.errs.forEach((m) => toast.error(m))
      return
    }
    setSubmitting(true)
    const loadingToast = toast.loading('Menyimpan pertanyaan...')
    try {
      const payload = {
        question_text: draft.text.trim(),
        options:       draft.options.map((o) => o.trim()),
        correct_index: draft.correctIndex,
        points:        Number(draft.points),
        time_limit:    Number(draft.timeLimit),
      }
      const { data } = await quizService.addQuestion(uuid, payload)
      const created  = data?.data?.question || data?.question || data?.data || payload

      toast.success('Pertanyaan ditambahkan', { id: loadingToast })
      setQuestions((prev) => [...prev, { ...created, ...payload }])
      setDraft(emptyDraft())
    } catch (err) {
      console.error('Add question error', err)
      toast.error(err?.response?.data?.message || 'Gagal menambah pertanyaan', { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  // ----------- Mulai sesi live -----------
  const handleStartSession = async () => {
    if (questions.length === 0) {
      toast.error('Tambahkan minimal 1 pertanyaan dulu')
      return
    }
    setStarting(true)
    const loadingToast = toast.loading('Membuka sesi langsung...')
    try {
      const { data } = await sessionService.create({ quiz_uuid: uuid })
      const session  = data?.data?.session || data?.session || data?.data || data
      const sessionUuid = session?.uuid || session?.session_uuid
      if (!sessionUuid) throw new Error('UUID sesi tidak ditemukan dalam response')
      toast.success('Sesi dibuat', { id: loadingToast })
      navigate(`/host/${sessionUuid}`, { state: { fresh: true } })
    } catch (err) {
      console.error('Start session error', err)
      toast.error(err?.response?.data?.message || 'Gagal memulai sesi', { id: loadingToast })
    } finally {
      setStarting(false)
    }
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50">
        <Navbar />
        <div className="container-editorial py-32 flex items-center justify-center">
          <div className="flex items-center gap-3 text-ink-600 font-mono text-sm">
            <div className="w-3 h-3 bg-flame-500 animate-pulse rounded-full" />
            MEMUAT EDITOR KUIS...
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-ink-50 bg-grid-paper flex flex-col">
      <Navbar />

      {/* ----------- HEADER STRIP ----------- */}
      <div className="border-b border-ink-200 bg-white">
        <div className="container-editorial py-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-ink-950 mb-6 font-mono uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dasbor
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-flame-600 mb-3">— EDITOR KUIS</p>
              <h1 className="font-display text-4xl md:text-6xl tracking-editorial text-ink-950 truncate">
                {quiz?.title || 'Kuis Tanpa Judul'}
              </h1>
              {quiz?.description && (
                <p className="text-ink-600 mt-3 max-w-2xl leading-relaxed">
                  {quiz.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-5 text-xs font-mono uppercase tracking-wider text-ink-500">
                {quiz?.category && (
                  <span className="px-2.5 py-1 border border-ink-300 rounded-sm">
                    {quiz.category}
                  </span>
                )}
                {quiz?.difficulty && (
                  <span className="px-2.5 py-1 border border-ink-300 rounded-sm">
                    {quiz.difficulty}
                  </span>
                )}
                <StatusPill status={quiz?.status || 'draft'} />
                <span>
                  {questions.length} {questions.length === 1 ? 'pertanyaan' : 'pertanyaan'}
                </span>
                {quiz?.created_at && (
                  <span>· Dibuat {formatDateTime(quiz.created_at)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleStartSession}
                disabled={starting || questions.length === 0}
                className="btn-brutal inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                {starting ? 'Membuka sesi...' : 'Mulai Sesi Langsung'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ----------- BODY ----------- */}
      <div className="flex-1 container-editorial py-12">
        <div className="grid lg:grid-cols-[1fr,1.1fr] gap-10">

          {/* ============================================ */}
          {/* KOLOM KIRI — DAFTAR PERTANYAAN              */}
          {/* ============================================ */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="eyebrow text-flame-600 mb-2">— BANK SOAL</p>
                <h2 className="font-display text-2xl tracking-editorial text-ink-950">
                  Pertanyaan tersimpan
                </h2>
              </div>
              <span className="font-mono text-sm text-ink-500">
                {String(questions.length).padStart(2, '0')} / ∞
              </span>
            </div>

            {questions.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Belum ada pertanyaan"
                description="Mulai membangun kuis dengan menambahkan pertanyaan pertama dari panel di sebelah kanan."
              />
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {questions.map((q, idx) => (
                    <motion.article
                      key={q.uuid || q.id || idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="card hover:shadow-soft-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="font-display text-3xl tracking-editorial text-flame-500 leading-none w-12 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-ink-950 font-medium leading-relaxed">
                            {q.question_text || q.text}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-2 mt-4">
                            {(q.options || []).map((opt, i) => {
                              const Shape = SHAPES[i] || SHAPES[0]
                              const isCorrect = i === (q.correct_index ?? q.correctIndex)
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    'flex items-center gap-2.5 px-3 py-2 border rounded-sm text-sm',
                                    isCorrect
                                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                                      : 'border-ink-200 bg-ink-50 text-ink-700'
                                  )}
                                >
                                  <span className={cn('w-6 h-6 flex items-center justify-center rounded-sm text-white', Shape.color)}>
                                    <Shape.Icon className="w-3 h-3" fill="currentColor" />
                                  </span>
                                  <span className="truncate flex-1">{opt}</span>
                                  {isCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ink-100 text-xs font-mono uppercase tracking-wider text-ink-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5" />
                              {q.points ?? 100} pts
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {q.time_limit ?? q.timeLimit ?? 30}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* ============================================ */}
          {/* KOLOM KANAN — COMPOSER PERTANYAAN BARU      */}
          {/* ============================================ */}
          <section className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white border-2 border-ink-950 shadow-brutal p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-200">
                <div>
                  <p className="eyebrow text-flame-600 mb-2">— PERTANYAAN BARU</p>
                  <h2 className="font-display text-2xl tracking-editorial text-ink-950">
                    Susun pertanyaan
                  </h2>
                </div>
                <Edit3 className="w-5 h-5 text-ink-400" />
              </div>

              <form onSubmit={handleAddQuestion} className="space-y-6">
                {/* Teks pertanyaan */}
                <div>
                  <label className="input-label flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Teks Pertanyaan
                    </span>
                    <span className="text-ink-400 normal-case font-sans text-[10px]">
                      {draft.text.length} / 280
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={draft.text}
                    onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                    placeholder="Contoh: Apa kepanjangan dari CPU dalam arsitektur komputer?"
                    className="input-field resize-none"
                  />
                </div>

                {/* 4 Opsi */}
                <div>
                  <label className="input-label">
                    Empat Pilihan Jawaban
                    <span className="text-ink-400 normal-case font-sans text-[10px] ml-2">
                      Klik ikon untuk menandai jawaban benar
                    </span>
                  </label>
                  <div className="space-y-2.5">
                    {draft.options.map((opt, i) => {
                      const Shape = SHAPES[i]
                      const isCorrect = draft.correctIndex === i
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex items-center gap-3 border-2 transition-all',
                            isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-ink-200 bg-white hover:border-ink-300'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, correctIndex: i })}
                            className={cn(
                              'w-12 h-12 flex items-center justify-center text-white shrink-0 transition-transform hover:scale-105',
                              Shape.color
                            )}
                            title={isCorrect ? 'Jawaban benar' : 'Tandai sebagai benar'}
                          >
                            <Shape.Icon className="w-5 h-5" fill="currentColor" />
                          </button>
                          <input
                            type="text"
                            value={opt}
                            maxLength={140}
                            onChange={(e) => {
                              const next = [...draft.options]
                              next[i] = e.target.value
                              setDraft({ ...draft, options: next })
                            }}
                            placeholder={`Opsi ${Shape.label}...`}
                            className="flex-1 px-3 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-ink-950 placeholder:text-ink-400"
                          />
                          {isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Poin & Waktu */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label inline-flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      Poin
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      step={10}
                      value={draft.points}
                      onChange={(e) => setDraft({ ...draft, points: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="input-label inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Waktu (detik)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      value={draft.timeLimit}
                      onChange={(e) => setDraft({ ...draft, timeLimit: e.target.value })}
                      className="input-field font-mono"
                    />
                  </div>
                </div>

                {/* Validation banner */}
                <AnimatePresence>
                  {!validation.ok && draft.text.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          {validation.errs.map((m, i) => <div key={i}>· {m}</div>)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink-200">
                  <button
                    type="button"
                    onClick={() => setDraft(emptyDraft())}
                    className="btn-ghost inline-flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !validation.ok}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Save className="w-4 h-4 animate-pulse" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Tambah ke Bank Soal
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Tips Card */}
            <div className="mt-6 border border-ink-200 bg-ink-50 p-5">
              <p className="eyebrow text-ink-500 mb-3">— TIPS PENULISAN</p>
              <ul className="space-y-2 text-sm text-ink-700">
                <li className="flex gap-2"><span className="text-flame-500">·</span> Gunakan kalimat tanya yang singkat dan jelas.</li>
                <li className="flex gap-2"><span className="text-flame-500">·</span> Hindari opsi "semua benar" atau "tidak ada".</li>
                <li className="flex gap-2"><span className="text-flame-500">·</span> Waktu 20–30 detik ideal untuk soal pemahaman.</li>
                <li className="flex gap-2"><span className="text-flame-500">·</span> Soal dengan poin tinggi sebaiknya lebih sulit.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default QuizEditor
