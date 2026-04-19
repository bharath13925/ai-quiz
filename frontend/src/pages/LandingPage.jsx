import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar   from '../components/Navbar'
import Features from '../components/Features'
import FAQ      from '../components/FAQ'
import Contact  from '../components/Contact'
import Footer   from '../components/Footer'
import heroVideo from '../assets/video.mp4'

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  key: i,
  style: {
    left: `${Math.random() * 100}%`,
    top:  `${Math.random() * 100}%`,
    width:  `${1.5 + Math.random() * 3}px`,
    height: `${1.5 + Math.random() * 3}px`,
    background: i % 4 === 0 ? 'rgba(6,182,212,0.7)'
               : i % 4 === 1 ? 'rgba(59,130,246,0.6)'
               : i % 4 === 2 ? 'rgba(139,92,246,0.5)'
               : 'rgba(16,185,129,0.4)',
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 5}s`,
  },
}))

const TypewriterText = ({ texts }) => {
  const [currentText, setCurrentText] = useState('')
  const [textIndex,   setTextIndex]   = useState(0)
  const [charIndex,   setCharIndex]   = useState(0)
  const [deleting,    setDeleting]    = useState(false)

  useEffect(() => {
    const target = texts[textIndex]
    const delay  = deleting ? 35 : 85
    const timer  = setTimeout(() => {
      if (!deleting) {
        if (charIndex < target.length) { setCurrentText(target.slice(0, charIndex + 1)); setCharIndex(c => c + 1) }
        else { setTimeout(() => setDeleting(true), 2200) }
      } else {
        if (charIndex > 0) { setCurrentText(target.slice(0, charIndex - 1)); setCharIndex(c => c - 1) }
        else { setDeleting(false); setTextIndex(i => (i + 1) % texts.length) }
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [charIndex, deleting, textIndex, texts])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">
      {currentText}
      <span className="text-cyan-400 animate-pulse font-thin">|</span>
    </span>
  )
}

const StatPill = ({ value, label, delay }) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div className={`group flex flex-col items-center gap-1 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 group-hover:from-cyan-200 group-hover:to-blue-200 transition-all duration-300">{value}</span>
      <span className="text-slate-500 text-xs uppercase tracking-[0.15em] group-hover:text-slate-400 transition-colors">{label}</span>
    </div>
  )
}

const AuthCard = ({ type }) => {
  const navigate  = useNavigate()
  const isSignup  = type === 'signup'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(isSignup ? '/signup' : '/login')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex-1 rounded-3xl p-8 border transition-all duration-500 cursor-pointer overflow-hidden relative ${
        isSignup
          ? 'bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-violet-600/10 border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-[1.02]'
          : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05] hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5'
      }`}
    >
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full transition-all duration-700 ${isSignup ? 'bg-cyan-400/15 group-hover:bg-cyan-400/30 group-hover:scale-150' : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-150'} blur-2xl`} />
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${hovered ? 'scale-110 rotate-3' : ''} ${
          isSignup ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                   : 'bg-white/5 border border-white/10 group-hover:bg-white/12 group-hover:border-white/20'
        }`}>
          <svg className={`w-7 h-7 ${isSignup ? 'text-cyan-300' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSignup
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            }
          </svg>
        </div>
        <h3 className="font-black text-2xl text-white mb-2 tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h3>
        <p className={`text-sm mb-6 leading-relaxed ${isSignup ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'} transition-colors`}>
          {isSignup
            ? 'Join thousands of learners. Start your adaptive quiz journey today — free forever.'
            : 'Continue your learning streak. Your AI is waiting with a personalised quiz.'}
        </p>
        <div className={`flex items-center gap-2 text-sm font-bold ${isSignup ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
          {isSignup ? 'Get started free' : 'Log in now'}
          <svg className={`w-4 h-4 transition-transform duration-300 ${hovered ? 'translate-x-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const LandingPage = () => {
  const navigate  = useNavigate()
  const [mounted, setMounted] = useState(false)
  const heroRef   = useRef(null)
  const videoRef  = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setMounted(true)
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
      @keyframes floatUp { 0%{transform:translateY(0px) rotate(0deg);opacity:0.3;} 50%{opacity:0.8;} 100%{transform:translateY(-30px) rotate(15deg);opacity:0.2;} }
      @keyframes slideUp { from{transform:translateY(50px);opacity:0;} to{transform:translateY(0);opacity:1;} }
      @keyframes fadeInScale { from{transform:scale(0.9);opacity:0;} to{transform:scale(1);opacity:1;} }
      @keyframes gradientShift { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
      @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(6,182,212,0.2);} 50%{box-shadow:0 0 60px rgba(6,182,212,0.5),0 0 100px rgba(6,182,212,0.2);} }
      @keyframes borderFlow { 0%{background-position:0% 50%;} 100%{background-position:200% 50%;} }
      .hero-mouse-glow { pointer-events:none;position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left 0.3s ease,top 0.3s ease; }
      .gradient-text-animated { background:linear-gradient(270deg,#06b6d4,#3b82f6,#8b5cf6,#06b6d4);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradientShift 4s ease infinite; }
      .glow-button { animation:glowPulse 2s ease-in-out infinite; }
    `
    document.head.appendChild(style)
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Autoplay video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }

    return () => { document.head.removeChild(style); window.removeEventListener('mousemove', handleMouseMove) }
  }, [])

  return (
    <div className="min-h-screen bg-[#020817] overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-mouse-glow" style={{ left: mousePos.x, top: mousePos.y }} />

        {/* ── Video Background ── */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.18 }}
          />
          {/* Dark overlay on top of video */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020817]/70 via-[#020817]/50 to-[#020817]/90" />
        </div>

        {/* ── Existing layered backgrounds on top of video ── */}
        <div className="absolute inset-0 z-[1]">
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,1) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(6,182,212,0.10),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_20%,rgba(139,92,246,0.04),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(59,130,246,0.04),transparent)]" />
          {PARTICLES.map((p) => (
            <div key={p.key} className="absolute rounded-full"
              style={{ ...p.style, animation: `floatUp ${p.style.animationDuration} ease-in-out ${p.style.animationDelay} infinite alternate` }} />
          ))}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/4 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* ── Hero content ── */}
        <div className={`relative z-10 text-center px-6 max-w-6xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Badge */}
          <div className="flex justify-center mb-8" style={{ animation: 'fadeInScale 0.8s ease forwards 0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="group relative inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/8 backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-500/15 transition-all duration-300 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="relative text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase">🤖 AI-Powered Adaptive Learning</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-black text-5xl md:text-7xl lg:text-[88px] text-white leading-[1.02] mb-6 tracking-tight"
            style={{ fontFamily: "'Syne',sans-serif", animation: 'slideUp 1s ease forwards 0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            Master CS with
            <br />
            <TypewriterText texts={['Intelligence', 'Precision', 'Adaptivity', 'XGBoost AI']} />
          </h1>

          {/* Subtext */}
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: 'slideUp 1s ease forwards 0.35s', opacity: 0, animationFillMode: 'forwards' }}>
            XGBoost AI adapts difficulty every <span className="text-cyan-400 font-semibold">5 questions</span> based on accuracy, speed &amp; streaks.
            <br className="hidden md:block" />
            <span className="text-slate-500">20 questions · Firebase auth · Resume anytime.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            style={{ animation: 'slideUp 1s ease forwards 0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <button onClick={() => navigate('/signup')}
              className="glow-button group relative px-10 py-4 font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-size-200 transition-all duration-500"
                style={{ backgroundSize: '200% 100%', animation: 'borderFlow 3s linear infinite' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
              <span className="relative flex items-center gap-2 text-base">
                Start Learning — Free
                <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative px-10 py-4 text-white border border-white/15 hover:border-cyan-400/50 font-semibold rounded-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/8 group-hover:to-blue-500/8 transition-all duration-500" />
              <span className="relative flex items-center gap-2 text-base">
                See How It Works
                <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
            style={{ animation: 'slideUp 1s ease forwards 0.65s', opacity: 0, animationFillMode: 'forwards' }}>
            {[
              { value: '4+',      label: 'CS Topics',        delay: 700  },
              { value: 'XGBoost', label: 'AI Engine',        delay: 800  },
              { value: '20 Qs',   label: 'Per Session',      delay: 900  },
              { value: '5-Q',     label: 'Adaptive Windows', delay: 1000 },
            ].map((s, i) => <StatPill key={i} {...s} />)}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ animation: 'fadeInScale 1s ease forwards 1.5s', opacity: 0, animationFillMode: 'forwards' }}>
          <span className="text-slate-600 text-xs uppercase tracking-[0.2em]">Scroll</span>
          <div className="relative w-5 h-8 border border-slate-700 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      <Features />

      {/* Auth section */}
      <section className="relative bg-[#030f1f] py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,182,212,0.07),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Get Started
            </div>
            <h2 className="font-black text-5xl md:text-6xl text-white mb-5 tracking-tight" style={{ fontFamily: "'Syne',sans-serif" }}>
              Join or{' '}
              <span className="gradient-text-animated">Continue</span>
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