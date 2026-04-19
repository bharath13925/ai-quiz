import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }     from 'react-router-dom'
import { leaderboardAPI, quizAPI }    from '../services/api'

const TOPIC_META = {
  graphs: { label: 'Graphs',            icon: '🔗', accent: '#22d3ee', border: 'rgba(6,182,212,0.4)',   btnGrad: 'linear-gradient(135deg,#06b6d4,#0891b2)',   glow: 'rgba(6,182,212,0.25)'  },
  arrays: { label: 'Arrays',            icon: '📊', accent: '#60a5fa', border: 'rgba(59,130,246,0.4)',  btnGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)',   glow: 'rgba(59,130,246,0.25)' },
  dbms:   { label: 'DBMS',              icon: '🗄️', accent: '#a78bfa', border: 'rgba(139,92,246,0.4)', btnGrad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',   glow: 'rgba(139,92,246,0.25)' },
  os:     { label: 'Operating Systems', icon: '💻', accent: '#34d399', border: 'rgba(16,185,129,0.4)', btnGrad: 'linear-gradient(135deg,#10b981,#059669)',   glow: 'rgba(16,185,129,0.25)' },
  stacks: { label: 'Stacks',            icon: '📚', accent: '#c084fc', border: 'rgba(192,132,252,0.4)', btnGrad: 'linear-gradient(135deg,#a855f7,#7c3aed)',  glow: 'rgba(168,85,247,0.25)' },
  queues: { label: 'Queues',            icon: '🔁', accent: '#f472b6', border: 'rgba(244,114,182,0.4)', btnGrad: 'linear-gradient(135deg,#ec4899,#be185d)',  glow: 'rgba(236,72,153,0.25)' },
  trees:  { label: 'Trees',             icon: '🌳', accent: '#4ade80', border: 'rgba(74,222,128,0.4)',  btnGrad: 'linear-gradient(135deg,#22c55e,#15803d)',   glow: 'rgba(34,197,94,0.25)'  },
  hashing:{ label: 'Hashing',           icon: '#️⃣', accent: '#fbbf24', border: 'rgba(251,191,36,0.4)', btnGrad: 'linear-gradient(135deg,#f59e0b,#b45309)',  glow: 'rgba(245,158,11,0.25)' },
}

const DEFAULT_TOPIC_META = (id) => ({
  label:   id.charAt(0).toUpperCase() + id.slice(1),
  icon:    '📋',
  accent:  '#94a3b8',
  border:  'rgba(148,163,184,0.4)',
  btnGrad: 'linear-gradient(135deg,#64748b,#475569)',
  glow:    'rgba(100,116,139,0.25)',
})

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

// ─── Mobile card for each player ─────────────────────────────────────────────
const PlayerCardMobile = ({ entry, tm }) => {
  const [expanded, setExpanded] = useState(false)
  const isPodium  = entry.rank <= 3
  const medalColor = entry.rank === 1 ? '#eab308' : entry.rank === 2 ? '#94a3b8' : '#b45309'
  const rankBg     = entry.rank === 1 ? 'rgba(234,179,8,0.12)' : entry.rank === 2 ? 'rgba(148,163,184,0.1)' : entry.rank === 3 ? 'rgba(180,83,9,0.1)' : 'rgba(255,255,255,0.04)'

  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.03)', background: isPodium ? `linear-gradient(90deg,${rankBg},transparent)` : 'transparent', borderLeft: isPodium ? `2px solid ${medalColor}50` : '2px solid transparent' }}>
      <button className="w-full flex items-center justify-between" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-3">
          <span className="inline-flex w-8 h-8 rounded-xl items-center justify-center text-xs font-black border"
            style={{ background: rankBg, borderColor: isPodium ? `${medalColor}40` : 'rgba(255,255,255,0.08)', color: isPodium ? medalColor : '#64748b' }}>
            {MEDALS[entry.rank] || entry.rank}
          </span>
          <div className="text-left">
            <p className="text-white font-bold text-sm">{entry.name}</p>
            <p className="text-slate-600 text-xs">{entry.quizzesTaken} quiz · {entry.avgAccuracy}% acc · ⏱ {entry.avgTime?.toFixed(1) || 0}s</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-black text-sm" style={{ color: tm.accent }}>{entry.totalScore.toFixed(1)}</p>
            <p className="text-slate-600 text-[10px]">score</p>
          </div>
          <svg className={`w-4 h-4 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 ml-11 grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-emerald-400 font-black text-sm">{entry.totalCorrect}</p>
            <p className="text-slate-600 text-[10px]">Correct</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-red-400 font-black text-sm">{entry.totalIncorrect}</p>
            <p className="text-slate-600 text-[10px]">Wrong</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <p className="text-orange-400 font-black text-sm">{entry.totalTimeout}</p>
            <p className="text-slate-600 text-[10px]">Timeout</p>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-blue-400 font-black text-sm">{entry.avgTime?.toFixed(1) || 0}s</p>
            <p className="text-slate-600 text-[10px]">Avg Time</p>
          </div>
          <div className="col-span-2 p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-slate-400 text-xs">Best: <span className="text-white font-bold">{entry.bestScore.toFixed(1)}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}

const LeaderboardPage = () => {
  const navigate              = useNavigate()
  const { topic: paramTopic } = useParams()
  const [topic,       setTopic]       = useState(paramTopic || 'graphs')
  const [topics,      setTopics]      = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [meta,        setMeta]        = useState({ totalAttempts: 0, uniqueUsers: 0 })
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    quizAPI.getTopics()
      .then(data => setTopics(data.topics || []))
      .catch(() => {})
  }, [])

  useEffect(() => { if (paramTopic) setTopic(paramTopic) }, [paramTopic])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError('')
      try {
        const data = await leaderboardAPI.getTopic(topic)
        setLeaderboard(data.leaderboard || [])
        setMeta({ totalAttempts: data.totalAttempts || 0, uniqueUsers: data.uniqueUsers || 0 })
      } catch (err) {
        setError(err.message)
      } finally { setLoading(false) }
    }
    fetchData()
  }, [topic])

  const tm = TOPIC_META[topic] || DEFAULT_TOPIC_META(topic)

  return (
    <div className="min-h-screen bg-[#020817]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUpRow { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .topic-tab { transition: all 0.3s ease; }
        .topic-tab:hover { transform: translateY(-2px); }
        .lb-row { transition: all 0.25s ease; }
        .lb-row:hover { background: rgba(255,255,255,0.03) !important; transform: translateX(4px); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(6,182,212,0.06),transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${tm.glow}, transparent)` }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl border-b"
        style={{ background: 'rgba(2,8,23,0.85)', borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg,transparent,${tm.accent}80,transparent)` }} />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:text-white"
            style={{ color: '#64748b' }}>
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-black text-lg text-white" style={{ fontFamily: "'Syne',sans-serif" }}>Leaderboard</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        {/* Topic tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {topics.length > 0 ? topics.map((t) => {
            const tabMeta = TOPIC_META[t.id] || DEFAULT_TOPIC_META(t.id)
            return (
              <button
                key={t.id}
                onClick={() => { setTopic(t.id); navigate(`/leaderboard/${t.id}`) }}
                className="topic-tab px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300"
                style={topic === t.id
                  ? { background: tabMeta.btnGrad, border: '1px solid transparent', color: '#fff', boxShadow: `0 4px 20px ${tabMeta.glow}`, transform: 'translateY(-2px)' }
                  : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }
                }
              >
                {t.icon} {t.label}
              </button>
            )
          }) : (
            ['graphs','arrays','dbms','os'].map(id => {
              const tabMeta = TOPIC_META[id] || DEFAULT_TOPIC_META(id)
              return (
                <button key={id}
                  onClick={() => { setTopic(id); navigate(`/leaderboard/${id}`) }}
                  className="topic-tab px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300"
                  style={topic === id
                    ? { background: tabMeta.btnGrad, border: '1px solid transparent', color: '#fff', boxShadow: `0 4px 20px ${tabMeta.glow}` }
                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }
                  }
                >
                  {tabMeta.icon} {tabMeta.label}
                </button>
              )
            })
          )}
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total Players',  value: meta.uniqueUsers,   icon: '👥' },
            { label: 'Total Quizzes',  value: meta.totalAttempts, icon: '📝' },
            { label: 'On Board',       value: leaderboard.length, icon: '🏅' },
          ].map((s, i) => (
            <div key={i} className="relative p-4 rounded-2xl text-center overflow-hidden group cursor-default transition-all duration-400 hover:scale-[1.03]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${tm.border}`; e.currentTarget.style.boxShadow = `0 8px 32px ${tm.glow}` }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 50%, ${tm.glow}50, transparent)` }} />
              <div className="relative z-10">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-black text-2xl" style={{ color: tm.accent }}>{s.value}</div>
                <div className="text-slate-600 text-xs mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main table */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tm.icon}</span>
              <div>
                <h2 className="font-black text-lg text-white" style={{ fontFamily: "'Syne',sans-serif" }}>{tm.label} Rankings</h2>
                <p className="text-slate-600 text-xs">Ranked by score · ties broken by avg response time · showing full stats</p>
              </div>
            </div>
            <button onClick={() => navigate(`/quiz/${topic}`)}
              className="px-4 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg"
              style={{ background: tm.btnGrad }}>
              Take Quiz →
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.05)' }}>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-400 text-sm">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-500 text-base font-semibold mb-2">No entries yet</p>
              <p className="text-slate-600 text-sm mb-6">Be the first to claim the top spot!</p>
              <button onClick={() => navigate(`/quiz/${topic}`)}
                className="px-6 py-3 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                style={{ background: tm.btnGrad }}>
                Start Quiz →
              </button>
            </div>
          ) : (
            <>
              {/* Desktop column headers */}
              <div className="hidden lg:grid px-6 py-3 border-b text-[10px] uppercase tracking-[0.15em] font-bold text-slate-600"
                style={{ borderColor: 'rgba(255,255,255,0.04)', gridTemplateColumns: '60px 1fr 90px 80px 70px 70px 65px 65px 70px 50px' }}>
                <div>Rank</div>
                <div>Player</div>
                <div className="text-right">Total Score</div>
                <div className="text-right">Best</div>
                <div className="text-right">Quizzes</div>
                <div className="text-right">✅ Correct</div>
                <div className="text-right">❌ Wrong</div>
                <div className="text-right">⏰ T/O</div>
                <div className="text-right">⏱ Time</div>
                <div className="text-right">Acc.</div>
              </div>

              {/* Mobile view */}
              <div className="lg:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                {leaderboard.map((entry) => (
                  <PlayerCardMobile key={entry.rank} entry={entry} tm={tm} />
                ))}
              </div>

              {/* Desktop rows */}
              <div className="hidden lg:block divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                {leaderboard.map((entry, idx) => {
                  const isPodium   = entry.rank <= 3
                  const medalColor = entry.rank === 1 ? '#eab308' : entry.rank === 2 ? '#94a3b8' : '#b45309'
                  const rankBg     = entry.rank === 1
                    ? 'rgba(234,179,8,0.12)'
                    : entry.rank === 2 ? 'rgba(148,163,184,0.1)'
                    : entry.rank === 3 ? 'rgba(180,83,9,0.1)'
                    : 'rgba(255,255,255,0.04)'
                  const totalAnswered = (entry.totalCorrect || 0) + (entry.totalIncorrect || 0) + (entry.totalTimeout || 0)

                  // Colour-code avg time: fast=green, medium=amber, slow=red
                  const avgTimeSec = entry.avgTime || 0
                  const timeColor  = avgTimeSec <= 8 ? '#34d399' : avgTimeSec <= 14 ? '#fbbf24' : '#f87171'

                  return (
                    <div key={entry.rank} className="lb-row px-6 py-3.5"
                      style={{
                        animation: `fadeUpRow 0.4s ease forwards ${idx * 30}ms`,
                        opacity: 0,
                        background: isPodium ? `linear-gradient(90deg,${rankBg},transparent)` : 'transparent',
                        borderLeft: isPodium ? `2px solid ${medalColor}50` : '2px solid transparent',
                        gridTemplateColumns: '60px 1fr 90px 80px 70px 70px 65px 65px 70px 50px',
                        display: 'grid',
                        alignItems: 'center',
                      }}>

                      {/* Rank */}
                      <div>
                        <span className="inline-flex w-9 h-9 rounded-xl items-center justify-center text-sm font-black border"
                          style={{ background: rankBg, borderColor: isPodium ? `${medalColor}40` : 'rgba(255,255,255,0.08)', color: isPodium ? medalColor : '#64748b' }}>
                          {MEDALS[entry.rank] || `#${entry.rank}`}
                        </span>
                      </div>

                      {/* Player */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: tm.accent }}>
                          {entry.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{entry.name}</p>
                          <p className="text-slate-600 text-[10px] truncate">{entry.email}</p>
                        </div>
                      </div>

                      {/* Total Score */}
                      <div className="text-right">
                        <span className="font-black text-sm" style={{ color: tm.accent }}>{entry.totalScore.toFixed(1)}</span>
                      </div>

                      {/* Best */}
                      <div className="text-right">
                        <span className="text-white font-semibold text-sm">{entry.bestScore.toFixed(1)}</span>
                      </div>

                      {/* Quizzes */}
                      <div className="text-right">
                        <span className="text-slate-300 font-semibold text-sm">{entry.quizzesTaken}</span>
                      </div>

                      {/* Correct */}
                      <div className="text-right">
                        <span className="text-emerald-400 font-black text-sm">{entry.totalCorrect || 0}</span>
                        {totalAnswered > 0 && (
                          <p className="text-slate-700 text-[10px]">{Math.round(((entry.totalCorrect || 0) / totalAnswered) * 100)}%</p>
                        )}
                      </div>

                      {/* Incorrect */}
                      <div className="text-right">
                        <span className="text-red-400 font-black text-sm">{entry.totalIncorrect || 0}</span>
                      </div>

                      {/* Timeout */}
                      <div className="text-right">
                        <span className="text-orange-400 font-black text-sm">{entry.totalTimeout || 0}</span>
                      </div>

                      {/* Avg Time — colour coded */}
                      <div className="text-right">
                        <span className="font-black text-sm" style={{ color: timeColor }}>
                          {avgTimeSec.toFixed(1)}s
                        </span>
                        <p className="text-slate-700 text-[10px]">
                          {avgTimeSec <= 8 ? 'fast' : avgTimeSec <= 14 ? 'ok' : 'slow'}
                        </p>
                      </div>

                      {/* Accuracy */}
                      <div className="text-right">
                        <span className="text-sm font-black" style={{
                          color: entry.avgAccuracy >= 75 ? '#34d399' : entry.avgAccuracy >= 50 ? '#fbbf24' : '#f87171',
                        }}>{entry.avgAccuracy}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Score formula */}
        <div className="mt-6 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span>📐</span> Score Formula (Pro Version)
          </h4>
          <p className="text-slate-500 text-xs leading-relaxed font-mono">
            Score = ((Correct × Weight × 10) − (Wrong × 5) − (Timeout × 10)) × Accuracy ÷ (1 + AvgTime / 10)
            <br />
            <span style={{ color: '#34d399' }}>Easy ×1</span>{' · '}
            <span style={{ color: '#fbbf24' }}>Medium ×1.5</span>{' · '}
            <span style={{ color: '#f87171' }}>Hard ×2</span>{' · '}
            <span style={{ color: '#fb923c' }}>Timed-out = incorrect + 20s penalty</span>
          </p>
          <p className="text-slate-700 text-xs mt-2">
            Ranking: higher score first · equal scores broken by average response time (faster wins) · Correct / Wrong / T/O show cumulative totals.
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
            <span>⚡ <span style={{ color: '#34d399' }}>≤ 8s</span> = fast</span>
            <span>🟡 <span style={{ color: '#fbbf24' }}>8–14s</span> = ok</span>
            <span>🐢 <span style={{ color: '#f87171' }}>{'> 14s'}</span> = slow</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LeaderboardPage