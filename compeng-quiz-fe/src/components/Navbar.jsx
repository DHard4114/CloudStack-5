import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, Menu, X, User, LayoutGrid, Radio, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { initials } from '@/utils/format'
import { cn } from '@/utils/cn'

// ============================================================
// Navbar — Editorial sticky header
// ============================================================

const Navbar = () => {
  const { user, isAuthenticated, isTeacher, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen]       = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  const navLinks = isTeacher
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { to: '/quizzes',   label: 'Kuis Saya', icon: BookOpen },
        { to: '/sessions',  label: 'Sesi Live', icon: Radio },
      ]
    : [
        { to: '/join',      label: 'Gabung Kuis', icon: Radio },
        { to: '/history',   label: 'Riwayat',     icon: LayoutGrid },
      ]

  return (
    <header className="sticky top-0 z-40 bg-ink-50/85 backdrop-blur-lg border-b border-ink-200">
      <div className="container-editorial flex items-center justify-between h-16">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-9 h-9 bg-ink-900 flex items-center justify-center rounded-sm overflow-hidden">
              <span className="font-display text-flame-400 text-lg font-bold leading-none -translate-y-px">QL</span>
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-flame-500 rounded-full
                             ring-2 ring-ink-50 animate-blink" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-base text-ink-900 font-semibold tracking-editorial">QuizLive</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">CompEng / v1.0</span>
          </div>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  'px-4 py-2 text-sm font-medium tracking-tight rounded-sm transition-all',
                  'flex items-center gap-2',
                  isActive
                    ? 'text-ink-900 bg-ink-100'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100/60'
                )}
              >
                <link.icon size={14} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-sm hover:bg-ink-100 transition"
              >
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium text-ink-900">{user?.username || user?.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                    {user?.role || 'user'}
                  </span>
                </div>
                <div className="w-9 h-9 bg-flame-500 text-ink-900 font-display font-semibold
                                flex items-center justify-center rounded-sm text-sm">
                  {initials(user?.username || user?.name || 'U')}
                </div>
              </button>

              {userMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-ink-900
                                  shadow-brutal rounded-sm py-2 z-40 animate-fade-in">
                    <div className="px-4 py-3 border-b border-ink-200">
                      <p className="text-sm font-medium text-ink-900">{user?.email}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500 mt-1">
                        ID: {user?.uuid?.slice(0, 8) || user?.id || '—'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setUserMenu(false); navigate('/profile') }}
                      className="w-full px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-100
                                 flex items-center gap-3"
                    >
                      <User size={14} /> Profil
                    </button>
                    <button
                      onClick={() => { setUserMenu(false); logout() }}
                      className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-ink-100
                                 flex items-center gap-3"
                    >
                      <LogOut size={14} /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost">Masuk</Link>
              <Link to="/register" className="btn-primary">Daftar</Link>
            </>
          )}

          {/* Mobile toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-sm hover:bg-ink-100"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {open && isAuthenticated && (
        <div className="md:hidden border-t border-ink-200 bg-ink-50 animate-slide-up">
          <div className="container-editorial py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  'px-4 py-3 text-sm font-medium rounded-sm flex items-center gap-3',
                  isActive ? 'bg-ink-900 text-ink-50' : 'text-ink-700'
                )}
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
