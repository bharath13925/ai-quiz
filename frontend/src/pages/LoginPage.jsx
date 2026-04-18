import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { authAPI, setToken } from '../services/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [form,          setForm]          = useState({ email: '', password: '' })
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword,  setShowPassword]  = useState(false)
  const [focused,       setFocused]       = useState(null)

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password)
      const data = await authAPI.login(form.email, form.password)
      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim())
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true); setError('')
    try {
      const result  = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const data    = await authAPI.firebaseSync(idToken)
      setToken(data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim())
    } finally {
      setGoogleLoading(false)
    }
  }

  const inputClass = (name) => `w-full bg-white/[0.03] border rounded-xl px-4 py-3.5 text-white placeholder-slate-600 text-sm transition-all duration-300 outline-none ${
    focused === name
      ? 'border-cyan-500/60 bg-cyan-500/5 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
      : 'border-slate-800 hover:border-slate-700'
  }`

  return (
    <div className="min-h-screen bg-[#020817] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#04152b] via-[#020817] to-[#020817]" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        {/* Orbs */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/8 blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-blue-500/8 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        {/* Right border */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

        <div className="relative z-10 text-center px-12">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center mb-12 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-black text-2xl text-white">AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span></span>
              <div className="text-[10px] text-cyan-400/50 tracking-[0.2em] uppercase">Adaptive Learning</div>
            </div>
          </div>

          <h2 className="font-black text-4xl text-white mb-4 leading-tight">Welcome back,<br />ready to level up?</h2>
          <p className="text-slate-500 text-base leading-relaxed mb-12">Your AI is waiting. Log in to get a personalised 20-question quiz based on your latest performance.</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🧠', label: 'XGBoost AI',   sub: 'Adaptive engine' },
              { icon: '⚡', label: '20 Questions',  sub: 'Per session' },
              { icon: '📊', label: 'Live Stats',    sub: 'Real-time tracking' },
              { icon: '🏆', label: 'Leaderboard',   sub: 'Global rankings' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-all duration-300 group text-left">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-white text-sm font-bold">{item.label}</div>
                <div className="text-slate-600 text-xs">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile bg */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.08),transparent)]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-black text-xl text-white">AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span></span>
          </div>

          <h1 className="font-black text-3xl text-white mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">Sign up free</Link>
          </p>

          {/* Google btn */}
          <button
            onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-all mb-6 disabled:opacity-60 hover:shadow-xl hover:shadow-white/10 hover:scale-[1.01]"
          >
            {googleLoading
              ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              : <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            }
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-slate-600 text-xs uppercase tracking-widest">or email</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {error && (
            <div className="mb-5 px-4 py-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com"
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                className={inputClass('email')}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} required placeholder="Your password"
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className={`${inputClass('password')} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="relative w-full py-3.5 rounded-xl font-bold text-white overflow-hidden group disabled:opacity-60 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
              <span className="relative flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Logging in...</>
                  : 'Log In →'
                }
              </span>
            </button>
          </form>

          <p className="text-center text-slate-700 text-xs mt-8 flex items-center justify-center gap-2">
            <span>🔐</span> Protected by Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage