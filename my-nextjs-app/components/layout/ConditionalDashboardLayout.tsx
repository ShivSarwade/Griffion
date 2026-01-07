'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar, Navbar } from '@/components/layout'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { selectUser, selectIsAuthenticated, selectAccessToken, logout } from '@/lib/redux/slices/authSlice'
import { selectNavigation } from '@/lib/redux/slices/navigationSlice'
import { selectTheme, selectSidebarOpen, toggleTheme, toggleSidebar } from '@/lib/redux/slices/configSlice'
import { fetchNavigation } from '@/lib/redux/thunks'

// Check if JWT token is expired
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() >= expirationTime
  } catch (error) {
    return true // If we can't parse, consider it expired
  }
}

// Routes that should NOT have sidebar/navbar (public routes only)
const PUBLIC_ROUTES = [
  '/',                    // Landing page
  '/login',               // Login page
  '/register',            // Default registration page
  '/forgot-password',     // Forgot password page
  '/reset-password'       // Reset password page
]

// Check if route matches role-based registration pattern: /admin/register, /manager/register, etc.
const isRoleRegistrationRoute = (pathname: string): boolean => {
  return /^\/[^/]+\/register\/?$/.test(pathname)
}

export function ConditionalDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const accessToken = useAppSelector(selectAccessToken)
  const navTree = useAppSelector(selectNavigation) || []
  const isSidebarOpen = useAppSelector(selectSidebarOpen)
  const theme = useAppSelector(selectTheme)
  
  const [mounted, setMounted] = useState(false)

  // Check if current route is public (no sidebar/navbar)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || isRoleRegistrationRoute(pathname)
  const isDashboardRoute = !isPublicRoute

  useEffect(() => {
    setMounted(true)
    
    // Only check auth and fetch nav for dashboard routes
    if (isDashboardRoute) {
      // Check if token is expired
      if (isTokenExpired(accessToken)) {
        dispatch(logout())
        router.push('/login')
        return
      }
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      dispatch(fetchNavigation())
    }
  }, [router, isAuthenticated, accessToken, dispatch, isDashboardRoute, pathname])
  
  // Periodic token expiration check (every 30 seconds)
  useEffect(() => {
    if (!isDashboardRoute) return
    
    const interval = setInterval(() => {
      if (isTokenExpired(accessToken)) {
        dispatch(logout())
        router.push('/login')
      }
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [isDashboardRoute, accessToken, dispatch, router])

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  // For public routes, just render children (full page)
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For dashboard routes, redirect to login if not authenticated or token expired
  if (isDashboardRoute && (!isAuthenticated || isTokenExpired(accessToken))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // For dashboard routes, show loading if not ready
  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Dashboard layout with sidebar and navbar for ALL authenticated routes
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
          {children}
        </main>
      </div>
    </div>
  )
}
