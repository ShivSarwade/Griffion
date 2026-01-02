'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, Navbar } from '@/components/layout'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { selectUser, selectIsAuthenticated } from '@/lib/redux/slices/authSlice'
import { selectNavigation } from '@/lib/redux/slices/navigationSlice'
import { selectTheme, selectSidebarOpen, toggleTheme, toggleSidebar } from '@/lib/redux/slices/configSlice'
import { fetchNavigation } from '@/lib/redux/thunks'

export default function UserDirectoryPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const navTree = useAppSelector(selectNavigation) || []
  const isSidebarOpen = useAppSelector(selectSidebarOpen)
  const theme = useAppSelector(selectTheme)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    dispatch(fetchNavigation())
  }, [router, isAuthenticated, dispatch])

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
      <Sidebar 
        navTree={navTree}
        user={user}
        isOpen={isSidebarOpen}
        onClose={handleToggleSidebar}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 p-8 md:p-16">
          <div className="max-w-4xl space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight text-zinc-900 dark:text-zinc-100">
              User Directory
            </h1>
            <div className="w-24 h-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20" />
            <p className="text-zinc-600 dark:text-zinc-500 text-sm font-medium mt-8 max-w-md">
              Manage and view all users in your organization.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
