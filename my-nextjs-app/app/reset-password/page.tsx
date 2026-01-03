'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectTheme } from '@/lib/redux/slices/configSlice'
import * as api from '@/lib/apiService'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useAppSelector(selectTheme)
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  useEffect(() => {
    // Get token from URL query parameter
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setInvalidToken(true)
      setError('Invalid or missing reset token. Please request a new password reset link.')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setLoading(true)

    try {
      const response = await api.resetPassword(token, formData.newPassword)

      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(response.error || 'Failed to reset password. Token may be expired.')
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (invalidToken) {
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
              Invalid Link
            </h1>
          </div>

          <div className="border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                {error}
              </p>
              <div className="pt-4">
                <Link 
                  href="/forgot-password"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Enter your new password below
          </p>
        </div>

        <div className="border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>Password Reset Successful!</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                Your password has been reset successfully. Redirecting to login...
              </p>
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="px-4 py-3 rounded-lg text-sm font-medium border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      backgroundColor: 'var(--color-muted)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-foreground)'
                    }}
                    placeholder="Enter new password"
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
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                  Confirm New Password
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
                    placeholder="Confirm new password"
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
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div className="text-center text-sm text-zinc-400">
                Remember your password?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
