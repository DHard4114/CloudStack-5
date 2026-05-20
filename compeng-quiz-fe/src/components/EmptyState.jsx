import { cn } from '@/utils/cn'

// ============================================================
// EmptyState — Empty / no-data illustration block
// ============================================================

const EmptyState = ({ icon: Icon, title, description, action = null, className = '' }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 bg-ink-100 border border-ink-200 rounded-sm
                        flex items-center justify-center mb-5">
          <Icon size={24} className="text-ink-500" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-xl text-ink-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-ink-600 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}

export default EmptyState
