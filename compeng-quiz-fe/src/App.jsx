import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import Landing    from '@/pages/Landing'
import Login      from '@/pages/Login'
import Register   from '@/pages/Register'
import JoinPin    from '@/pages/JoinPin'
import Dashboard  from '@/pages/Dashboard'
import QuizEditor from '@/pages/QuizEditor'
import HostRoom   from '@/pages/HostRoom'
import QuizRoom   from '@/pages/QuizRoom'
import NotFound   from '@/pages/NotFound'

// ============================================================
// APP ROOT — Router + Providers + Toaster
// ------------------------------------------------------------
// Struktur:
//   <BrowserRouter>
//     <AuthProvider>     ← butuh useNavigate, jadi di dalam Router
//       <Routes>
//         ...
//       </Routes>
//       <Toaster />
//     </AuthProvider>
//   </BrowserRouter>
// ============================================================

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ----- PUBLIC ----- */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join"     element={<JoinPin />} />

          {/* Player live room — public, nickname dari state/location */}
          <Route path="/play/:uuid" element={<QuizRoom />} />

          {/* ----- TEACHER / ADMIN ----- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/:uuid/edit"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <QuizEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/:uuid"
            element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <HostRoom />
              </ProtectedRoute>
            }
          />

          {/* ----- ALIAS ----- */}
          <Route path="/home"   element={<Navigate to="/" replace />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />

          {/* ----- 404 ----- */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* ----------- GLOBAL TOASTER ----------- */}
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0E0E0C',
              color: '#FAFAF7',
              border: '1px solid #1F1F1B',
              borderRadius: '2px',
              fontSize: '13px',
              fontFamily: 'Geist, system-ui, sans-serif',
              padding: '12px 16px',
              boxShadow: '4px 4px 0 rgba(8,8,6,0.18)',
            },
            success: {
              iconTheme: { primary: '#F58A00', secondary: '#0E0E0C' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FAFAF7' },
              style: {
                background: '#0E0E0C',
                color: '#FAFAF7',
                border: '1px solid #EF4444',
                borderRadius: '2px',
                fontSize: '13px',
              },
            },
            loading: {
              iconTheme: { primary: '#F58A00', secondary: '#0E0E0C' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
