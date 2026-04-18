import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams }                          from 'react-router-dom'
import { onAuthStateChanged }                              from 'firebase/auth'
import { auth }                                            from '../firebase'
import { quizAPI }                                         from '../services/api'

const QUESTION_TIME   = 20
const WINDOW_SIZE     = 5
const TOTAL_QUESTIONS = 20

const DIFFICULTY_STYLES = {
  easy:   { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-500', label: 'Easy',   glow: 'shadow-emerald-500/20', color: '#10b981' },
  medium: { badge: 'bg-amber-500/20   text-amber-400   border-amber-500/30',   bar: 'bg-amber-400',   label: 'Medium', glow: 'shadow-amber-500/20',   color: '#f59e0b' },
  hard:   { badge: 'bg-red-500/20     text-red-400     border-red-500/30',     bar: 'bg-red-500',     label: 'Hard',   glow: 'shadow-red-500/20',     color: '#ef4444' },
}
const TOPIC_ICONS = { graphs: '🔗', arrays: '📊', dbms: '🗄️', os: '💻' }

const SESSION_KEY  = 'aiquiz_session'
const saveSession  = (data) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
const loadSession  = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null } }
const clearSession = () => sessionStorage.removeItem(SESSION_KEY)

// AI Transition overlay
const AITransition = ({ nextDifficulty, engine, onDone }) => {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200)
    const t2 = setTimeout(() => setPhase(2), 2400)
    const t3 = setTimeout(onDone, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  const ds = DIFFICULTY_STYLES[nextDifficulty] || DIFFICULTY_STYLES.medium

  return (
    <div className="fixed inset-0 z-50 bg-[#020817]/98 backdrop-blur-2xl flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'rgba(6,182,212,0.4)' : 'rgba(59,130,246,0.3)',
              animationDelay: `${Math.random() * 2}s`,
            }} />
        ))}
      </div>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      <div className="relative z-10 text-center max-w-md px-6">
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDelay: '0.8s' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
            <span className="text-5xl">🧠</span>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {[
            { text: 'Analysing your last 5 answers...', done: phase >= 1 },
            { text: engine === 'xgboost' ? 'XGBoost predicting optimal difficulty...' : 'Calculating next difficulty...', done: phase >= 2 },
            { text: 'Difficulty selected! Loading next window...', done: phase >= 2, green: true },
          ].map((msg, i) => (
            <div key={i} className={`transition-all duration-600 ${phase >= i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`flex items-center justify-center gap-3 text-sm font-semibold ${msg.green ? 'text-emerald-400' : 'text-slate-300'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.done ? (msg.green ? 'bg-emerald-400' : 'bg-cyan-400') : 'bg-slate-700 animate-pulse'}`} />
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-700 delay-500 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
            <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] mb-3">Next 5 Questions</p>
            <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border text-lg font-black ${ds.badge}`}>
              {nextDifficulty === 'easy' && '🟢'}
              {nextDifficulty === 'medium' && '🟡'}
              {nextDifficulty === 'hard' && '🔴'}
              {ds.label} Difficulty
            </div>
            <p className="text-slate-700 text-xs mt-3">Powered by {engine}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Circular countdown timer
const CircularTimer = ({ timeLeft, total }) => {
  const pct    = timeLeft / total
  const radius = 22
  const circ   = 2 * Math.PI * radius
  const offset = circ * (1 - pct)
  const color  = timeLeft > 10 ? '#06b6d4' : timeLeft > 5 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#0f172a" strokeWidth="4" />
        <circle cx="28" cy="28" r={radius} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }} />
      </svg>
      <span className="relative font-mono font-black text-sm tabular-nums" style={{ color }}>{timeLeft}</span>
    </div>
  )
}

