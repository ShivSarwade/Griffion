'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Menu, Sun, Moon, User, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { selectUser, selectIsAuthenticated, logout } from '@/lib/redux/slices/authSlice'
import { selectTheme, toggleTheme } from '@/lib/redux/slices/configSlice'

export default function HomePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const theme = useAppSelector(selectTheme)
  
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      {/* Navigation Bar */}
      <nav className="h-16 backdrop-blur-xl border-b sticky top-0 z-40 px-4 md:px-8 shadow-sm" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="h-full flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">
              <ShieldCheck size={20} />
            </div>
            <span className="font-black tracking-tighter text-xl uppercase italic" style={{ color: 'var(--color-foreground)' }}>Griffion</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Dashboard
            </Link>

            <button 
              onClick={handleToggleTheme}
              className="p-2 rounded-xl transition-all shadow-sm hover:shadow"
              style={{ color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-amber-500" />
              ) : (
                <Moon size={20} className="text-indigo-600" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all"
                style={{ backgroundColor: 'var(--color-muted)', borderColor: 'var(--color-border)' }}
              >
                <User size={18} style={{ color: 'var(--color-muted-foreground)' }} />
                <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--color-foreground)' }}>
                  {user.firstName}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-20" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(254, 226, 226, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight" style={{ color: 'var(--color-foreground)' }}>
            Home
          </h1>
          <div className="w-24 h-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/20" />
          <p className="text-sm font-medium mt-8 max-w-md" style={{ color: 'var(--color-muted-foreground)' }}>
            Welcome to your application home page, {user.firstName}.
          </p>
        </div>
      </main>
    </div>
  )
}
