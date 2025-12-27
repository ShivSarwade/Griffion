'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, Menu, Sun, Moon, User, LogOut, ArrowRight, Lock, Users, Settings, X } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      }
    }
  }, [])

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
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // Always show public landing page

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">
                <ShieldCheck size={20} />
              </div>
              <span className="font-black tracking-tighter text-xl uppercase italic">Griffion</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors border border-zinc-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-zinc-900 border-l border-zinc-800 z-50 p-6">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-center font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-center font-medium rounded-lg transition-colors border border-zinc-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-center font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-center font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight">
              Build Your Application
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                With Confidence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
              A powerful platform for managing users, roles, and permissions with an intuitive interface and robust authentication.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link 
                href="/register"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <Link 
                href="/login"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 md:mt-32">
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Authentication</h3>
              <p className="text-zinc-400 text-sm">
                Built-in JWT authentication with 2FA support and password recovery.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Role Management</h3>
              <p className="text-zinc-400 text-sm">
                Flexible role-based access control with custom permissions and navigation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4">
                <Settings className="text-indigo-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Configuration</h3>
              <p className="text-zinc-400 text-sm">
                Customize your application with simple configuration and theming options.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">© 2025 Griffion. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">
                <ShieldCheck size={14} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
