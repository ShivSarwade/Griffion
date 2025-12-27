'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Menu, Sun, Moon, User, LogOut } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (!token) {
        router.push('/login')
        return
      }

      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('theme', theme)
    }
  }, [theme])

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-gradient-to-br from-zinc-50 via-white to-zinc-100/50 text-zinc-900'}`}>
      {/* Navigation Bar */}
      <nav className="h-16 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0 z-40 px-4 md:px-8 shadow-sm shadow-zinc-900/5 dark:shadow-none">
        <div className="h-full flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 transform -rotate-3">
              <ShieldCheck size={20} />
            </div>
            <span className="font-black tracking-tighter text-xl uppercase italic text-zinc-900 dark:text-white">Griffion</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Dashboard
            </Link>

            <button 
              onClick={handleToggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200/50 dark:border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow"
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
              >
                <User size={18} className="text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hidden sm:block">
                  {user.firstName}
                </span>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-20">
                    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight text-zinc-900 dark:text-zinc-100">
            Home
          </h1>
          <div className="w-24 h-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20" />
          <p className="text-zinc-600 dark:text-zinc-500 text-sm font-medium mt-8 max-w-md">
            Welcome to your application home page, {user.firstName}.
          </p>
        </div>
      </main>
    </div>
  )
}
