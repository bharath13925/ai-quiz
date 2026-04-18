import React, { useEffect, useState } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { auth }                        from '../firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { quizAPI, clearToken }         from '../services/api'

// ── Topic config with explicit hex colors (avoids Tailwind JIT purging dynamic classes) ──
const TOPIC_META = {
  graphs: {
    icon: '🔗',
    accent: '#22d3ee',       // cyan-400
    border: 'rgba(6,182,212,0.3)',
    gradFrom: 'rgba(6,182,212,0.2)',
    gradTo:   'rgba(6,182,212,0.05)',
    bar:    '#06b6d4',
    btnFrom:'#06b6d4', btnTo:'#0891b2',
    glow:   'rgba(6,182,212,0.2)',
  },
  arrays: {
    icon: '📊',
    accent: '#60a5fa',       // blue-400
    border: 'rgba(59,130,246,0.3)',
    gradFrom: 'rgba(59,130,246,0.2)',
    gradTo:   'rgba(59,130,246,0.05)',
    bar:    '#3b82f6',
    btnFrom:'#3b82f6', btnTo:'#2563eb',
    glow:   'rgba(59,130,246,0.2)',
  },
  dbms: {
    icon: '🗄️',
    accent: '#a78bfa',       // violet-400
    border: 'rgba(139,92,246,0.3)',
    gradFrom: 'rgba(139,92,246,0.2)',
    gradTo:   'rgba(139,92,246,0.05)',
    bar:    '#8b5cf6',
    btnFrom:'#8b5cf6', btnTo:'#7c3aed',
    glow:   'rgba(139,92,246,0.2)',
  },
  os: {
    icon: '💻',
    accent: '#34d399',       // emerald-400
    border: 'rgba(16,185,129,0.3)',
    gradFrom: 'rgba(16,185,129,0.2)',
    gradTo:   'rgba(16,185,129,0.05)',
    bar:    '#10b981',
    btnFrom:'#10b981', btnTo:'#059669',
    glow:   'rgba(16,185,129,0.2)',
  },
}

const DIFFICULTY_COLORS = {
  easy:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30'   },
  hard:   { bg: 'bg-red-500/15',     text: 'text-red-400',     border: 'border-red-500/30'     },
}

const Spinner = () => (
  <div className="min-h-screen bg-[#020817] flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-blue-500/30 animate-ping" style={{ animationDelay: '0.3s' }} />
        <div className="absolute inset-0 rounded-full bg-cyan-500/5 flex items-center justify-center">
          <span className="text-3xl">🧠</span>
        </div>
      </div>
      <p className="text-slate-300 font-semibold mb-1">Loading your dashboard</p>
      <p className="text-slate-600 text-sm">Fetching your stats...</p>
    </div>
  </div>
)

