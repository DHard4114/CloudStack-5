import { useEffect } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'

// ============================================================
// Modal — Editorial modal dengan backdrop blur
// ============================================================

const Modal = ({ open, onClose, title, subtitle, children, size = 'md', className = '' }) => {
  // Escape untuk close
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6
                     bg-ink-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-full bg-white border-2 border-ink-900 shadow-brutal-lg text-ink-900 rounded-sm',
              'max-h-[90vh] overflow-hidden flex flex-col',
              sizes[size], className
            )}
          >
            <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-ink-200">
              <div>
                {subtitle && <p className="eyebrow mb-2">{subtitle}</p>}
                <h2 className="font-display text-2xl sm:text-3xl tracking-editorial text-ink-900">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1 rounded-sm hover:bg-ink-100 transition"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 sm:px-8 py-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
