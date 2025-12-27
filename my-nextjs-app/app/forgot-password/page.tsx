'use client'

import React, { useState } from 'react'
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Mock forgot password - replace with real API call
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1000)
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
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Check your email</h3>
              <p className="text-zinc-400 text-sm">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-2 justify-center"
                >
                  <ArrowLeft size={16} />
                  Back to login
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
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link 
                  href="/login"
                  className="text-zinc-400 hover:text-zinc-300 text-sm flex items-center gap-2 justify-center"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
