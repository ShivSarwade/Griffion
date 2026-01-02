'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { setCredentials, setError, setLoading } from '@/lib/redux/slices/authSlice'
import { selectAuthLoading, selectAuthError } from '@/lib/redux/slices/authSlice'
import { selectTheme } from '@/lib/redux/slices/configSlice'
import * as api from '@/lib/apiService'

export default function DynamicRegisterPage() {
  const router = useRouter()
  const params = useParams()
  const role = params.role as string
  const dispatch = useAppDispatch()
  
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const theme = useAppSelector(selectTheme)
  
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    identifier: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [validationErrors, setValidationErrors] = React.useState<{[key: string]: string}>({})

  const primaryIdentifier = process.env.NEXT_PUBLIC_PRIMARY_IDENTIFIER || 'email'

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    return usernameRegex.test(username)
  }

  const validatePassword = (password: string): string => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
    if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Password must contain at least one special character'
    return ''
  }

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {}

    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    
    if (!formData.identifier.trim()) {
      errors.identifier = 'This field is required'
    } else {
      if (primaryIdentifier === 'email') {
        if (!validateEmail(formData.identifier)) errors.identifier = 'Please enter a valid email address'
      } else if (primaryIdentifier === 'username') {
        if (!validateUsername(formData.identifier)) errors.identifier = 'Username must be 3-30 characters'
      } else if (primaryIdentifier === 'both') {
        if (formData.identifier.includes('@')) {
          if (!validateEmail(formData.identifier)) errors.identifier = 'Please enter a valid email address'
        } else {
          if (!validateUsername(formData.identifier)) errors.identifier = 'Username must be 3-30 characters'
        }
      }
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) errors.password = passwordError
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setError(null))

    if (!validateForm()) return

    dispatch(setLoading(true))

    const registrationData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      role: role, // Dynamic role from URL
    }

    if (primaryIdentifier === 'email') {
      registrationData.email = formData.identifier
    } else if (primaryIdentifier === 'username') {
      registrationData.username = formData.identifier
    } else if (primaryIdentifier === 'both') {
      if (formData.identifier.includes('@')) {
        registrationData.email = formData.identifier
      } else {
        registrationData.username = formData.identifier
      }
    }

    const response = await api.register(registrationData)

    if (response.success) {
      router.push('/login?message=Registration successful! Please log in.')
    } else {
      dispatch(setError(response.error || 'Registration failed'))
    }
    
    dispatch(setLoading(false))
  }

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: '' })
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
            <span className="font-black tracking-tighter text-3xl uppercase italic" style={{ color: 'var(--color-foreground)' }}>
              {process.env.NEXT_PUBLIC_APP_NAME || 'Griffion'}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-2" style={{ color: 'var(--color-foreground)' }}>
            Register as {role.charAt(0).toUpperCase() + role.slice(1)}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Create your account to get started</p>
        </div>

        <div className="rounded-2xl p-8 shadow-xl border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-card-foreground)' }}>First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    validationErrors.firstName ? 'border-red-500' : 'focus:border-indigo-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)', borderColor: validationErrors.firstName ? undefined : 'var(--color-border)' }}
                  placeholder="John"
                />
                {validationErrors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-card-foreground)' }}>Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    validationErrors.lastName ? 'border-red-500' : 'focus:border-indigo-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)', borderColor: validationErrors.lastName ? undefined : 'var(--color-border)' }}
                  placeholder="Doe"
                />
                {validationErrors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-card-foreground)' }}>
                {primaryIdentifier === 'email' ? 'Email Address' : 
                 primaryIdentifier === 'username' ? 'Username' : 'Email or Username'}
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
                  onChange={(e) => handleFieldChange('identifier', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    validationErrors.identifier ? 'border-red-500' : 'focus:border-indigo-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)', borderColor: validationErrors.identifier ? undefined : 'var(--color-border)' }}
                  placeholder={primaryIdentifier === 'email' ? 'you@example.com' : primaryIdentifier === 'username' ? 'username' : 'username or email'}
                />
              </div>
              {validationErrors.identifier && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-card-foreground)' }}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    validationErrors.password ? 'border-red-500' : 'focus:border-indigo-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)', borderColor: validationErrors.password ? undefined : 'var(--color-border)' }}
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
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-card-foreground)' }}>Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-zinc-500" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg placeholder-zinc-500 focus:outline-none focus:ring-1 ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'focus:border-indigo-500'
                  }`}
                  style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)', borderColor: validationErrors.confirmPassword ? undefined : 'var(--color-border)' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
