'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.message || 'Failed to reset password. Token may be expired.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (invalidToken) {
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
              Invalid Link
            </h1>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="text-zinc-400 text-sm">
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
            Reset Password
          </h1>
          <p className="text-zinc-400 text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Password Reset Successful!</h3>
              <p className="text-zinc-400 text-sm">
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
                <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
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