const QuizPage = () => {
  const { topic } = useParams()
  const navigate  = useNavigate()

  const [attemptId,         setAttemptId]         = useState(null)
  const [allQuestions,      setAllQuestions]       = useState([])
  const [currentDifficulty, setCurrentDifficulty] = useState('medium')
  const [aiEngine,          setAiEngine]           = useState('xgboost')
  const [currentIdx,        setCurrentIdx]         = useState(0)
  const [windowAnswers,     setWindowAnswers]      = useState([])
  const [pendingNext,       setPendingNext]        = useState(null)

  const [selected,      setSelected]      = useState(null)
  const [timeLeft,      setTimeLeft]      = useState(QUESTION_TIME)
  const [timedOut,      setTimedOut]      = useState(false)
  const [questionStart, setQuestionStart] = useState(Date.now())
  const [answered,      setAnswered]      = useState(false)

  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAI,     setShowAI]     = useState(false)
  const [isResume,   setIsResume]   = useState(false)
  const [error,      setError]      = useState('')

  const timerRef    = useRef(null)
  const autoNextRef = useRef(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) navigate('/login') })
    return () => unsub()
  }, [navigate])

  useEffect(() => {
    const init = async () => {
      setLoading(true); setError('')
      try {
        // Call /start — backend returns existing incomplete attempt OR creates new one
        const data = await quizAPI.start(topic)

        if (data.isResume) {
          // ── RESUME: backend returned the existing incomplete attempt ──────
          // data.currentQuestionIdx = number of questions already answered
          // data.questions = ALL question IDs served so far (from questionIds)
          // We restore directly to the question the user was on
          const resumeIdx = data.currentQuestionIdx || 0

          setAttemptId(data.attemptId)
          setAllQuestions(data.questions)
          setCurrentDifficulty(data.difficulty)
          setCurrentIdx(resumeIdx)   // ← KEY FIX: restore to exact question
          setWindowAnswers([])
          setIsResume(true)

          // Persist to sessionStorage so sub-window refreshes also work
          saveSession({ topic, attemptId: data.attemptId, currentIdx: resumeIdx })
        } else {
          // ── FRESH START ───────────────────────────────────────────────────
          setAttemptId(data.attemptId)
          setAllQuestions(data.questions)
          setCurrentDifficulty(data.difficulty)
          setAiEngine(data.engine || 'xgboost')
          setCurrentIdx(0)
          setWindowAnswers([])
          setIsResume(false)
          saveSession({ topic, attemptId: data.attemptId, currentIdx: 0 })
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
    return () => { clearInterval(timerRef.current); clearTimeout(autoNextRef.current) }
  }, [topic])

  // Keep sessionStorage in sync whenever currentIdx changes
  useEffect(() => {
    if (attemptId) saveSession({ topic, attemptId, currentIdx })
  }, [topic, attemptId, currentIdx])

  useEffect(() => {
    if (loading || showAI || !allQuestions.length || currentIdx >= allQuestions.length) return
    setTimeLeft(QUESTION_TIME); setAnswered(false); setSelected(null); setTimedOut(false); setQuestionStart(Date.now())
    clearInterval(timerRef.current); clearTimeout(autoNextRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setAnswered((alreadyAnswered) => {
            if (!alreadyAnswered) {
              setTimedOut(true)
              autoNextRef.current = setTimeout(() => triggerAdvance(null, true), 1500)
            }
            return true
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { clearInterval(timerRef.current); clearTimeout(autoNextRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, allQuestions.length, loading, showAI])

  const answeredRef      = useRef(answered)
  const selectedRef      = useRef(selected)
  const windowAnswersRef = useRef(windowAnswers)
  const currentIdxRef    = useRef(currentIdx)
  const allQuestionsRef  = useRef(allQuestions)
  const attemptIdRef     = useRef(attemptId)
  const currentDiffRef   = useRef(currentDifficulty)
  const questionStartRef = useRef(questionStart)

  useEffect(() => { answeredRef.current      = answered        }, [answered])
  useEffect(() => { selectedRef.current      = selected        }, [selected])
  useEffect(() => { windowAnswersRef.current = windowAnswers   }, [windowAnswers])
  useEffect(() => { currentIdxRef.current    = currentIdx      }, [currentIdx])
  useEffect(() => { allQuestionsRef.current  = allQuestions    }, [allQuestions])
  useEffect(() => { attemptIdRef.current     = attemptId       }, [attemptId])
  useEffect(() => { currentDiffRef.current   = currentDifficulty }, [currentDifficulty])
  useEffect(() => { questionStartRef.current = questionStart   }, [questionStart])

  const triggerAdvance = useCallback(async (overrideSelected = null, isTimeout = false) => {
    const sel       = overrideSelected !== null ? overrideSelected : selectedRef.current
    const idx       = currentIdxRef.current
    const questions = allQuestionsRef.current
    const currentQ  = questions[idx]
    if (!currentQ) return

    const timeTaken = isTimeout ? QUESTION_TIME : Math.min(Math.round((Date.now() - questionStartRef.current) / 1000), QUESTION_TIME)
    const answer    = { questionId: currentQ._id, selectedOption: isTimeout ? null : sel, timeTaken, timedOut: isTimeout }
    const newWindowAnswers = [...windowAnswersRef.current, answer]
    setWindowAnswers(newWindowAnswers)

    // Determine window boundary based on position within the CURRENT window
    // Window 0: Q0–Q4, Window 1: Q5–Q9, etc.
    const windowStart  = Math.floor(idx / WINDOW_SIZE) * WINDOW_SIZE
    const windowEnd    = windowStart + WINDOW_SIZE - 1
    const isWindowDone = idx === windowEnd || idx === TOTAL_QUESTIONS - 1

    if (isWindowDone) {
      setSubmitting(true)
      try {
        const result = await quizAPI.submitWindow(attemptIdRef.current, newWindowAnswers)
        setWindowAnswers([])
        if (result.isComplete) {
          clearSession()
          navigate('/quiz/results', { state: { result, topic, difficulty: currentDiffRef.current } })
          return
        }
        setPendingNext({ nextQuestions: result.nextQuestions, nextDifficulty: result.nextDifficulty, engine: result.engine })
        setShowAI(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setSubmitting(false)
      }
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }, [navigate, topic])

  const handleAIDone = useCallback(() => {
    if (!pendingNext) return
    setAllQuestions((prev) => [...prev, ...pendingNext.nextQuestions])
    setCurrentDifficulty(pendingNext.nextDifficulty)
    setAiEngine(pendingNext.engine)
    setCurrentIdx((i) => i + 1)
    setPendingNext(null); setShowAI(false)
  }, [pendingNext])

  const handleSelect = useCallback((optionIdx) => {
    if (answeredRef.current) return
    clearInterval(timerRef.current); clearTimeout(autoNextRef.current)
    setSelected(optionIdx); setAnswered(true)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (showAI || loading || answeredRef.current) return
      if (['1','2','3','4'].includes(e.key)) handleSelect(parseInt(e.key) - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAI, loading, handleSelect])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && answeredRef.current && !showAI && !submitting) {
        clearTimeout(autoNextRef.current); triggerAdvance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAI, submitting, triggerAdvance])

  if (loading) return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full bg-cyan-500/5 flex items-center justify-center">
            <span className="text-4xl">🧠</span>
          </div>
        </div>
        <p className="text-white font-black text-xl mb-2">
          {loadSession()?.topic === topic ? 'Resuming your quiz...' : 'AI preparing your quiz...'}
        </p>
        <p className="text-slate-600 text-sm">Analysing your history</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="font-black text-2xl text-white mb-3">Failed to load quiz</h2>
        <p className="text-red-400 text-sm mb-8">{error}</p>
        <button onClick={() => navigate('/dashboard')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all">
          Back to Dashboard
        </button>
      </div>
    </div>
  )

  const currentQ  = allQuestions[currentIdx]
  const ds        = DIFFICULTY_STYLES[currentDifficulty] || DIFFICULTY_STYLES.medium
  const progress  = (currentIdx / TOTAL_QUESTIONS) * 100
  const windowNum = Math.floor(currentIdx / WINDOW_SIZE) + 1
  const qInWindow = (currentIdx % WINDOW_SIZE) + 1
  const isUrgent  = timeLeft <= 5

  return (
    <>
      {showAI && pendingNext && (
        <AITransition nextDifficulty={pendingNext.nextDifficulty} engine={pendingNext.engine} onDone={handleAIDone} />
      )}

      <div className="min-h-screen bg-[#020817] flex flex-col">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-5%,rgba(6,182,212,0.06),transparent)]" />
        </div>

        {/* Top bar */}
        <header className="relative z-40 bg-[#020817]/80 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => { clearSession(); navigate('/dashboard') }}
                className="text-slate-600 hover:text-white transition-colors group">
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-base">{TOPIC_ICONS[topic]}</span>
                <span className="text-white font-bold capitalize text-sm">{topic}</span>
              </div>
            </div>
            <span className={`hidden sm:inline-flex text-xs font-black px-3 py-1.5 rounded-xl border ${ds.badge}`}>
              {ds.label}
            </span>
            <CircularTimer timeLeft={timeLeft} total={QUESTION_TIME} />
          </div>
        </header>

        {/* Overall progress bar */}
        <div className="relative w-full h-1 bg-white/5">
          <div className={`absolute left-0 top-0 h-full ${ds.bar} transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }} />
          <div className={`absolute left-0 top-0 h-full ${ds.bar} opacity-40 blur-sm transition-all duration-700`}
            style={{ width: `${progress}%` }} />
        </div>

        {/* Meta bar */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 font-bold">
              Window {windowNum}/4
            </span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:inline">Q{qInWindow}/{WINDOW_SIZE}</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:inline text-cyan-500 font-bold text-xs">🤖 {aiEngine}</span>
          </div>
          <span className="text-slate-600 text-xs font-bold">
            {currentIdx + 1} <span className="text-slate-800">/</span> {TOTAL_QUESTIONS}
          </span>
        </div>

        {/* Question dots */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-5">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
              const loaded = i < allQuestions.length
              const done   = i < currentIdx
              const active = i === currentIdx
              return (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                  active ? `w-6 ${ds.bar} shadow-sm` :
                  done   ? 'w-3 bg-cyan-500/50' :
                  loaded ? 'w-3 bg-white/10' :
                           'w-3 bg-white/5'
                }`} />
              )
            })}
          </div>
        </div>

        {/* Resume banner */}
        {isResume && (
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
              <span>🔄</span>
              <span>Quiz resumed — continuing from Question {currentIdx + 1}</span>
              <button onClick={() => setIsResume(false)} className="ml-auto text-cyan-600 hover:text-cyan-400 transition-colors">✕</button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col px-4 md:px-6 pb-10 relative z-10">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            {currentQ ? (
              <>
                {timedOut && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold">
                    <span>⏰</span> Time's up! Moving on...
                  </div>
                )}

                {/* Question card */}
                <div className={`relative p-6 md:p-8 rounded-2xl mb-6 border transition-all duration-500 overflow-hidden ${
                  isUrgent && !answered
                    ? 'border-red-500/30 bg-red-500/5 shadow-xl shadow-red-500/10'
                    : 'border-white/5 bg-white/[0.02]'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-bl-2xl pointer-events-none" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Question {currentIdx + 1} of {TOTAL_QUESTIONS}</p>
                  <h2 className="text-white text-lg md:text-xl font-bold leading-relaxed">{currentQ.question}</h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {currentQ.options?.map((opt, idx) => {
                    let cls = 'border-white/5 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer active:scale-[0.98]'
                    if (answered) {
                      if (timedOut) cls = 'border-white/5 bg-white/[0.01] opacity-30 cursor-default'
                      else if (idx === selected) cls = 'border-cyan-500/60 bg-cyan-500/15 cursor-default shadow-lg shadow-cyan-500/10'
                      else cls = 'border-white/5 bg-white/[0.01] opacity-20 cursor-default'
                    }
                    return (
                      <button
                        key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                        className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-200 group ${cls}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${
                            answered && idx === selected && !timedOut
                              ? 'bg-cyan-500 border-cyan-400 text-white'
                              : 'bg-white/5 border-white/10 text-slate-500 group-hover:border-cyan-500/30 group-hover:text-cyan-400'
                          }`}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">{opt}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {answered && !timedOut && !submitting && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => { clearTimeout(autoNextRef.current); triggerAdvance() }}
                      disabled={submitting}
                      className="relative px-8 py-3.5 font-bold text-white rounded-xl overflow-hidden group hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
                      <span className="relative flex items-center gap-2">
                        {currentIdx + 1 === TOTAL_QUESTIONS
                          ? 'Finish Quiz 🎯'
                          : currentIdx % WINDOW_SIZE === WINDOW_SIZE - 1
                            ? 'Submit Window ⚡'
                            : <>Next <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></>
                        }
                      </span>
                    </button>
                  </div>
                )}

                {submitting && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm font-bold">Submitting to AI...</span>
                    </div>
                  </div>
                )}

                {!answered && (
                  <p className="text-center text-slate-700 text-xs mt-2">Press 1–4 to select · Enter to confirm</p>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-slate-600 text-sm">Loading next question...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}

export default QuizPage