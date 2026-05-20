import { cn } from '@/utils/cn'

// ============================================================
// StatusPill — Indikator status (LIVE, ENDED, WAITING, OFFLINE)
// ============================================================

const STATUS_MAP = {
  live:    { dot: 'bg-flame-500', text: 'text-flame-700', label: 'LIVE',     pulse: true  },
  waiting: { dot: 'bg-info',      text: 'text-info',      label: 'WAITING',  pulse: true  },
  active:  { dot: 'bg-success',   text: 'text-success',   label: 'ACTIVE',   pulse: false },
  draft:   { dot: 'bg-ink-400',   text: 'text-ink-600',   label: 'DRAFT',    pulse: false },
  ended:   { dot: 'bg-ink-500',   text: 'text-ink-700',   label: 'ENDED',    pulse: false },
  offline: { dot: 'bg-danger',    text: 'text-danger',    label: 'OFFLINE',  pulse: false },
}

const StatusPill = ({ status = 'draft', className = '', label = null }) => {
  const cfg = STATUS_MAP[status.toLowerCase()] || STATUS_MAP.draft
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest',
                        cfg.text, className)}>
      <span className="relative inline-flex">
        <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
        {cfg.pulse && (
          <span className={cn('absolute inset-0 w-1.5 h-1.5 rounded-full opacity-75 animate-pulse-ring', cfg.dot)} />
        )}
      </span>
      {label || cfg.label}
    </span>
  )
}

export default StatusPill
