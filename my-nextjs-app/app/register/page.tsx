'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setCredentials, setError, setLoading, selectIsAuthenticated } from '@/lib/redux/slices/authSlice'
import { selectAuthLoading, selectAuthError } from '@/lib/redux/slices/authSlice'
import { selectTheme } from '@/lib/redux/slices/configSlice'
import * as api from '@/lib/apiService'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const theme = useAppSelector(selectTheme)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }

    dispatch(setLoading(false))
    dispatch(setError(null))
  }, [dispatch, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setError(null))
    setValidationError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }

    dispatch(setLoading(true))

    try {
      const registrationData: any = {
        email: formData.email,
        password: formData.password,
      }

      if (formData.firstName) registrationData.firstName = formData.firstName
      if (formData.lastName) registrationData.lastName = formData.lastName

      // Note: No role parameter = uses defaultPublicRole from backend config
      const response = await api.register(registrationData)

      if (response.success && response.data) {
        // Auto-login after successful registration
        const loginResponse = await api.login({
          email: formData.email,
          password: formData.password
        })

        if (loginResponse.success && loginResponse.data) {
          dispatch(setCredentials({
            user: loginResponse.data.user,
            accessToken: loginResponse.data.accessToken,
            refreshToken: loginResponse.data.refreshToken
          }))
          
          router.push('/dashboard')
        } else {
          // Registration successful but login failed, redirect to login
          router.push('/login')
        }
      } else {
        dispatch(setError(response.error || 'Registration failed'))
        dispatch(setLoading(false))
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'An error occurred. Please try again.'))
      dispatch(setLoading(false))
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'dark' : ''}`} style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">
              <ShieldCheck size={28} />
            </div>
            <span className="font-black tracking-tighter text-3xl uppercase italic" style={{ color: 'var(--color-foreground)' }}>Griffion</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2" style={{ color: 'var(--color-foreground)' }}>
            Create Account
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Sign up to get started</p>
        </div>

        <div className="border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
                {error}
              </div>
            )}

            {validationError && (
              <div className="px-4 py-3 rounded-lg text-sm font-medium border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
                {validationError}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)'
                  }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      backgroundColor: 'var(--color-muted)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-foreground)'
                    }}
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)'
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
