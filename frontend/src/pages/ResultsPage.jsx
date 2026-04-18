import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DIFFICULTY_STYLES = {
  easy:   { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  medium: { badge: 'bg-amber-500/20   text-amber-400   border-amber-500/30'   },
  hard:   { badge: 'bg-red-500/20     text-red-400     border-red-500/30'     },
}

const getGrade = (pct) => {
  if (pct >= 90) return { label: 'Outstanding!', emoji: '🏆', color: 'text-yellow-400',  ring: '#eab308', bg: 'from-yellow-500/10 to-amber-500/5',   border: 'border-yellow-500/20'  }
  if (pct >= 75) return { label: 'Great Work!',  emoji: '🎉', color: 'text-emerald-400', ring: '#10b981', bg: 'from-emerald-500/10 to-teal-500/5', border: 'border-emerald-500/20' }
  if (pct >= 50) return { label: 'Good Effort',  emoji: '👍', color: 'text-cyan-400',    ring: '#06b6d4', bg: 'from-cyan-500/10 to-blue-500/5',    border: 'border-cyan-500/20'    }
  return              { label: 'Keep Practicing', emoji: '💪', color: 'text-orange-400',  ring: '#f97316', bg: 'from-orange-500/10 to-red-500/5',   border: 'border-orange-500/20'  }
}

const ResultsPage = () => {
  const navigate          = useNavigate()
  const { state }         = useLocation()
  const [showReview, setShowReview] = useState(false)
  const [animated,   setAnimated]   = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
  }, [])

  if (!state?.result) { navigate('/dashboard'); return null }

  const { result, topic, difficulty } = state
  const { score, accuracy, correctCount, totalQuestions, review } = result
  const ds    = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium
  const pct   = Math.round(accuracy * 100)
  const grade = getGrade(pct)
  const timedOutCount = review?.filter((r) => r.timedOut).length || 0
  const radius = 52
  const circ   = 2 * Math.PI * radius

  const TOPIC_ICONS = { graphs: '🔗', arrays: '📊', dbms: '🗄️', os: '💻' }

  return (
    <div className="min-h-screen bg-[#020817] py-12 px-4 md:px-6">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scoreRing { from { stroke-dashoffset: ${circ}; } to { stroke-dashoffset: ${circ * (1 - pct / 100)}; } }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.06),transparent)]" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Score card */}
        <div
          className={`relative p-6 md:p-10 rounded-3xl border mb-6 bg-gradient-to-br ${grade.bg} ${grade.border} overflow-hidden`}
          style={{ animation: 'fadeUp 0.7s ease forwards', opacity: 0 }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/3 to-transparent rounded-tr-3xl" />

          {/* Badges row */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${ds.badge} capitalize`}>{difficulty}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs capitalize">{TOPIC_ICONS[topic]} {topic}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">{totalQuestions} Questions</span>
          </div>

          {/* Grade */}
          <div className="text-center mb-8">
            <span className="text-5xl mb-3 block">{grade.emoji}</span>
            <h1 className={`font-black text-3xl md:text-4xl ${grade.color}`}>{grade.label}</h1>
          </div>

          {/* Score ring */}
          <div className="relative w-44 h-44 mx-auto mb-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r={radius} fill="none"
                stroke={grade.ring} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black text-5xl text-white">{pct}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">% accuracy</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Score',     value: score.toFixed(1),             icon: '⭐', color: 'text-yellow-400' },
              { label: 'Correct',   value: `${correctCount}/${totalQuestions}`, icon: '✅', color: 'text-emerald-400' },
              { label: 'Accuracy',  value: `${pct}%`,                   icon: '🎯', color: 'text-cyan-400' },
              { label: 'Timed Out', value: timedOutCount,               icon: '⏰', color: 'text-orange-400' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-black/20 border border-white/5 rounded-2xl p-4 text-center"
                style={{ animation: `fadeUp 0.6s ease forwards ${300 + i * 80}ms`, opacity: 0 }}
              >
                <div className="text-xl mb-2">{s.icon}</div>
                <div className={`font-black text-xl ${s.color}`}>{s.value}</div>
                <div className="text-slate-600 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 mb-6"
          style={{ animation: 'fadeUp 0.6s ease forwards 500ms', opacity: 0 }}
        >
          <button
            onClick={() => navigate(`/quiz/${topic}`)}
            className="group flex-1 relative py-3.5 rounded-2xl font-bold text-white overflow-hidden hover:scale-[1.02] transition-all hover:shadow-xl hover:shadow-cyan-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
            <span className="relative">Try Again 🔄</span>
          </button>
          <button
            onClick={() => navigate(`/leaderboard/${topic}`)}
            className="flex-1 py-3.5 bg-white/[0.03] border border-white/10 text-white font-bold rounded-2xl hover:border-white/20 hover:bg-white/[0.05] hover:scale-[1.02] transition-all"
          >
            Leaderboard 🏆
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3.5 bg-white/[0.02] border border-white/5 text-slate-400 font-bold rounded-2xl hover:border-white/10 hover:text-white hover:scale-[1.02] transition-all"
          >
            Dashboard
          </button>
        </div>

        {/* Review toggle */}
        {review && review.length > 0 && (
          <div style={{ animation: 'fadeUp 0.6s ease forwards 600ms', opacity: 0 }}>
            <button
              onClick={() => setShowReview((v) => !v)}
              className="w-full mb-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl py-4 px-6 flex items-center justify-between text-white font-bold hover:bg-white/[0.04] transition-all"
            >
              <span className="flex items-center gap-2">
                <span>📋</span>
                Question Review
                <span className="text-xs font-normal text-slate-600">({review.length} questions)</span>
              </span>
              <svg className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${showReview ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showReview && (
              <div className="space-y-3">
                {review.map((item, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border p-5 transition-all ${
                      item.timedOut   ? 'border-orange-500/25 bg-orange-500/5' :
                      item.isCorrect  ? 'border-emerald-500/25 bg-emerald-500/5' :
                                        'border-red-500/25 bg-red-500/5'
                    }`}
                    style={{ animation: `fadeUp 0.4s ease forwards ${i * 50}ms`, opacity: 0 }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                        item.timedOut  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        item.isCorrect ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                         'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {item.timedOut ? '⏰' : item.isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold leading-relaxed">
                          <span className="text-slate-600 text-xs mr-2">Q{i + 1}.</span>
                          {item.question}
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                          {item.timeTaken}s{item.timedOut ? ' · timed out' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="ml-11 space-y-2">
                      {item.options?.map((opt, idx) => {
                        const isCorrect  = idx === item.correctAnswer
                        const isSelected = idx === item.selectedOption
                        return (
                          <div key={idx} className={`text-xs flex items-center gap-2 ${
                            isCorrect ? 'text-emerald-400 font-bold' :
                            isSelected ? 'text-red-400 line-through' :
                            'text-slate-600'
                          }`}>
                            <span className="w-5 font-black opacity-60">{['A','B','C','D'][idx]}.</span>
                            <span>{opt}</span>
                            {isCorrect                && <span className="ml-1 text-emerald-500 text-[10px] font-black uppercase tracking-wider">✓ correct</span>}
                            {isSelected && !isCorrect && <span className="ml-1 text-red-500 text-[10px]">← your answer</span>}
                          </div>
                        )
                      })}
                    </div>

                    {item.explanation && (
                      <div className="mt-4 ml-11 p-3 bg-white/5 border border-white/5 rounded-xl">
                        <p className="text-slate-400 text-xs leading-relaxed">
                          <span className="text-cyan-400 font-bold">Explanation: </span>
                          {item.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage