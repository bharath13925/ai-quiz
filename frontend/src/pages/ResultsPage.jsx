import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DIFFICULTY_STYLES = {
  easy:   { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Easy',   color: '#10b981' },
  medium: { badge: 'bg-amber-500/20   text-amber-400   border-amber-500/30',   label: 'Medium', color: '#f59e0b' },
  hard:   { badge: 'bg-red-500/20     text-red-400     border-red-500/30',     label: 'Hard',   color: '#ef4444' },
}
const TOPIC_ICONS = {
  graphs: '🔗', arrays: '📊', dbms: '🗄️', os: '💻',
  stacks: '📚', queues: '🔁', trees: '🌳', hashing: '#️⃣', backtracking: '↩️',
}
const DIFF_WEIGHTS = { easy: 1, medium: 1.5, hard: 2 }

const getGrade = (pct) => {
  if (pct >= 90) return { label: 'Outstanding!',   emoji: '🏆', color: '#eab308', ring: '#eab308', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.2)'   }
  if (pct >= 75) return { label: 'Great Work!',    emoji: '🎉', color: '#10b981', ring: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  }
  if (pct >= 50) return { label: 'Good Effort',    emoji: '👍', color: '#06b6d4', ring: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.2)'   }
  return              { label: 'Keep Practicing', emoji: '💪', color: '#f97316', ring: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)'  }
}

// ─── Score Formula Card ───────────────────────────────────────────────────────
const ScoreFormulaCard = ({ result, difficulty }) => {
  const bd       = result.scoreBreakdown
  const weight   = bd?.weight    || DIFF_WEIGHTS[difficulty] || 1
  const correct  = result.correctCount   || 0
  const incorrect = result.incorrectCount || 0
  const timeout  = result.timeoutCount   || 0
  const avgTime  = bd?.avgTime   || 0
  const accuracy = bd?.accuracy  ?? Math.round((result.accuracy || 0) * 100)
  const score    = result.score  || 0

  const rawNumerator = (correct * weight * 10) - (incorrect * 5) - (timeout * 10)
  const formula = `((${correct}×${weight}×10) − (${incorrect}×5) − (${timeout}×10)) × ${accuracy}% ÷ (1 + ${avgTime}÷10)`

  return (
    <div className="p-6 rounded-2xl mb-6"
      style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)' }}>
      <h3 className="text-white font-black text-base mb-4 flex items-center gap-2">
        <span>📐</span> How Your Score Was Calculated
      </h3>

      {/* Formula display */}
      <div className="text-center mb-5 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2">Pro Score Formula</p>
        <p className="text-cyan-400 font-mono text-xs md:text-sm font-bold leading-relaxed">
          ((Correct × Weight × 10) − (Wrong × 5) − (Timeout × 10)) × Accuracy ÷ (1 + AvgTime / 10)
        </p>
      </div>

      {/* Formula breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Correct',    value: correct,           icon: '✅', color: '#10b981', desc: 'Right answers'         },
          { label: 'Weight',     value: `×${weight}`,      icon: '⚖️', color: '#f59e0b', desc: 'Difficulty multiplier' },
          { label: 'Accuracy',   value: `${accuracy}%`,    icon: '🎯', color: '#06b6d4', desc: 'Accuracy factor'       },
          { label: 'Avg Time',   value: `${avgTime}s`,     icon: '⏱️', color: '#a78bfa', desc: 'Per question (max 20s)'},
          { label: 'Final Score',value: score.toFixed(1),  icon: '⭐', color: '#eab308', desc: 'Leaderboard score'     },
        ].map((item, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-lg mb-1">{item.icon}</div>
            <div className="font-black text-lg" style={{ color: item.color }}>{item.value}</div>
            <div className="text-slate-600 text-[10px] mt-1 leading-tight">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Penalty display */}
      {(incorrect > 0 || timeout > 0) && (
        <div className="flex gap-3 mb-4">
          {incorrect > 0 && (
            <div className="flex-1 p-2 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-red-400 text-xs font-bold">−{incorrect * 5} pts</p>
              <p className="text-slate-600 text-[10px]">Wrong penalty ({incorrect}×5)</p>
            </div>
          )}
          {timeout > 0 && (
            <div className="flex-1 p-2 rounded-xl text-center" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <p className="text-orange-400 text-xs font-bold">−{timeout * 10} pts</p>
              <p className="text-slate-600 text-[10px]">Timeout penalty ({timeout}×10)</p>
            </div>
          )}
        </div>
      )}

      {/* Actual calculation */}
      <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <p className="text-slate-500 text-xs font-mono leading-relaxed">
          {formula}
          <span className="text-slate-600 mx-2">=</span>
          <span className="text-cyan-400 font-black">{score.toFixed(2)}</span>
        </p>
        <p className="text-slate-700 text-[10px] mt-1">
          Fast + accurate answers earn more · wrong/timeout answers reduce score · lower avg time boosts score
        </p>
      </div>

      {/* Difficulty weight reference */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {[['Easy', '×1', '#10b981'], ['Medium', '×1.5', '#f59e0b'], ['Hard', '×2', '#ef4444']].map(([label, w, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs text-slate-500">{label} <span style={{ color }} className="font-bold">{w}</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stats Summary Row ────────────────────────────────────────────────────────
const StatsSummaryRow = ({ result }) => {
  const correct   = result.correctCount   || 0
  const incorrect = result.incorrectCount || 0
  const timeout   = result.timeoutCount   || 0
  const total     = result.totalQuestions || 20

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="p-4 rounded-2xl text-center transition-all hover:scale-105 cursor-default"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="text-2xl mb-1">✅</div>
        <div className="font-black text-2xl text-emerald-400">{correct}</div>
        <div className="text-emerald-600 text-xs mt-1">Correct</div>
        <div className="text-slate-700 text-[10px]">{Math.round((correct/total)*100)}% of total</div>
      </div>
      <div className="p-4 rounded-2xl text-center transition-all hover:scale-105 cursor-default"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
        <div className="text-2xl mb-1">❌</div>
        <div className="font-black text-2xl text-red-400">{incorrect}</div>
        <div className="text-red-600 text-xs mt-1">Incorrect</div>
        <div className="text-slate-700 text-[10px]">{Math.round((incorrect/total)*100)}% of total</div>
      </div>
      <div className="p-4 rounded-2xl text-center transition-all hover:scale-105 cursor-default"
        style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)' }}>
        <div className="text-2xl mb-1">⏰</div>
        <div className="font-black text-2xl text-orange-400">{timeout}</div>
        <div className="text-orange-600 text-xs mt-1">Timed Out</div>
        <div className="text-slate-700 text-[10px]">{Math.round((timeout/total)*100)}% of total</div>
      </div>
    </div>
  )
}

// ─── Question Review Card ─────────────────────────────────────────────────────
const ReviewCard = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false)

  const borderColor = item.timedOut ? 'rgba(249,115,22,0.3)' : item.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'
  const bgColor     = item.timedOut ? 'rgba(249,115,22,0.05)' : item.isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)'
  const iconColor   = item.timedOut ? '#f97316' : item.isCorrect ? '#10b981' : '#ef4444'
  const iconText    = item.timedOut ? '⏰' : item.isCorrect ? '✓' : '✗'
  const statusLabel = item.timedOut ? 'Timed Out' : item.isCorrect ? 'Correct' : 'Incorrect'
  const statusBg    = item.timedOut
    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    : item.isCorrect
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    : 'bg-red-500/15 text-red-400 border-red-500/30'

  const diffStyle = DIFFICULTY_STYLES[item.difficulty] || DIFFICULTY_STYLES.medium

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ border: `1px solid ${borderColor}`, background: bgColor }}>

      {/* Header row */}
      <button
        className="w-full text-left p-5 flex items-start gap-3"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black mt-0.5"
          style={{ background: `${iconColor}20`, border: `1px solid ${iconColor}40`, color: iconColor }}>
          {iconText}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-slate-500 text-xs">Q{index + 1}.</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${statusBg}`}>{statusLabel}</span>
            {item.difficulty && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${diffStyle.badge} capitalize`}>{item.difficulty}</span>
            )}
            <span className="text-slate-600 text-xs ml-auto">{item.timeTaken}s</span>
          </div>
          <p className="text-white text-sm font-semibold leading-relaxed line-clamp-2">{item.question}</p>
        </div>
        <svg className={`flex-shrink-0 w-4 h-4 text-slate-600 transition-transform duration-300 mt-1 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5">
          {/* Options */}
          <div className="space-y-1.5 mb-4 ml-11">
            {item.options?.map((opt, idx) => {
              const isCorrectOpt  = idx === item.correctAnswer
              const isSelectedOpt = idx === item.selectedOption
              let optStyle = { color: '#475569' }
              let prefix   = null

              if (isCorrectOpt && isSelectedOpt) {
                optStyle = { color: '#34d399', fontWeight: 700 }
                prefix   = <span className="text-emerald-500 text-[10px] font-black uppercase tracking-wider ml-1">✓ your answer · correct</span>
              } else if (isCorrectOpt) {
                optStyle = { color: '#34d399', fontWeight: 700 }
                prefix   = <span className="text-emerald-500 text-[10px] font-black uppercase tracking-wider ml-1">✓ correct answer</span>
              } else if (isSelectedOpt) {
                optStyle = { color: '#f87171', textDecoration: 'line-through' }
                prefix   = <span className="text-red-500 text-[10px] ml-1">← your answer</span>
              }

              return (
                <div key={idx} className="flex items-center gap-2 text-xs" style={optStyle}>
                  <span className="font-black opacity-60 flex-shrink-0">{['A','B','C','D'][idx]}.</span>
                  <span>{opt}</span>
                  {prefix}
                </div>
              )
            })}
          </div>

          {/* Explanation */}
          {item.explanation ? (
            <div className="ml-11 p-3 rounded-xl"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="text-cyan-400 font-bold">💡 Explanation: </span>
                {item.explanation}
              </p>
            </div>
          ) : (
            <div className="ml-11 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-slate-600 text-xs italic">No explanation available for this question.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ResultsPage ─────────────────────────────────────────────────────────
const ResultsPage = () => {
  const navigate          = useNavigate()
  const { state }         = useLocation()
  const [showReview,      setShowReview]      = useState(false)
  const [reviewFilter,    setReviewFilter]    = useState('all')
  const [animated,        setAnimated]        = useState(false)
  const [hoveredAction,   setHoveredAction]   = useState(null)

  useEffect(() => { setTimeout(() => setAnimated(true), 150) }, [])

  if (!state?.result) { navigate('/dashboard'); return null }

  const { result, topic, difficulty } = state
  const { score, accuracy, correctCount, incorrectCount, timeoutCount, totalQuestions, review, autoSubmitted } = result

  const ds    = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium
  const pct   = Math.round(accuracy * 100)
  const grade = getGrade(pct)
  const radius = 52
  const circ   = 2 * Math.PI * radius

  // Filter review
  const filteredReview = (review || []).filter(item => {
    if (reviewFilter === 'correct')   return item.isCorrect && !item.timedOut
    if (reviewFilter === 'incorrect') return !item.isCorrect && !item.timedOut
    if (reviewFilter === 'timeout')   return item.timedOut
    return true
  })

  const actions = [
    { label: 'Try Again 🔄',   id: 'retry', onClick: () => navigate(`/quiz/${topic}`),        grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
    { label: 'Leaderboard 🏆', id: 'lb',    onClick: () => navigate(`/leaderboard/${topic}`), grad: 'rgba(255,255,255,0.04)' },
    { label: 'Dashboard',      id: 'dash',  onClick: () => navigate('/dashboard'),            grad: 'rgba(255,255,255,0.02)' },
  ]

  return (
    <div className="min-h-screen bg-[#020817] py-12 px-4 md:px-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeUpResult { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes confettiFall {
          0%   { transform:translateY(-20px) rotate(0); opacity:1; }
          100% { transform:translateY(80px)  rotate(360deg); opacity:0; }
        }
        .review-filter-btn { transition: all 0.2s ease; }
        .action-btn { transition: all 0.25s ease; }
        .action-btn:hover { transform: translateY(-2px); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(6,182,212,0.05),transparent)]" />
        {animated && pct >= 75 && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${Math.random() * 30}%`,
              background: ['#06b6d4','#3b82f6','#10b981','#eab308','#a78bfa'][i % 5],
              animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1}s forwards`,
              opacity: 0,
            }} />
        ))}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Auto-submitted banner */}
        {autoSubmitted && (
          <div className="mb-6 p-4 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', animation: 'fadeUpResult 0.6s ease forwards', opacity: 0 }}>
            <span className="text-2xl">🚫</span>
            <div>
              <p className="text-red-400 font-bold text-sm">Quiz Auto-Submitted</p>
              <p className="text-slate-500 text-xs">This quiz was automatically submitted due to a repeated fullscreen/tab violation. Result is recorded on the leaderboard.</p>
            </div>
          </div>
        )}

        {/* Score card */}
        <div className="relative p-6 md:p-10 rounded-3xl mb-6 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${grade.bg}, rgba(2,8,23,0.5))`,
            border: `1px solid ${grade.border}`,
            animation: 'fadeUpResult 0.7s ease forwards',
            opacity: 0,
            boxShadow: `0 0 80px ${grade.ring}20`,
          }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-3xl pointer-events-none"
            style={{ background: `linear-gradient(225deg,${grade.bg},transparent)` }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-tr-3xl pointer-events-none"
            style={{ background: `linear-gradient(45deg,${grade.bg},transparent)` }} />

          {/* Badges row */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            <span className={`text-xs font-black px-3 py-1 rounded-xl border ${ds.badge} capitalize`}>{difficulty}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs capitalize">{TOPIC_ICONS[topic] || '📚'} {topic}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-500 text-xs">{totalQuestions} Questions</span>
          </div>

          {/* Grade */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3" style={{ animation: 'popIn 0.5s ease forwards 0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              {grade.emoji}
            </div>
            <h1 className="font-black text-3xl md:text-4xl" style={{ color: grade.color, fontFamily: "'Syne',sans-serif" }}>
              {grade.label}
            </h1>
          </div>

          {/* Score ring */}
          <div className="relative w-44 h-44 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: grade.ring }} />
            <svg className="relative w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="60" cy="60" r={radius} fill="none"
                stroke={grade.ring} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
                style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black text-5xl text-white">{pct}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">% accuracy</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Score',    value: score.toFixed(1),    icon: '⭐', color: '#eab308' },
              { label: 'Accuracy', value: `${pct}%`,           icon: '🎯', color: '#06b6d4' },
              { label: 'Correct',  value: correctCount || 0,   icon: '✅', color: '#10b981' },
              { label: 'Time Out', value: timeoutCount || 0,   icon: '⏰', color: '#f97316' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 cursor-default"
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  animation: `fadeUpResult 0.6s ease forwards ${300 + i * 80}ms`,
                  opacity: 0,
                }}>
                <div className="text-xl mb-2">{s.icon}</div>
                <div className="font-black text-xl" style={{ color: s.color }}>{s.value}</div>
                <div className="text-slate-600 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Correct / Incorrect / Timeout breakdown */}
        <div style={{ animation: 'fadeUpResult 0.6s ease forwards 400ms', opacity: 0 }}>
          <StatsSummaryRow result={result} />
        </div>

        {/* Score Formula explanation (pro version) */}
        <div style={{ animation: 'fadeUpResult 0.6s ease forwards 450ms', opacity: 0 }}>
          <ScoreFormulaCard result={result} difficulty={difficulty} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6"
          style={{ animation: 'fadeUpResult 0.6s ease forwards 500ms', opacity: 0 }}>
          {actions.map((action, i) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-white text-sm relative overflow-hidden"
              style={{
                background: action.grad,
                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: hoveredAction === action.id && i === 0 ? '0 8px 32px rgba(6,182,212,0.3)' : 'none',
              }}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <div className={`absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-200 ${hoveredAction === action.id ? 'opacity-100' : ''}`} />
              <span className="relative">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Review section */}
        {review && review.length > 0 && (
          <div style={{ animation: 'fadeUpResult 0.6s ease forwards 600ms', opacity: 0 }}>
            <button
              onClick={() => setShowReview((v) => !v)}
              className="w-full mb-4 flex items-center justify-between rounded-2xl py-4 px-6 font-bold text-white transition-all duration-300 hover:scale-[1.005]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
            >
              <span className="flex items-center gap-2 text-sm">
                <span>📋</span> Question Review with Explanations
                <span className="text-xs font-normal text-slate-600">({review.length} questions)</span>
              </span>
              <svg className={`w-5 h-5 text-slate-600 transition-transform duration-400 ${showReview ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showReview && (
              <div>
                {/* Filter tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[
                    { id: 'all',       label: `All (${review.length})`,                  color: '#06b6d4' },
                    { id: 'correct',   label: `Correct (${correctCount || 0})`,          color: '#10b981' },
                    { id: 'incorrect', label: `Incorrect (${incorrectCount || 0})`,      color: '#ef4444' },
                    { id: 'timeout',   label: `Timed Out (${timeoutCount || 0})`,        color: '#f97316' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setReviewFilter(tab.id)}
                      className="review-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200"
                      style={reviewFilter === tab.id
                        ? { background: `${tab.color}20`, border: `1px solid ${tab.color}50`, color: tab.color }
                        : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569' }
                      }
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {filteredReview.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-sm">No questions in this category.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredReview.map((item, i) => (
                      <div key={i}
                        style={{ animation: `fadeUpResult 0.4s ease forwards ${i * 40}ms`, opacity: 0 }}>
                        <ReviewCard item={item} index={review.indexOf(item)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsPage