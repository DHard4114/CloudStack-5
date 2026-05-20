import { Github, Server, Cpu } from 'lucide-react'

// ============================================================
// Footer — Editorial minimal
// ============================================================

const Footer = () => {
  return (
    <footer className="border-t border-ink-200 bg-ink-50 mt-24">
      <div className="container-editorial py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-ink-900 flex items-center justify-center rounded-sm">
                <span className="font-display text-flame-400 text-base font-bold leading-none -translate-y-px">QL</span>
              </div>
              <span className="font-display text-lg text-ink-900 tracking-editorial">QuizLive CompEng</span>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed max-w-md">
              Platform kuis real-time untuk pendidikan Teknik Komputer. Dibangun di atas
              infrastruktur CloudStack dengan isolated network dan virtual router.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Stack</p>
            <ul className="space-y-2 text-sm text-ink-700">
              <li className="flex items-center gap-2"><Cpu size={12} /> React 18 + Vite</li>
              <li className="flex items-center gap-2"><Server size={12} /> Node.js + Socket.IO</li>
              <li className="flex items-center gap-2"><Github size={12} /> CloudStack 4.x</li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Infrastructure</p>
            <div className="font-mono text-[11px] text-ink-600 space-y-1.5">
              <div className="flex justify-between border-b border-ink-200 pb-1.5">
                <span>VR_PUBLIC</span><span className="text-ink-900">192.168.101.232</span>
              </div>
              <div className="flex justify-between border-b border-ink-200 pb-1.5">
                <span>BACKEND_INTERNAL</span><span className="text-ink-900">10.1.1.230:3000</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS</span>
                <span className="text-success flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" /> ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-ink-200 flex flex-col sm:flex-row
                        justify-between gap-3 text-xs text-ink-500 font-mono uppercase tracking-widest">
          <span>© 2026 QuizLive CompEng</span>
          <span>Built for engineering minds.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
