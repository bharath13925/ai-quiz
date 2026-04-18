import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar   from '../components/Navbar'
import Features from '../components/Features'
import FAQ      from '../components/FAQ'
import Contact  from '../components/Contact'
import Footer   from '../components/Footer'

// Floating particle
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      ...style,
      animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
    }}
  />
)

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  key: i,
  style: {
    left: `${Math.random() * 100}%`,
    top:  `${Math.random() * 100}%`,
    width:  `${2 + Math.random() * 3}px`,
    height: `${2 + Math.random() * 3}px`,
    background: i % 3 === 0 ? 'rgba(6,182,212,0.6)' : i % 3 === 1 ? 'rgba(59,130,246,0.5)' : 'rgba(139,92,246,0.4)',
    animationDelay: `${Math.random() * 3}s`,
  },
}))

const AuthCard = ({ type }) => {
  const navigate = useNavigate()
  const isSignup = type === 'signup'
  return (
    <div
      onClick={() => navigate(isSignup ? '/signup' : '/login')}
      className={`group flex-1 rounded-3xl p-8 border transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden relative ${
        isSignup
          ? 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-violet-600/10 border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-500/20'
          : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      {isSignup && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
          isSignup
            ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/40'
            : 'bg-white/5 border border-white/10 group-hover:bg-white/10'
        }`}>
          <svg className={`w-7 h-7 ${isSignup ? 'text-cyan-300' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSignup
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            }
          </svg>
        </div>
        <h3 className="font-black text-2xl text-white mb-2">{isSignup ? 'Create Account' : 'Welcome Back'}</h3>
        <p className={`text-sm mb-6 leading-relaxed ${isSignup ? 'text-slate-300' : 'text-slate-500'}`}>
          {isSignup
            ? 'Join thousands of learners. Start your adaptive quiz journey today — free forever.'
            : 'Continue your learning streak. Your AI is waiting with a personalised quiz.'}
        </p>
        <div className={`flex items-center gap-2 text-sm font-bold ${isSignup ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
          {isSignup ? 'Get started free' : 'Log in now'}
          <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const TypewriterText = ({ texts }) => {
  const [currentText, setCurrentText] = useState('')
  const [textIndex, setTextIndex]     = useState(0)
  const [charIndex, setCharIndex]     = useState(0)
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => {
    const target = texts[textIndex]
    const delay  = deleting ? 40 : 90

    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIndex < target.length) {
          setCurrentText(target.slice(0, charIndex + 1))
          setCharIndex(c => c + 1)
        } else {
          setTimeout(() => setDeleting(true), 2000)
        }
      } else {
        if (charIndex > 0) {
          setCurrentText(target.slice(0, charIndex - 1))
          setCharIndex(c => c - 1)
        } else {
          setDeleting(false)
          setTextIndex(i => (i + 1) % texts.length)
        }
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [charIndex, deleting, textIndex, texts])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
      {currentText}
      <span className="text-cyan-400 animate-pulse">|</span>
    </span>
  )
}

const LandingPage = () => {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Inject keyframes
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        from { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
        to   { transform: translateY(-20px) rotate(10deg); opacity: 0.8; }
      }
      @keyframes slideUp {
        from { transform: translateY(40px); opacity: 0; }
        to   { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeInScale {
        from { transform: scale(0.95); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
      }
      @keyframes borderPulse {
        0%, 100% { border-color: rgba(6,182,212,0.2); }
        50%       { border-color: rgba(6,182,212,0.5); }
      }
      @keyframes scanLine {
        0%   { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div className="min-h-screen bg-[#020817] overflow-x-hidden">
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          to   { transform: translateY(-20px) rotate(10deg); opacity: 0.7; }
        }
      `}</style>
      <Navbar />

      {/* ── Hero ── */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#04111f] to-[#020817]" />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Radial glow center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.12),transparent)]" />

          {/* Particles */}
          {PARTICLES.map((p) => <Particle key={p.key} style={p.style} />)}

          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/4 blur-[120px]" />
        </div>

        <div className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/25 rounded-full px-5 py-2 mb-8 backdrop-blur-sm"
            style={{ animation: 'fadeInScale 0.8s ease forwards' }}>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            🤖 AI-Powered Adaptive Learning
          </div>

          {/* Main heading */}
          <h1 className="font-black text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6 tracking-tight"
            style={{ animation: 'slideUp 0.9s ease forwards 0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Master CS with
            <br />
            <TypewriterText texts={['Intelligence', 'Precision', 'Adaptivity', 'XGBoost AI']} />
          </h1>

          {/* Subtext */}
          <p
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ animation: 'slideUp 0.9s ease forwards 0.4s', opacity: 0, animationFillMode: 'forwards' }}
          >
            Our XGBoost AI adapts difficulty every 5 questions based on your accuracy, speed, and streaks.
            20 questions per session. Firebase UID synced to MongoDB. Resume anytime.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            style={{ animation: 'slideUp 0.9s ease forwards 0.6s', opacity: 0, animationFillMode: 'forwards' }}
          >
            <button
              onClick={() => navigate('/signup')}
              className="group relative px-8 py-4 font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all group-hover:from-cyan-400 group-hover:to-blue-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
              <span className="relative flex items-center gap-2">
                Start Learning — Free
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-4 text-white border border-white/15 hover:border-cyan-400/40 hover:bg-white/5 font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center gap-2">
                See How It Works
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12"
            style={{ animation: 'slideUp 0.9s ease forwards 0.8s', opacity: 0, animationFillMode: 'forwards' }}
          >
            {[
              { value: '4+',      label: 'CS Topics',        icon: '📚' },
              { value: 'XGBoost', label: 'AI Engine',        icon: '🧠' },
              { value: '20 Qs',   label: 'Per Session',      icon: '📊' },
              { value: '5-Q',     label: 'Adaptive Windows', icon: '⚡' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">{stat.value}</div>
                <div className="text-slate-500 text-xs uppercase tracking-widest mt-1 group-hover:text-slate-400 transition-colors">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-600 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      <Features />

      {/* ── Auth cards ── */}
      <section className="relative bg-[#030f1f] py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(6,182,212,0.06),transparent)]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Get Started
            </div>
            <h2 className="font-black text-5xl md:text-6xl text-white mb-5">
              Join or{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Continue
              </span>
            </h2>
            <p className="text-slate-400 text-lg">New here? Sign up free. Already a member? Log in to resume.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-5">
            <AuthCard type="signup" />
            <AuthCard type="login" />
          </div>
        </div>
      </section>

      <FAQ />
      <Contact />
      <Footer />
    </div>
  )
}

export default LandingPage