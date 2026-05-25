import { useState, FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Lock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/utils'

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-brand-900/50 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">GRC Engineering</h1>
          <p className="text-slate-500 text-sm mt-1">Governance, Risk & Compliance Platform</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-slate-800 border text-slate-100',
                    'placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
                    'border-slate-700 focus:border-brand-500 transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm bg-slate-800 border text-slate-100',
                    'placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
                    'border-slate-700 focus:border-brand-500 transition-colors'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm',
                'bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-lg shadow-brand-900/30',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@grc.com', pw: 'Admin@2026' },
                { label: 'Analyst', email: 'analyst@grc.com', pw: 'Analyst@2026' },
              ].map(cred => (
                <button
                  key={cred.label}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pw) }}
                  className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-left"
                >
                  <span className="font-medium text-slate-300">{cred.label}</span>
                  <br />
                  <span className="text-slate-600 text-xs">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          GRC Engineering Platform · v1.0 · Enterprise Edition
        </p>
      </div>
    </div>
  )
}
