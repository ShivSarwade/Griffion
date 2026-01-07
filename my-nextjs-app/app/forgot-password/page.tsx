'use client'

import React, { useState } from 'react'
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectTheme } from '@/lib/redux/slices/configSlice'
import * as api from '@/lib/apiService'

export default function ForgotPasswordPage() {
  const theme = useAppSelector(selectTheme)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.forgotPassword(email)
      
      if (response.success) {
        setSuccess(true)
      } else {
        setError((response.error as any) || 'Failed to send reset email')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
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
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="border rounded-2xl p-8 shadow-xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <Mail size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>Check your email</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                We&apos;ve sent a password reset link to <strong style={{ color: 'var(--color-foreground)' }}>{email}</strong>
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors mt-6">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
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
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-muted-foreground)' }}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors"
                    style={{
                      backgroundColor: 'var(--color-muted)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-foreground)'
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-white uppercase italic tracking-wider transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{
                  backgroundColor: '#4f46e5',
                  boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)'
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-4">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: 'var(--color-muted-foreground)' }}>
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
