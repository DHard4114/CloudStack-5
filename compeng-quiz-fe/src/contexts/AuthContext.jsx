import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '@/api/axios'
import { disconnectSocket } from '@/api/socket'

// ============================================================
// AUTH CONTEXT — JWT-based authentication
// ============================================================
// State: user, token, loading
// Actions: login, register, logout
// Persistence: localStorage (key: ql_token, ql_user)
// ============================================================

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // ----------- Bootstrap dari localStorage -----------
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('ql_token')
      const storedUser  = localStorage.getItem('ql_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Auth bootstrap error', e)
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [])

  // ----------- LOGIN -----------
  const login = useCallback(async ({ email, password }) => {
    const loadingToast = toast.loading('Mengautentikasi...')
    try {
      const { data } = await authService.login({ email, password })

      // Fleksibel terhadap shape response: {data: {token, user}} atau {token, user}
      const payload = data?.data || data
      const newToken = payload.token
      const newUser  = payload.user || payload

      if (!newToken) throw new Error('Token tidak ditemukan di response')

      localStorage.setItem('ql_token', newToken)
      localStorage.setItem('ql_user', JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)

      toast.success(`Selamat datang, ${newUser.username || newUser.name || 'Pengguna'}`, { id: loadingToast })

      // Redirect berdasarkan role
      const role = newUser.role?.toLowerCase()
      if (role === 'teacher' || role === 'admin') {
        navigate('/dashboard')
      } else {
        navigate('/join')
      }

      return { success: true, user: newUser }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login gagal'
      toast.error(msg, { id: loadingToast })
      return { success: false, error: msg }
    }
  }, [navigate])

  // ----------- REGISTER -----------
  const register = useCallback(async (payload) => {
    const loadingToast = toast.loading('Mendaftarkan akun...')
    try {
      await authService.register(payload)
      toast.success('Akun berhasil dibuat. Silakan login.', { id: loadingToast })
      navigate('/login')
      return { success: true }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Registrasi gagal'
      toast.error(msg, { id: loadingToast })
      return { success: false, error: msg }
    }
  }, [navigate])

  // ----------- LOGOUT -----------
  const logout = useCallback(() => {
    localStorage.removeItem('ql_token')
    localStorage.removeItem('ql_user')
    setToken(null)
    setUser(null)
    disconnectSocket()
    toast.success('Berhasil keluar')
    navigate('/login')
  }, [navigate])

  // ----------- Helpers -----------
  const isAuthenticated = Boolean(token && user)
  const isTeacher       = user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin'
  const isStudent       = user?.role?.toLowerCase() === 'student'

  const value = {
    user, token, loading,
    isAuthenticated, isTeacher, isStudent,
    login, register, logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ----------- Hook -----------
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
