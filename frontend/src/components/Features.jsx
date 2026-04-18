import React, { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: '🧠',
    title: 'AI-Adaptive Difficulty',
    description: 'XGBoost analyses accuracy, speed, and streaks every 5 questions and predicts the optimal difficulty for the next window in real time.',
    color: 'from-cyan-500/20 via-cyan-600/10 to-transparent',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    iconBg: 'from-cyan-500/30 to-blue-500/20',
    stat: '3 Levels',
  },
  {
    icon: '📋',
    title: '20-Question Sessions',
    description: 'Each session has exactly 20 questions split across 4 adaptive windows of 5. Complete them all to earn your performance score.',
    color: 'from-blue-500/20 via-blue-600/10 to-transparent',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    iconBg: 'from-blue-500/30 to-indigo-500/20',
    stat: '4 Windows',
  },
  {
    icon: '⚡',
    title: '20-Second Timer',
    description: 'Every question has a strict 20-second countdown. Unanswered questions auto-advance and your response time feeds directly into the AI model.',
    color: 'from-violet-500/20 via-violet-600/10 to-transparent',
    border: 'border-violet-500/30',
    accent: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    iconBg: 'from-violet-500/30 to-purple-500/20',
    stat: '20 Secs',
  },
  {
    icon: '🔄',
    title: 'Resume on Refresh',
    description: 'Session persisted in sessionStorage and MongoDB. Return to the exact question you left off on — even after closing the tab.',
    color: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    iconBg: 'from-emerald-500/30 to-teal-500/20',
    stat: 'Auto Save',
  },
  {
    icon: '🏆',
    title: 'Live Leaderboards',
    description: 'Compete topic-by-topic with real-time global rankings. Score is weighted by difficulty and speed — not just correct answers.',
    color: 'from-amber-500/20 via-amber-600/10 to-transparent',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    iconBg: 'from-amber-500/30 to-orange-500/20',
    stat: 'Top 50',
  },
  {
    icon: '🔐',
    title: 'Firebase Auth + UID Sync',
    description: 'Email/password or Google Sign-In. Firebase UID synced to MongoDB for seamless cross-device identity and quiz history.',
    color: 'from-rose-500/20 via-rose-600/10 to-transparent',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    glow: 'shadow-rose-500/20',
    iconBg: 'from-rose-500/30 to-pink-500/20',
    stat: 'OAuth 2.0',
  },
]

const FeatureCard = ({ feature, index }) => {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.border} 
        hover:scale-[1.03] transition-all duration-500 cursor-default overflow-hidden
        hover:shadow-2xl hover:${feature.glow}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Background glow effect */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${feature.iconBg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

      {/* Shimmer line */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className={`absolute -top-full left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:top-0 transition-all duration-700`} />
      </div>

      <div className="relative z-10">
        {/* Icon + stat */}
        <div className="flex items-start justify-between mb-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconBg} border ${feature.border} flex items-center justify-center text-2xl 
            group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
            {feature.icon}
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${feature.border} ${feature.accent} bg-white/5`}>
            {feature.stat}
          </span>
        </div>

        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-white transition-colors">{feature.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{feature.description}</p>

        {/* Bottom accent line */}
        <div className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.border.replace('border-', 'from-').replace('/30', '/60')} to-transparent transition-all duration-500`} />
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
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.8) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-[0.2em] uppercase bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Platform Features
          </div>
          <h2 className="font-black text-5xl md:text-6xl text-white mb-5 leading-tight">
            Built to make you{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">smarter</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 rounded-full" />
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature is engineered around one mission: helping you master CS concepts through intelligent, adaptive practice that evolves with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '4+', label: 'CS Topics' },
            { value: 'XGBoost', label: 'AI Engine' },
            { value: '1200+', label: 'Questions' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat, i) => (
            <div key={i} className="text-center py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-colors group">
              <div className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">{stat.value}</div>
              <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features