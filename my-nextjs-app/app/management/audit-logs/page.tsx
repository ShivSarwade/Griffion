'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Navbar, DEFAULT_NAV_TREE } from '@/components/layout'

export default function AuditLogsPage() {
  const router = useRouter()
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

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

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-gradient-to-br from-zinc-50 via-white to-zinc-100/50 text-zinc-900'}`}>
      <Sidebar 
        navTree={DEFAULT_NAV_TREE}
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 p-8 md:p-16">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight text-zinc-900 dark:text-zinc-100">
              Audit Logs
            </h1>
            <div className="w-24 h-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20" />
            <p className="text-zinc-600 dark:text-zinc-500 text-sm font-medium mt-8 max-w-md">
              View system activity and security logs.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
