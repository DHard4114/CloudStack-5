import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { motion } from 'framer-motion'

// ============================================================
// 404 — Editorial NotFound
// ------------------------------------------------------------
// Halaman 404 dengan tipografi raksasa dan aksen amber.
// Mengikuti bahasa desain "Editorial Tech Brutalism".
// ============================================================

const NotFound = () => {
  return (
    <div className="min-h-screen bg-ink-50 bg-grid-paper flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl"
      >
        <p className="eyebrow text-flame-600 mb-6">— ERROR / 404</p>

        <h1 className="font-display text-[120px] md:text-[200px] leading-[0.85] tracking-editorial text-ink-950">
          4<span className="text-flame-500">0</span>4
        </h1>

        <h2 className="font-display text-3xl md:text-5xl tracking-editorial text-ink-900 mt-4">
          Halaman tidak ditemukan
        </h2>

        <p className="text-ink-600 mt-6 max-w-md mx-auto leading-relaxed">
          Rute yang Anda tuju tidak terdaftar dalam sistem. Mungkin sesi telah
          berakhir, tautan kadaluwarsa, atau alamat salah ketik.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn-brutal inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <Link to="/join" className="btn-secondary inline-flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Gabung Sesi
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-ink-200">
          <p className="font-mono text-xs text-ink-500 uppercase tracking-widest">
            QuizLive CompEng · Build 1.0.0 · Editorial Tech
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
