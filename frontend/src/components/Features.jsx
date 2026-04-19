import React, { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: '🧠',
    title: 'AI-Adaptive Difficulty',
    description: 'XGBoost analyses accuracy, speed, and streaks every 5 questions and predicts the optimal difficulty for the next window in real time.',
    accentColor: '#22d3ee',
    borderColor: 'rgba(6,182,212,0.35)',
    gradFrom: 'rgba(6,182,212,0.18)',
    gradTo:   'rgba(6,182,212,0.03)',
    glowColor: 'rgba(6,182,212,0.3)',
    stat: '3 Levels',
    statColor: '#22d3ee',
  },
  {
    icon: '📋',
    title: '20-Question Sessions',
    description: 'Each session has exactly 20 questions split across 4 adaptive windows of 5. Complete them all to earn your weighted performance score.',
    accentColor: '#60a5fa',
    borderColor: 'rgba(59,130,246,0.35)',
    gradFrom: 'rgba(59,130,246,0.18)',
    gradTo:   'rgba(59,130,246,0.03)',
    glowColor: 'rgba(59,130,246,0.3)',
    stat: '4 Windows',
    statColor: '#60a5fa',
  },
  {
    icon: '⚡',
    title: '20-Second Timer',
    description: 'Every question has a strict 20-second countdown. Response time feeds directly into the XGBoost model for the next window prediction.',
    accentColor: '#a78bfa',
    borderColor: 'rgba(139,92,246,0.35)',
    gradFrom: 'rgba(139,92,246,0.18)',
    gradTo:   'rgba(139,92,246,0.03)',
    glowColor: 'rgba(139,92,246,0.3)',
    stat: '20 Secs',
    statColor: '#a78bfa',
  },
  {
    icon: '🔄',
    title: 'Resume on Refresh',
    description: 'Session persisted in sessionStorage and MongoDB. Return to the exact question you left off on — even after closing the tab.',
    accentColor: '#34d399',
    borderColor: 'rgba(16,185,129,0.35)',
    gradFrom: 'rgba(16,185,129,0.18)',
    gradTo:   'rgba(16,185,129,0.03)',
    glowColor: 'rgba(16,185,129,0.3)',
    stat: 'Auto Save',
    statColor: '#34d399',
  },
  {
    icon: '🏆',
    title: 'Live Leaderboards',
    description: 'Compete topic-by-topic with real-time global rankings. Score is weighted by difficulty and speed — not just correct answers.',
    accentColor: '#fbbf24',
    borderColor: 'rgba(251,191,36,0.35)',
    gradFrom: 'rgba(251,191,36,0.18)',
    gradTo:   'rgba(251,191,36,0.03)',
    glowColor: 'rgba(251,191,36,0.3)',
    stat: 'Top 50',
    statColor: '#fbbf24',
  },
  {
    icon: '🔐',
    title: 'Firebase Auth + UID Sync',
    description: 'Email/password or Google Sign-In. Firebase UID synced to MongoDB for seamless cross-device identity and persistent quiz history.',
    accentColor: '#f87171',
    borderColor: 'rgba(248,113,113,0.35)',
    gradFrom: 'rgba(248,113,113,0.18)',
    gradTo:   'rgba(248,113,113,0.03)',
    glowColor: 'rgba(248,113,113,0.3)',
    stat: 'OAuth 2.0',
    statColor: '#f87171',
  },
]

const FeatureCard = ({ feature, index }) => {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [tilt,    setTilt]    = useState({ x: 0, y: 0 })
  const ref     = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12
    setTilt({ x, y })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative p-6 rounded-2xl h-full cursor-default overflow-hidden transition-all duration-400"
        style={{
          background: `linear-gradient(135deg, ${feature.gradFrom}, ${feature.gradTo})`,
          border: `1px solid ${hovered ? feature.borderColor : 'rgba(255,255,255,0.06)'}`,
          transform: hovered ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateZ(10px)` : 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)',
          boxShadow: hovered ? `0 20px 60px ${feature.glowColor}, 0 0 0 1px ${feature.borderColor}` : 'none',
          transition: 'transform 0.2s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        }}
      >
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl transition-all duration-700"
          style={{ background: feature.glowColor, opacity: hovered ? 0.25 : 0 }} />

        {/* Shimmer sweep */}
        <div className={`absolute inset-0 bg-gradient-to-br from-white/0 via-white/[0.04] to-white/0 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-3xl opacity-0 transition-opacity duration-500"
          style={{ background: `linear-gradient(225deg, ${feature.gradFrom}, transparent)`, opacity: hovered ? 1 : 0 }} />

        <div className="relative z-10">
          {/* Icon + stat */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${feature.gradFrom} 0%, ${feature.gradTo} 100%)`,
                border: `1px solid ${feature.borderColor}`,
                transform: hovered ? 'scale(1.12) rotate(5deg)' : 'scale(1) rotate(0)',
                boxShadow: hovered ? `0 8px 24px ${feature.glowColor}` : '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {feature.icon}
            </div>
            <span
              className="text-xs font-black px-2.5 py-1 rounded-xl transition-all duration-300"
              style={{
                border: `1px solid ${feature.borderColor}`,
                color: feature.statColor,
                background: `${feature.gradFrom}`,
                boxShadow: hovered ? `0 0 12px ${feature.glowColor}` : 'none',
              }}
            >
              {feature.stat}
            </span>
          </div>

          <h3 className="font-black text-lg text-white mb-2.5 transition-all duration-300" style={{ fontFamily: "'Syne', sans-serif" }}>
            {feature.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed transition-colors duration-300" style={{ color: hovered ? '#94a3b8' : '#64748b' }}>
            {feature.description}
          </p>

          {/* Bottom animated bar */}
          <div className="mt-5 h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: hovered ? '100%' : '0%',
                background: `linear-gradient(90deg, ${feature.accentColor}, transparent)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const Features = () => {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeaderVisible(true) },
      { threshold: 0.2 }
    )
    if (headerRef.current) observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="relative bg-[#020817] py-28 px-6 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
      `}</style>

      {/* Backgrounds */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.8) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      <div className="absolute top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-24 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-800 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Platform Features
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5 leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built to make you{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">smarter</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 rounded-full" />
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature is engineered around one mission: helping you master CS concepts through intelligent, adaptive practice.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '4+',      label: 'CS Topics'  },
            { value: 'XGBoost', label: 'AI Engine'  },
            { value: '1200+',   label: 'Questions'  },
            { value: '99.9%',   label: 'Uptime'     },
          ].map((stat, i) => (
            <div
              key={i}
              className="group text-center py-5 px-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-400 hover:shadow-lg hover:shadow-cyan-500/10 cursor-default"
            >
              <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300 mb-1">{stat.value}</div>
              <div className="text-slate-600 text-xs uppercase tracking-wider group-hover:text-slate-500 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features