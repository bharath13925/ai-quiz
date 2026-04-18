import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }     from 'react-router-dom'
import { leaderboardAPI }             from '../services/api'

const TOPICS = [
  { id: 'graphs', label: 'Graphs',            icon: '🔗', color: 'text-cyan-400',    border: 'border-cyan-500/40',    activeBg: 'from-cyan-500 to-cyan-600',    glow: 'shadow-cyan-500/30'    },
  { id: 'arrays', label: 'Arrays',            icon: '📊', color: 'text-blue-400',    border: 'border-blue-500/40',    activeBg: 'from-blue-500 to-blue-600',    glow: 'shadow-blue-500/30'    },
  { id: 'dbms',   label: 'DBMS',              icon: '🗄️', color: 'text-violet-400',  border: 'border-violet-500/40',  activeBg: 'from-violet-500 to-violet-600', glow: 'shadow-violet-500/30'  },
  { id: 'os',     label: 'Operating Systems', icon: '💻', color: 'text-emerald-400', border: 'border-emerald-500/40', activeBg: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/30' },
]

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const RANK_STYLES = {
  1: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  2: 'text-slate-300  border-slate-400/40  bg-slate-400/10',
  3: 'text-amber-600  border-amber-600/40  bg-amber-600/10',
}

const LeaderboardPage = () => {
  const navigate              = useNavigate()
  const { topic: paramTopic } = useParams()
  const [topic,       setTopic]       = useState(paramTopic || 'graphs')
  const [leaderboard, setLeaderboard] = useState([])
  const [meta,        setMeta]        = useState({ totalAttempts: 0, uniqueUsers: 0 })
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

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
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [topic])

  const currentMeta = TOPICS.find((t) => t.id === topic) || TOPICS[0]

  return (
    <div className="min-h-screen bg-[#020817]">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { width:0%; } to { width:var(--target); } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#020817]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <span className="font-black text-lg text-white">Leaderboard</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        {/* Topic tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTopic(t.id); navigate(`/leaderboard/${t.id}`) }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 ${
                topic === t.id
                  ? `bg-gradient-to-r ${t.activeBg} border-transparent text-white shadow-lg shadow-${t.glow} scale-105`
                  : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Players',        value: meta.uniqueUsers,   icon: '👥' },
            { label: 'Total Quizzes',  value: meta.totalAttempts, icon: '📝' },
            { label: 'On Board',       value: leaderboard.length, icon: '🏅' },
          ].map((s, i) => (
            <div
              key={i}
              className="relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center overflow-hidden group hover:border-white/10 transition-all"
              style={{ animation: `fadeUp 0.5s ease forwards ${i * 100}ms`, opacity: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-all" />
              <div className="relative z-10">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`font-black text-2xl ${currentMeta.color}`}>{s.value}</div>
                <div className="text-slate-600 text-xs mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard table */}
        <div className="relative rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentMeta.icon}</span>
              <div>
                <h2 className="font-black text-lg text-white">{currentMeta.label} Rankings</h2>
                <p className="text-slate-600 text-xs">Top 50 players by total score</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/quiz/${topic}`)}
              className={`px-4 py-2 bg-gradient-to-r ${currentMeta.activeBg} text-white text-sm font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-lg`}
            >
              Take Quiz →
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-cyan-500/5 flex items-center justify-center">
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
              <button
                onClick={() => navigate(`/quiz/${topic}`)}
                className={`px-6 py-3 bg-gradient-to-r ${currentMeta.activeBg} text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg`}
              >
                Start Quiz →
              </button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-12 px-6 py-3 border-b border-white/5 text-[10px] text-slate-600 uppercase tracking-[0.15em] font-bold">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-right">Total Score</div>
                <div className="col-span-2 text-right">Best</div>
                <div className="col-span-2 text-right">Quizzes</div>
                <div className="col-span-1 text-right">Acc.</div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {leaderboard.map((entry, idx) => {
                  const rankCls = RANK_STYLES[entry.rank] || 'text-slate-500 border-white/10 bg-white/5'
                  const isPodium = entry.rank <= 3
                  return (
                    <div
                      key={entry.rank}
                      className={`px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 ${isPodium ? 'bg-white/[0.01]' : ''}`}
                      style={{ animation: `fadeUp 0.4s ease forwards ${idx * 40}ms`, opacity: 0 }}
                    >
                      {/* Mobile */}
                      <div className="flex md:hidden items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex w-9 h-9 rounded-xl items-center justify-center text-sm font-black border ${rankCls}`}>
                            {RANK_MEDALS[entry.rank] || entry.rank}
                          </span>
                          <div>
                            <p className="text-white font-bold text-sm">{entry.name}</p>
                            <p className="text-slate-600 text-xs">{entry.quizzesTaken} quizzes · {entry.avgAccuracy}% acc</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-base ${currentMeta.color}`}>{entry.totalScore.toFixed(1)}</p>
                          <p className="text-slate-600 text-xs">score</p>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className="hidden md:grid grid-cols-12 items-center">
                        <div className="col-span-1">
                          <span className={`inline-flex w-9 h-9 rounded-xl items-center justify-center text-sm font-black border ${rankCls}`}>
                            {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                          </span>
                        </div>
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/5 flex items-center justify-center text-sm font-black ${currentMeta.color}`}>
                              {entry.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm truncate max-w-[120px]">{entry.name}</p>
                              <p className="text-slate-600 text-xs truncate max-w-[120px]">{entry.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className={`font-black text-base ${currentMeta.color}`}>{entry.totalScore.toFixed(1)}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-white font-semibold">{entry.bestScore.toFixed(1)}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <span className="text-slate-300 font-semibold">{entry.quizzesTaken}</span>
                        </div>
                        <div className="col-span-1 text-right">
                          <span className={`text-sm font-black ${
                            entry.avgAccuracy >= 75 ? 'text-emerald-400' :
                            entry.avgAccuracy >= 50 ? 'text-amber-400'   : 'text-red-400'
                          }`}>{entry.avgAccuracy}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Score formula */}
        <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span>📐</span> Score Formula
          </h4>
          <p className="text-slate-500 text-xs leading-relaxed font-mono">
            Score = (Correct × Difficulty Weight) ÷ Avg. Response Time × 100
            <br />
            <span className="text-emerald-400">Easy ×1</span>
            {' · '}
            <span className="text-amber-400">Medium ×1.5</span>
            {' · '}
            <span className="text-red-400">Hard ×2</span>
            {' · '}
            <span className="text-orange-400">Timed-out = incorrect + 20s penalty</span>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LeaderboardPage