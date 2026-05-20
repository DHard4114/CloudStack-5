import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// ProtectedRoute — guard route berdasarkan auth & role
// ============================================================

const ProtectedRoute = ({ children, roles = null }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Tunggu bootstrap context selesai
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex items-center gap-3 text-ink-600 font-mono text-sm">
          <div className="w-3 h-3 bg-flame-500 animate-pulse rounded-full" />
          MEMUAT SESI...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role check
  if (roles && roles.length > 0) {
    const userRole = user?.role?.toLowerCase()
    const allowed  = roles.map((r) => r.toLowerCase()).includes(userRole)
    if (!allowed) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
