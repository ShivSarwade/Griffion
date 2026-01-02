'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setCredentials, setError, setLoading } from '@/lib/redux/slices/authSlice'
import { selectAuthLoading, selectAuthError } from '@/lib/redux/slices/authSlice'
import * as api from '@/lib/apiService'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    totpToken: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [primaryIdentifier, setPrimaryIdentifier] = useState<'email' | 'username' | 'both'>('email')
  const [backendConfig, setBackendConfig] = useState<any>(null)
  const [validationError, setValidationError] = useState('')

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUsername = (username: string): boolean => {
    // Username rules: 3-30 chars, alphanumeric + underscore/hyphen, no spaces
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    return usernameRegex.test(username)
  }

  const validateIdentifier = (identifier: string): string => {
    if (!identifier.trim()) {
      return 'This field is required'
    }

    if (primaryIdentifier === 'email') {
      if (!validateEmail(identifier)) {
        return 'Please enter a valid email address'
      }
    } else if (primaryIdentifier === 'username') {
      if (!validateUsername(identifier)) {
        return 'Username must be 3-30 characters, letters, numbers, underscore or hyphen only'
      }
    } else if (primaryIdentifier === 'both') {
      // For 'both' mode, validate based on whether it looks like email or username
      if (identifier.includes('@')) {
        if (!validateEmail(identifier)) {
          return 'Please enter a valid email address'
        }
      } else {
        if (!validateUsername(identifier)) {
          return 'Username must be 3-30 characters, letters, numbers, underscore or hyphen only'
        }
      }
    }

    return ''
  }

  useEffect(() => {
    // Check for frontend override - default to email, only use username if explicitly set
    const envPrimaryIdentifier = process.env.NEXT_PUBLIC_PRIMARY_IDENTIFIER as 'email' | 'username' | 'both' | undefined

    if (envPrimaryIdentifier === 'username' || envPrimaryIdentifier === 'both') {
      // Explicitly set to username or both mode
      setPrimaryIdentifier(envPrimaryIdentifier)
    } else {
      // Default to email mode
      setPrimaryIdentifier('email')
    }

    // Still fetch backend config for other features (2FA, password recovery, etc.)
    const fetchConfig = async () => {
      const response = await api.getHealth()
      if (response.success && response.data) {
        setBackendConfig(response.data)
        // Don't override primaryIdentifier from backend - use frontend setting
      }
    }
    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setError(null))
    setValidationError('')

    // Validate identifier before submitting
    const identifierValidation = validateIdentifier(formData.identifier)
    if (identifierValidation) {
      setValidationError(identifierValidation)
      return
    }

    dispatch(setLoading(true))

    try {
      // Prepare credentials based on primary identifier
      const credentials: any = {
        password: formData.password,
      }

      if (primaryIdentifier === 'email') {
        credentials.email = formData.identifier
      } else if (primaryIdentifier === 'username') {
        credentials.username = formData.identifier
      } else if (primaryIdentifier === 'both') {
        // Backend will determine if it's email or username
        if (formData.identifier.includes('@')) {
          credentials.email = formData.identifier
        } else {
          credentials.username = formData.identifier
        }
      }

      if (requires2FA && formData.totpToken) {
        credentials.totpToken = formData.totpToken
      }

      const response = await api.login(credentials)

      if (response.success && response.data) {
        // Check if 2FA is required
        if (response.data.requires2FA && !requires2FA) {
          setRequires2FA(true)
          dispatch(setError('Two-factor authentication is enabled. Please enter your 6-digit code.'))
          dispatch(setLoading(false))
          return
        }

        // Store in Redux (auto-persisted)
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken
        }))
        
        router.push('/dashboard')
      } else {
        // Check for 2FA-specific error messages
        const errorMsg = response.error || 'Invalid credentials'
        const requires2FAMessages = [
          'requires otp',
          'requires 2fa',
          'totp required',
          'otp required',
          '2fa required',
          'two-factor authentication required',
          'invalid totp',
          'invalid otp'
        ]
        
        const needs2FA = requires2FAMessages.some(msg => 
          errorMsg.toLowerCase().includes(msg)
        )
        
        if (needs2FA && !requires2FA) {
          setRequires2FA(true)
          dispatch(setError('Two-factor authentication required. Please enter your 6-digit code.'))
        } else {
          dispatch(setError(errorMsg))
        }
        
        dispatch(setLoading(false))
      }
    } catch (err: any) {
      // Check if error message indicates 2FA is needed
      const errorMsg = err?.message || 'An error occurred. Please try again.'
      const requires2FAMessages = [
        'requires otp',
        'requires 2fa',
        'totp required',
        'otp required',
        '2fa required',
        'two-factor authentication required'
      ]
      
      const needs2FA = requires2FAMessages.some(msg => 
        errorMsg.toLowerCase().includes(msg)
      )
      
      if (needs2FA && !requires2FA) {
        setRequires2FA(true)
        dispatch(setError('Two-factor authentication required. Please enter your 6-digit code.'))
      } else {
        dispatch(setError(errorMsg))
      }
      
      dispatch(setLoading(false))
    }
  }

  // Handle identifier input change with validation
  const handleIdentifierChange = (value: string) => {
    setFormData({ ...formData, identifier: value })
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">
              <ShieldCheck size={28} />
            </div>
            <span className="font-black tracking-tighter text-3xl uppercase italic text-white">Griffion</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-400 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">
                {primaryIdentifier === 'email' ? 'Email Address' : 
                 primaryIdentifier === 'username' ? 'Username' : 
                 'Email or Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {primaryIdentifier === 'username' ? 
                    <User size={18} className="text-zinc-500" /> : 
                    <Mail size={18} className="text-zinc-500" />
                  }
                </div>
                <input
                  type={primaryIdentifier === 'email' ? 'email' : 'text'}
                  required
                  value={formData.identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors ${
                    validationError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'
                  }`}
                  placeholder={
                    primaryIdentifier === 'email' ? 'you@example.com' : 
                    primaryIdentifier === 'username' ? 'username' : 
                    'username or email'
                  }
                />
              </div>
              {validationError && (
                <p className="text-red-400 text-xs mt-1">{validationError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {requires2FA && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-zinc-300">
                    Two-Factor Authentication Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false)
                      setFormData({ ...formData, totpToken: '' })
                      dispatch(setError(null))
                    }}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck size={18} className="text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    required={requires2FA}
                    value={formData.totpToken}
                    onChange={(e) => setFormData({ ...formData, totpToken: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-indigo-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-lg tracking-widest text-center"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                <span>Remember me</span>
              </label>
              {backendConfig?.enablePasswordRecovery && (
                <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Forgot password?
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
