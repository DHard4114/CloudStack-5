import axios from 'axios'
import toast from 'react-hot-toast'

// ============================================================
// AXIOS INSTANCE — QuizLive CompEng
// ============================================================
// Backend berjalan di CloudStack Virtual Router (192.168.101.232:3000)
// CORS sudah di-handle di sisi backend.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.101.232:3000'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ----------- REQUEST INTERCEPTOR -----------
// Inject JWT token dari localStorage ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ql_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ----------- RESPONSE INTERCEPTOR -----------
// Global error handling — 401 auto-logout, network error toast
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Terjadi kesalahan'

    if (status === 401) {
      // Token expired / invalid
      localStorage.removeItem('ql_token')
      localStorage.removeItem('ql_user')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        toast.error('Sesi berakhir, silakan login kembali')
        setTimeout(() => { window.location.href = '/login' }, 800)
      }
    } else if (status === 403) {
      toast.error('Akses ditolak')
    } else if (status >= 500) {
      toast.error('Server bermasalah, coba lagi nanti')
    } else if (!error.response) {
      // Network error — biasanya CloudStack down atau port forward bermasalah
      toast.error('Tidak dapat menjangkau server. Cek koneksi.')
    }

    return Promise.reject({ ...error, message })
  }
)

// ============================================================
// SERVICE LAYER — Endpoint wrappers
// ============================================================

export const authService = {
  register: (payload) => api.post('/api/auth/register', payload),
  login:    (payload) => api.post('/api/auth/login', payload),
  me:       ()        => api.get('/api/auth/me'),
}

export const quizService = {
  list:        ()                   => api.get('/api/quizzes'),
  create:      (payload)            => api.post('/api/quizzes', payload),
  getById:     (uuid)               => api.get(`/api/quizzes/${uuid}`),
  addQuestion: (uuid, payload)      => api.post(`/api/quizzes/${uuid}/questions`, payload),
  delete:      (uuid)               => api.delete(`/api/quizzes/${uuid}`),
}

export const sessionService = {
  create:      (payload)              => api.post('/api/sessions', payload),
  join:        (payload)              => api.post('/api/sessions/join', payload),
  submit:      (uuid, payload)        => api.post(`/api/sessions/${uuid}/answer`, payload),
  start:       (uuid)                 => api.post(`/api/sessions/${uuid}/start`),
  finish:      (uuid)                 => api.patch(`/api/sessions/${uuid}/finish`),
}

export default api