const StatCard = ({ icon, label, value, accentColor, delay }) => (
  <div
    className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all duration-500 text-center overflow-hidden"
    style={{ animation: `fadeUp 0.6s ease forwards ${delay}ms`, opacity: 0 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
    <div className="relative z-10">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-black text-2xl mb-1" style={{ color: accentColor }}>{value}</div>
      <div className="text-slate-600 text-xs uppercase tracking-widest">{label}</div>
    </div>
  </div>
)

const TopicCard = ({ topic, onStart, onLeaderboard }) => {
  const m = TOPIC_META[topic.id] || TOPIC_META.graphs
  return (
    <div
      className="group relative p-6 rounded-2xl hover:scale-[1.03] hover:shadow-2xl transition-all duration-500 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${m.gradFrom}, ${m.gradTo})`,
        border: `1px solid ${m.border}`,
      }}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-700 rounded-2xl" />
      {/* Glow top-right */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500"
        style={{ background: m.accent }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
            style={{ border: `1px solid ${m.border}`, background: 'rgba(0,0,0,0.2)' }}
          >
            {topic.icon}
          </div>
          <div
            className="px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ border: `1px solid ${m.border}`, color: m.accent, background: 'rgba(0,0,0,0.2)' }}
          >
            20 Qs
          </div>
        </div>

        <h3 className="font-black text-xl mb-1" style={{ color: m.accent }}>{topic.label}</h3>
        <p className="text-slate-500 text-xs mb-5">AI-adaptive · 4 windows · XGBoost</p>

        <div className="flex gap-2">
          <button
            onClick={() => onStart(topic.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 hover:shadow-lg transition-all duration-200"
            style={{ background: `linear-gradient(135deg, ${m.btnFrom}, ${m.btnTo})` }}
          >
            Start Quiz →
          </button>
          <button
            onClick={() => onLeaderboard(topic.id)}
            title="Leaderboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-base hover:scale-110 transition-all duration-200"
            style={{ border: `1px solid ${m.border}`, background: 'rgba(0,0,0,0.2)' }}
          >
            🏆
          </button>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [user,    setUser]    = useState(null)
  const [topics,  setTopics]  = useState([])
  const [stats,   setStats]   = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      try {
        const [topicsRes, statsRes, historyRes] = await Promise.all([
          quizAPI.getTopics(),
          quizAPI.getStats(),
          quizAPI.getHistory({ limit: 8 }),
        ])
        setTopics(topicsRes.topics || [])
        setStats(statsRes)
        setHistory(historyRes.attempts || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err.message)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [navigate])

  const handleLogout = async () => {
    clearToken()
    await signOut(auth)
    navigate('/')
  }

  if (loading) return <Spinner />

  const firstName = user?.displayName?.split(' ')[0] || 'Learner'

  return (
    <div className="min-h-screen bg-[#020817]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#020817]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <span className="font-black text-lg text-white">AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Quiz</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
            {[
              { label: 'Overview', id: 'overview' },
              { label: 'Topics',   id: 'topics'   },
              { label: 'Rankings', id: 'rankings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'rankings') navigate('/leaderboard/graphs')
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-sm font-bold text-cyan-300">
                {firstName[0]?.toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-bold leading-none">{firstName}</p>
                <p className="text-slate-600 text-xs mt-0.5 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 border border-slate-800 rounded-lg hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* ── Welcome banner ── */}
        <div className="relative mb-10 p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent border border-cyan-500/15 overflow-hidden"
          style={{ animation: 'fadeUp 0.6s ease forwards', opacity: 0 }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Active Session</span>
              </div>
              <h1 className="font-black text-3xl md:text-4xl text-white">
                Hey, {firstName}! 👋
              </h1>
              <p className="text-slate-400 mt-1">
                {topics.length > 0
                  ? 'Your AI is ready. Choose a topic to begin your adaptive quiz.'
                  : 'No topics found — seed questions via POST /api/questions/bulk'}
              </p>
            </div>
            <button
              onClick={() => navigate('/leaderboard/graphs')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-bold hover:bg-amber-500/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105"
            >
              🏆 View Rankings
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '📝', label: 'Quizzes Taken', value: stats?.totalQuizzes ?? '—', accentColor: '#22d3ee', delay: 100 },
            { icon: '🎯', label: 'Avg. Accuracy',  value: stats?.avgAccuracy != null ? `${stats.avgAccuracy}%` : '—', accentColor: '#60a5fa', delay: 200 },
            { icon: '🏆', label: 'Best Score',     value: stats?.bestScore != null ? stats.bestScore.toFixed(1) : '—', accentColor: '#fbbf24', delay: 300 },
            { icon: '⏱️', label: 'Time Spent',    value: stats?.totalTime != null ? `${Math.round(stats.totalTime / 60)}m` : '—', accentColor: '#34d399', delay: 400 },
          ].map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* ── Topics ── */}
        {topics.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-xl text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                Available Topics
              </h2>
              <span className="text-slate-600 text-xs">{topics.length} topics available</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onStart={(id) => navigate(`/quiz/${id}`)}
                  onLeaderboard={(id) => navigate(`/leaderboard/${id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {topics.length === 0 && (
          <div className="mb-12 p-10 rounded-3xl bg-white/[0.02] border border-white/5 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-bold text-xl text-white mb-2">No Topics Available</h3>
            <p className="text-slate-500 text-sm">
              Add questions via <code className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-mono">POST /api/questions/bulk</code>
            </p>
          </div>
        )}

        {/* ── Recent Activity ── */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-xl text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-violet-400 to-blue-500 rounded-full" />
                Recent Activity
              </h2>
              <span className="text-slate-600 text-xs">Last {history.length} quizzes</span>
            </div>
            <div className="space-y-2">
              {history.map((attempt, i) => {
                const dc  = DIFFICULTY_COLORS[attempt.difficulty] || DIFFICULTY_COLORS.medium
                const tm  = TOPIC_META[attempt.topic] || {}
                return (
                  <div
                    key={i}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                    style={{ animation: `fadeUp 0.5s ease forwards ${i * 60}ms`, opacity: 0 }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ border: `1px solid ${tm.border || 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.05)' }}
                      >
                        {tm.icon || '📚'}
                      </div>
                      <div>
                        <p className="text-white font-bold capitalize text-sm">{attempt.topic}</p>
                        <p className="text-slate-600 text-xs">
                          {new Date(attempt.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-14 sm:ml-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${dc.bg} ${dc.text} ${dc.border} capitalize`}>
                        {attempt.difficulty}
                      </span>
                      <div className="text-right">
                        <p className="text-white font-black">{Math.round(attempt.accuracy * 100)}%</p>
                        <p className="text-slate-600 text-xs">accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black" style={{ color: tm.accent || '#22d3ee' }}>{attempt.score?.toFixed(1) || '0'}</p>
                        <p className="text-slate-600 text-xs">score</p>
                      </div>
                      <div className="hidden sm:block w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round(attempt.accuracy * 100)}%`, background: tm.bar || '#06b6d4' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard