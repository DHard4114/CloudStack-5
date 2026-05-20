import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Radio, Cpu, Network, Activity, Zap, Lock } from 'lucide-react'

// ============================================================
// Landing — Hero editorial dengan brutalist accents
// ============================================================

const Landing = () => {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 overflow-hidden">

      {/* ===================== HERO ===================== */}
      <section className="relative pt-20 pb-32">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid-paper opacity-60 pointer-events-none" />
        {/* Accent corner shape */}
        <div className="absolute top-32 right-0 w-64 h-64 bg-flame-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container-editorial relative">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="eyebrow mb-8"
          >
            EDISI 01 · COMPUTER ENGINEERING · 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-hero text-balance max-w-5xl"
          >
            Kuis real-time untuk{' '}
            <span className="italic font-light">otak yang dilatih</span>{' '}
            membangun&nbsp;sistem.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 max-w-2xl grid sm:grid-cols-5 gap-6 items-end"
          >
            <p className="sm:col-span-3 text-lg text-ink-700 leading-relaxed">
              Platform live-quiz yang dirancang khusus untuk pendidikan teknik komputer.
              Soal interaktif, leaderboard real-time, dan infrastruktur enterprise di atas CloudStack.
            </p>
            <div className="sm:col-span-2 flex flex-col gap-3">
              <Link to="/register" className="btn-brutal w-full justify-between">
                Mulai Sekarang <ArrowRight size={16} />
              </Link>
              <Link to="/join" className="btn-secondary w-full">
                Gabung dengan PIN
              </Link>
            </div>
          </motion.div>

          {/* Live ticker bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 border-y-2 border-ink-900 py-3 overflow-hidden mask-fade-x"
          >
            <div className="flex animate-marquee whitespace-nowrap">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-12 px-6 font-mono text-xs uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-flame-500 rounded-full animate-pulse" />
                    LIVE · 12 SESI AKTIF
                  </span>
                  <span>·</span>
                  <span>1.247 SOAL TERSEDIA</span>
                  <span>·</span>
                  <span>RESPONSE 47MS</span>
                  <span>·</span>
                  <span>UPTIME 99.98%</span>
                  <span>·</span>
                  <span>CLOUDSTACK_VR · 192.168.101.232</span>
                  <span>·</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="border-y border-ink-200 bg-white">
        <div className="container-editorial grid grid-cols-2 lg:grid-cols-4 divide-x divide-ink-200">
          {[
            { num: '< 50ms',  label: 'Latency WS',         note: 'Socket.IO LAN' },
            { num: '99.98%',  label: 'Service Uptime',     note: 'PM2 + KVM HA' },
            { num: '1000+',   label: 'Concurrent Players', note: 'Per session'  },
            { num: 'JWT',     label: 'Bearer Auth',        note: 'HS256 signed' },
          ].map((s) => (
            <div key={s.label} className="p-8 lg:p-10">
              <p className="font-display text-display-xl text-ink-900 tabular">{s.num}</p>
              <p className="mt-2 text-sm text-ink-900 font-medium">{s.label}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-500">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="py-24">
        <div className="container-editorial">
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
            <div className="lg:col-span-4">
              <p className="eyebrow mb-4">FITUR INTI</p>
              <h2 className="font-display text-display tracking-editorial">
                Dirancang untuk kelas teknik, bukan ujian generik.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 text-lg text-ink-700 leading-relaxed">
              Setiap detail dirancang untuk dosen dan mahasiswa Computer Engineering—dari pertanyaan
              tentang topology jaringan hingga simulasi instruction pipeline. Real-time, di atas
              infrastruktur cloud yang Anda kontrol penuh.
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-200 border border-ink-200">
            {[
              { icon: Radio,    title: 'Live Quiz Session', desc: 'PIN 6-digit untuk join instan. Leaderboard update via WebSocket setiap submit jawaban.' },
              { icon: Activity, title: 'Real-time Scoring', desc: 'Bonus poin berdasarkan kecepatan jawaban. Streak counter untuk jawaban berturut benar.' },
              { icon: Cpu,      title: 'Topik Engineering', desc: 'Bank soal khusus: digital logic, networking, computer architecture, OS, dan lainnya.' },
              { icon: Network,  title: 'Isolated Network',  desc: 'Backend hidden di CloudStack guest network. Hanya virtual router yang exposed.' },
              { icon: Lock,     title: 'JWT Authentication', desc: 'Token bearer terenkripsi. Role-based access: teacher untuk authoring, student untuk play.' },
              { icon: Zap,      title: 'Low Latency LAN',   desc: 'Optimized untuk lab environment. Frontend di Windows host, backend di KVM VM.' },
            ].map((f) => (
              <div key={f.title} className="bg-white p-8 group hover:bg-ink-50 transition">
                <div className="flex items-start justify-between mb-6">
                  <f.icon size={22} strokeWidth={1.5} className="text-ink-900" />
                  <span className="font-mono text-[10px] text-ink-400 group-hover:text-flame-500 transition">
                    /{String([...'abcdef'][Math.floor(Math.random() * 6)]).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-display text-xl mb-3 tracking-editorial">{f.title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ARCHITECTURE DIAGRAM ===================== */}
      <section className="py-24 bg-ink-900 text-ink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />

        <div className="container-editorial relative">
          <p className="eyebrow mb-4 text-ink-300" style={{ }}>
            <span className="bg-flame-500/20 text-flame-300 px-2 py-0.5 rounded-xs">INFRASTRUKTUR</span>
          </p>
          <h2 className="font-display text-display tracking-editorial mb-4 max-w-2xl">
            Diatas CloudStack, dibalik virtual router.
          </h2>
          <p className="text-ink-300 max-w-xl mb-16">
            Arsitektur production-grade dengan isolated guest network, port forwarding di Source NAT,
            dan layer auth penuh di gateway.
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { tag: 'LAYER 1', title: 'Windows Host LAN', ip: '192.168.101.100/24', desc: 'Frontend Vite dev server. Akses publik dari laptop user.' },
              { tag: 'LAYER 2', title: 'Virtual Router',   ip: '192.168.101.232',    desc: 'CloudStack VR dengan Source NAT. Port 3000 diteruskan ke guest VM.' },
              { tag: 'LAYER 3', title: 'Isolated Guest',   ip: '10.1.1.230:3000',    desc: 'Node.js Express + Socket.IO di PM2. MySQL local. Tidak exposed ke LAN.' },
            ].map((l, i) => (
              <div key={l.tag} className="border border-ink-700 p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-flame-400">{l.tag}</span>
                  <span className="font-mono text-[10px] text-ink-500">0{i + 1}</span>
                </div>
                <h3 className="font-display text-xl mb-2">{l.title}</h3>
                <p className="font-mono text-xs text-flame-300 mb-3 break-all">{l.ip}</p>
                <p className="text-sm text-ink-400 leading-relaxed">{l.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2
                                          text-flame-500 bg-ink-900 z-10" size={20} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-24">
        <div className="container-editorial">
          <div className="bg-white border-2 border-ink-900 p-12 md:p-20 relative overflow-hidden shadow-brutal-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-flame-500 -translate-y-1/2 translate-x-1/2 rotate-45" />
            <p className="eyebrow mb-4">SIAP DICOBA?</p>
            <h2 className="font-display text-display-xl tracking-editorial max-w-3xl mb-8">
              Sesi pertama Anda tinggal satu PIN saja.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-brutal">Daftar sebagai Pengajar <ArrowRight size={16} /></Link>
              <Link to="/join"     className="btn-secondary">Saya seorang Mahasiswa</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Landing
