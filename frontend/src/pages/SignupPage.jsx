import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { authAPI, setToken } from '../services/api'

const SignupPage = () => {
  const navigate = useNavigate()
  const [form,          setForm]          = useState({ name: '', email: '', password: '', confirm: '' })
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword,  setShowPassword]  = useState(false)
  const [focused,       setFocused]       = useState(null)
  const [mounted,       setMounted]       = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(userCred.user, { displayName: form.name })
      const data = await authAPI.register(form.name, form.email, form.password)
      setToken(data.token)
      navigate('/login')
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim())
    } finally { setLoading(false) }
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
    } finally { setGoogleLoading(false) }
  }

  const strength   = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#10b981'][strength]

  const inputStyle = (name) => ({
    width: '100%',
    background: focused === name ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${focused === name ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(6,182,212,0.12)' : 'none',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
  })

  return (
    <div className="min-h-screen bg-[#020817] flex overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes slideInLeft2 { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight2 { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes floatY2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        ::placeholder { color: rgba(100,116,139,0.6); }
        .feat-row { transition: all 0.25s ease; }
        .feat-row:hover { padding-left: 6px; }
        .feat-row:hover .feat-icon { transform: scale(1.15) rotate(5deg); }
        .feat-icon { transition: transform 0.25s ease; }
      `}</style>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ animation: mounted ? 'slideInLeft2 0.7s ease forwards' : 'none' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#04152b] via-[#020817] to-[#020817]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-500/8 blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-500/6 blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

        {/* Floating icons */}
        <div className="absolute top-1/4 left-12 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl opacity-25"
          style={{ animation: 'floatY2 4s ease-in-out infinite', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>⚡</div>
        <div className="absolute bottom-1/4 right-14 w-10 h-10 rounded-xl flex items-center justify-center text-xl opacity-20"
          style={{ animation: 'floatY2 5s ease-in-out 0.8s infinite', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>🔄</div>

        <div className="relative z-10 px-12">
          <div className="flex items-center gap-3 mb-12 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-60 blur-sm group-hover:opacity-90 transition-all duration-500" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div>
              <span className="font-black text-2xl text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
                AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span>
              </span>
              <div className="text-[10px] text-cyan-400/50 tracking-[0.2em] uppercase">Adaptive Learning</div>
            </div>
          </div>

          <h2 className="font-black text-4xl text-white mb-4 leading-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
            Start your adaptive<br />learning journey
          </h2>
          <p className="text-slate-500 text-base leading-relaxed mb-10">
            Create your free account and let XGBoost AI tailor every quiz window to your unique performance profile.
          </p>

          <div className="space-y-3">
            {[
              { icon: '🧠', text: 'AI-personalised 20-question quizzes'   },
              { icon: '⚡', text: 'Per-window difficulty adaptation'       },
              { icon: '🔄', text: 'Resume quizzes after refresh'          },
              { icon: '🏆', text: 'Real-time global leaderboards'         },
              { icon: '🔐', text: 'Google Sign-In supported'              },
            ].map((f, i) => (
              <div key={i} className="feat-row flex items-center gap-3 group">
                <div className="feat-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.22)' }}>
                  {f.icon}
                </div>
                <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative"
        style={{ animation: mounted ? 'slideInRight2 0.7s ease forwards' : 'none' }}>
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.08),transparent)]" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="font-black text-xl text-white" style={{ fontFamily: "'Syne',sans-serif" }}>
              AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span>
            </span>
          </div>

          <h1 className="font-black text-3xl text-white mb-1" style={{ fontFamily: "'Syne',sans-serif" }}>Create account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors underline underline-offset-2">Log in</Link>
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white font-bold rounded-xl transition-all duration-300 disabled:opacity-60 hover:shadow-xl hover:shadow-white/15 hover:scale-[1.01] active:scale-[0.99] mb-6 text-slate-800 text-sm"
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
            <div className="mb-5 px-4 py-3.5 rounded-xl flex items-center gap-2 text-red-400 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name',  type: 'text',  placeholder: 'John Doe'       },
              { label: 'Email',     name: 'email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ display:'block',fontSize:'10px',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:'8px' }}>{label}</label>
                <input type={type} name={name} value={form[name]} onChange={handleChange} required placeholder={placeholder}
                  onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
                  style={inputStyle(name)} />
              </div>
            ))}

            {/* Password with strength */}
            <div>
              <label style={{ display:'block',fontSize:'10px',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:'8px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} required placeholder="Min. 6 characters"
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('password'), paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#64748b',transition:'color 0.2s' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3].map(level => (
                      <div key={level} className="flex-1 h-1 rounded-full transition-all duration-400"
                        style={{ background: strength >= level ? strengthColor : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '10px', color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display:'block',fontSize:'10px',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.15em',marginBottom:'8px' }}>Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm}
                onChange={handleChange} required placeholder="Re-enter password"
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                style={inputStyle('confirm')} />
              {form.confirm && form.password !== form.confirm && (
                <p style={{ color: '#f87171', fontSize: '11px', marginTop: '4px' }}>Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="relative w-full py-4 rounded-xl font-bold text-white overflow-hidden disabled:opacity-60 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', boxShadow: '0 4px 20px rgba(6,182,212,0.2)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 32px rgba(6,182,212,0.4)' }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.2)'}
            >
              <span className="relative flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</>
                ) : 'Create Account →'}
              </span>
            </button>
          </form>

          <p className="text-center text-slate-700 text-xs mt-6 leading-relaxed">
            By signing up, you agree to our{' '}
            <span className="text-cyan-500/60 cursor-pointer hover:text-cyan-400 transition-colors">Terms of Service</span>
            {' '}and{' '}
            <span className="text-cyan-500/60 cursor-pointer hover:text-cyan-400 transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage