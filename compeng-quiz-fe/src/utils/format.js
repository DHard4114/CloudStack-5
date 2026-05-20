// ============================================================
// FORMATTERS — Date, number, duration, PIN
// ============================================================

export const formatDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(d)
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d)
}

export const formatRelative = (date) => {
  if (!date) return '—'
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'baru saja'
  if (mins < 60)  return `${mins}m lalu`
  if (hours < 24) return `${hours}j lalu`
  if (days < 7)   return `${days}h lalu`
  return formatDate(date)
}

export const formatNumber = (num) => {
  if (num == null) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

export const formatPin = (pin) => {
  if (!pin) return '— — — — — —'
  return String(pin).padStart(6, '0').split('').join(' ')
}

export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const initials = (name = '') => {
  return name
    .trim().split(/\s+/).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join('')
}
