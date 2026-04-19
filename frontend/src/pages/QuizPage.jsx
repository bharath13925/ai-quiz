import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams }                          from 'react-router-dom'
import { onAuthStateChanged }                              from 'firebase/auth'
import { auth }                                            from '../firebase'
import { quizAPI }                                         from '../services/api'

const QUESTION_TIME   = 20
const WINDOW_SIZE     = 5
const TOTAL_QUESTIONS = 20

const DIFFICULTY_STYLES = {
  easy:   { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', bar: 'bg-emerald-500', label: 'Easy',   color: '#10b981' },
  medium: { badge: 'bg-amber-500/20   text-amber-400   border-amber-500/30',   bar: 'bg-amber-400',   label: 'Medium', color: '#f59e0b' },
  hard:   { badge: 'bg-red-500/20     text-red-400     border-red-500/30',     bar: 'bg-red-500',     label: 'Hard',   color: '#ef4444' },
}
const TOPIC_ICONS = { graphs: '🔗', arrays: '📊', dbms: '🗄️', os: '💻', stacks: '📚', queues: '🔁', trees: '🌳', hashing: '#️⃣', backtracking: '↩️' }

const SESSION_KEY  = 'aiquiz_session'
const saveSession  = (data) => { try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch {} }
const loadSession  = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null } }
const clearSession = () => { try { sessionStorage.removeItem(SESSION_KEY) } catch {} }

// ─── Instructions Modal ───────────────────────────────────────────────────────
const InstructionsModal = ({ topic, difficulty, onStart, onCancel, isResume }) => {
  const [checked, setChecked] = useState(false)
  const ds = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium

  return (
    <div className="fixed inset-0 z-50 bg-[#020817]/98 backdrop-blur-2xl flex items-center justify-center px-4 overflow-y-auto py-6">
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(6,182,212,0.8) 1px,transparent 0)',
        backgroundSize: '32px 32px',
      }} />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6,182,212,0.2)', backdropFilter: 'blur(20px)' }}>
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#06b6d4,#3b82f6,#8b5cf6)' }} />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
                {TOPIC_ICONS[topic] || '📚'}
              </div>
              <div>
                <h2 className="font-black text-2xl text-white capitalize" style={{ fontFamily: "'Syne',sans-serif" }}>
                  {isResume ? 'Resume Quiz' : 'Quiz Instructions'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 text-sm capitalize">{topic}</span>
                  <span className="text-slate-600">·</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${ds.badge} capitalize`}>{difficulty}</span>
                  {isResume && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">Resuming</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-3 mb-8">
              {[
                { icon: '📋', title: '20 Questions Total', desc: 'Split into 4 adaptive windows of 5 questions each.' },
                { icon: '⏱️', title: '20-Second Timer', desc: 'Each question has a strict 20s countdown. Unanswered = wrong + full 20s penalty.' },
                { icon: '🤖', title: 'AI Adapts Difficulty', desc: 'XGBoost AI analyses your accuracy, speed & streak after each window to set the next difficulty.' },
                { icon: '🖥️', title: 'Fullscreen Required', desc: 'Quiz runs in fullscreen mode. Switching tabs or exiting fullscreen counts as a violation.' },
                { icon: '⚠️', title: 'Violation Policy', desc: '1st violation: Quiz pauses — you can resume. 2nd violation: Quiz auto-submits immediately with no appeal.' },
                { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'Press 1–4 to select an option · Enter to confirm and move to the next question.' },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{rule.icon}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{rule.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fullscreen warning */}
            <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="text-red-400 text-xl flex-shrink-0">🚨</span>
              <p className="text-red-300 text-sm leading-relaxed">
                <span className="font-bold">Critical:</span> 2nd tab switch or fullscreen exit will{' '}
                <span className="font-bold underline">permanently auto-submit</span> your quiz. First violation shows a warning and allows resume.
              </p>
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start gap-3 mb-6 cursor-pointer" onClick={() => setChecked(v => !v)}>
              <div
                className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 select-none"
                style={{
                  borderColor: checked ? '#06b6d4' : 'rgba(255,255,255,0.3)',
                  background:  checked ? 'rgba(6,182,212,0.2)' : 'transparent',
                  minWidth: '20px',
                }}
              >
                {checked && (
                  <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-slate-400 text-sm leading-relaxed hover:text-slate-300 transition-colors select-none">
                I understand the violation policy and accept these conditions.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-bold text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all duration-200 text-sm">
                Cancel
              </button>
              <button
                onClick={() => { if (checked) onStart() }}
                disabled={!checked}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background:  checked ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : 'rgba(255,255,255,0.05)',
                  boxShadow:   checked ? '0 4px 20px rgba(6,182,212,0.3)' : 'none',
                  cursor:      checked ? 'pointer' : 'not-allowed',
                  opacity:     checked ? 1 : 0.5,
                }}>
                {isResume ? 'Resume in Fullscreen 🔄' : 'Enter Fullscreen & Start Quiz 🚀'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── AI Transition overlay ────────────────────────────────────────────────────
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
      <div className="relative z-10 text-center max-w-md px-6">
        <div className="relative w-28 h-28 mx-auto mb-10">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
            <span className="text-5xl">🧠</span>
          </div>
        </div>
        <div className="space-y-4 mb-10">
          {[
            { text: 'Analysing your last 5 answers…', done: phase >= 1 },
            { text: engine === 'xgboost' ? 'XGBoost predicting optimal difficulty…' : 'Calculating next difficulty…', done: phase >= 2 },
            { text: 'Difficulty selected! Loading next window…', done: phase >= 2, green: true },
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
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
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

// ─── Circular countdown timer ─────────────────────────────────────────────────
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

// ─── 1st Violation Warning overlay (resumeable) ───────────────────────────────
const ViolationWarnOverlay = ({ reason, onResume }) => (
  <div className="fixed inset-0 z-[60] bg-[#020817]/95 backdrop-blur-2xl flex items-center justify-center px-4">
    <div className="max-w-md w-full p-8 rounded-3xl text-center"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="font-black text-2xl text-amber-400 mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
        Warning — Violation #{1}
      </h3>
      <p className="text-slate-300 text-sm leading-relaxed mb-2">
        {reason === 'tab' ? 'You switched away from the quiz tab.' : 'You exited fullscreen mode.'}
      </p>
      <p className="text-amber-300 text-sm font-bold mb-6">
        This is your <span className="underline">first and only warning</span>.<br />
        A second violation will <span className="text-red-400">permanently auto-submit</span> your quiz.
      </p>
      <button onClick={onResume}
        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
        I Understand — Resume Quiz in Fullscreen
      </button>
    </div>
  </div>
)

// ─── 2nd Violation / Force-submit overlay ─────────────────────────────────────
const ViolationFinalOverlay = ({ reason, countdown, onViewResults }) => (
  <div className="fixed inset-0 z-[60] bg-[#020817]/98 backdrop-blur-2xl flex items-center justify-center px-4">
    <div className="max-w-md w-full p-8 rounded-3xl text-center"
      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
      <div className="text-6xl mb-4">🚫</div>
      <h3 className="font-black text-2xl text-red-400 mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
        Quiz Auto-Submitted!
      </h3>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">
        {reason === 'tab' ? 'Tab switch detected again.' : 'Fullscreen exited again.'} You have used both allowed violations.
        Your quiz has been <span className="text-red-400 font-bold">permanently submitted</span> with your current progress.
      </p>
      <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="text-slate-400 text-xs mb-1">This result will appear on your leaderboard.</p>
        <p className="text-slate-500 text-xs">Unanswered questions are marked as incorrect.</p>
      </div>
      <div className="mb-4">
        <span className="text-slate-500 text-sm">Redirecting to results in </span>
        <span className="text-red-400 font-black text-xl">{countdown}s</span>
      </div>
      <button onClick={onViewResults}
        className="w-full py-3 rounded-xl font-bold text-white text-sm"
        style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
        View Results Now
      </button>
    </div>
  </div>
)

// ─── Main QuizPage ────────────────────────────────────────────────────────────
const QuizPage = () => {
  const { topic } = useParams()
  const navigate  = useNavigate()

  // Instructions: always shown before quiz starts or on resume
  const [showInstructions,  setShowInstructions]  = useState(false)
  const [instructionsDone,  setInstructionsDone]  = useState(false)

  // Violation state
  // null = no violation shown, 'warn' = first violation warning, 'final' = force submitted
  const [violationState,    setViolationState]    = useState(null)
  const [violationReason,   setViolationReason]   = useState(null)
  const [finalCountdown,    setFinalCountdown]    = useState(60)
  const violationProcessing = useRef(false)
  const violationSubmittedRef = useRef(false)

  const [attemptId,         setAttemptId]         = useState(null)
  const [allQuestions,      setAllQuestions]       = useState([])
  const [currentDifficulty, setCurrentDifficulty] = useState('medium')
  const [aiEngine,          setAiEngine]           = useState('xgboost')
  const [currentIdx,        setCurrentIdx]         = useState(0)
  const [windowAnswers,     setWindowAnswers]      = useState([])
  const [pendingNext,       setPendingNext]        = useState(null)
  const [isResumeSession,   setIsResumeSession]    = useState(false)

  const [selected,      setSelected]      = useState(null)
  const [timeLeft,      setTimeLeft]      = useState(QUESTION_TIME)
  const [timedOut,      setTimedOut]      = useState(false)
  const [questionStart, setQuestionStart] = useState(Date.now())
  const [answered,      setAnswered]      = useState(false)

  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAI,     setShowAI]     = useState(false)
  const [error,      setError]      = useState('')
  const [finalResult, setFinalResult] = useState(null)

  const timerRef    = useRef(null)
  const autoNextRef = useRef(null)
  const countdownRef = useRef(null)

  // Stable refs for callbacks
  const answeredRef         = useRef(answered)
  const selectedRef         = useRef(selected)
  const windowAnswersRef    = useRef(windowAnswers)
  const currentIdxRef       = useRef(currentIdx)
  const allQuestionsRef     = useRef(allQuestions)
  const attemptIdRef        = useRef(attemptId)
  const currentDiffRef      = useRef(currentDifficulty)
  const questionStartRef    = useRef(questionStart)
  const instructionsDoneRef = useRef(instructionsDone)
  const showAIRef           = useRef(showAI)
  const violationStateRef   = useRef(violationState)
  const topicRef            = useRef(topic)

  useEffect(() => { answeredRef.current         = answered        }, [answered])
  useEffect(() => { selectedRef.current         = selected        }, [selected])
  useEffect(() => { windowAnswersRef.current    = windowAnswers   }, [windowAnswers])
  useEffect(() => { currentIdxRef.current       = currentIdx      }, [currentIdx])
  useEffect(() => { allQuestionsRef.current     = allQuestions    }, [allQuestions])
  useEffect(() => { attemptIdRef.current        = attemptId       }, [attemptId])
  useEffect(() => { currentDiffRef.current      = currentDifficulty }, [currentDifficulty])
  useEffect(() => { questionStartRef.current    = questionStart   }, [questionStart])
  useEffect(() => { instructionsDoneRef.current = instructionsDone }, [instructionsDone])
  useEffect(() => { showAIRef.current           = showAI          }, [showAI])
  useEffect(() => { violationStateRef.current   = violationState  }, [violationState])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (!u) navigate('/login') })
    return () => unsub()
  }, [navigate])

  // ── Load quiz data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true); setError('')
      try {
        const data = await quizAPI.start(topic)
        if (data.isResume) {
          const resumeIdx = data.currentQuestionIdx || 0
          setAttemptId(data.attemptId)
          setAllQuestions(data.questions)
          setCurrentDifficulty(data.difficulty)
          setCurrentIdx(resumeIdx)        // exact question restored
          setWindowAnswers([])
          setIsResumeSession(true)
          saveSession({ topic, attemptId: data.attemptId, currentIdx: resumeIdx })
          // Always show instructions even on resume
          setShowInstructions(true)
        } else {
          setAttemptId(data.attemptId)
          setAllQuestions(data.questions)
          setCurrentDifficulty(data.difficulty)
          setAiEngine(data.engine || 'xgboost')
          setCurrentIdx(0)
          setWindowAnswers([])
          setIsResumeSession(false)
          saveSession({ topic, attemptId: data.attemptId, currentIdx: 0 })
          // Always show instructions
          setShowInstructions(true)
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

  // ── Fullscreen management ───────────────────────────────────────────────────
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen()
  }, [])

  const handleStartQuiz = useCallback(() => {
    setShowInstructions(false)
    setInstructionsDone(true)
    enterFullscreen()
  }, [enterFullscreen])

  // ── Force-submit the quiz (2nd violation) ─────────────────────────────────
  const forceSubmitQuiz = useCallback(async (reason) => {
    if (violationSubmittedRef.current) return
    violationSubmittedRef.current = true

    clearInterval(timerRef.current)
    clearTimeout(autoNextRef.current)

    setViolationReason(reason)
    setViolationState('final')
    setFinalCountdown(60)

    // Build final answers including current unanswered question
    const answers   = windowAnswersRef.current
    const idx       = currentIdxRef.current
    const questions = allQuestionsRef.current
    const currentQ  = questions[idx]

    let finalAnswers = [...answers]
    if (currentQ && !answeredRef.current) {
      finalAnswers.push({
        questionId:     currentQ._id,
        selectedOption: null,
        timeTaken:      QUESTION_TIME,
        timedOut:       true,
      })
    }

    if (attemptIdRef.current && finalAnswers.length > 0) {
      try {
        const result = await quizAPI.submitWindow(attemptIdRef.current, finalAnswers, true)
        clearSession()
        setFinalResult({ result, topic: topicRef.current, difficulty: currentDiffRef.current })
      } catch (err) {
        console.error('Force submit error:', err.message)
        clearSession()
      }
    } else {
      clearSession()
    }
  }, [])

  // ── Handle violation (tab/fullscreen) ─────────────────────────────────────
  const handleViolation = useCallback(async (reason) => {
    if (!instructionsDoneRef.current || showAIRef.current || violationProcessing.current) return
    if (violationSubmittedRef.current) return

    violationProcessing.current = true
    clearInterval(timerRef.current)
    clearTimeout(autoNextRef.current)

    try {
      if (!attemptIdRef.current) {
        violationProcessing.current = false
        return
      }
      const resp = await quizAPI.recordViolation(attemptIdRef.current)

      if (resp.action === 'force_submit') {
        await forceSubmitQuiz(reason)
      } else {
        // First violation — show warning, allow resume
        setViolationReason(reason)
        setViolationState('warn')
      }
    } catch (err) {
      console.error('Violation record error:', err)
    } finally {
      violationProcessing.current = false
    }
  }, [forceSubmitQuiz])

  // ── Resume from warning overlay ────────────────────────────────────────────
  const handleResumeFromWarning = useCallback(() => {
    setViolationState(null)
    setViolationReason(null)
    enterFullscreen()
    // Restart timer for current question
    setAnswered(false)
    setSelected(null)
    setTimedOut(false)
    setTimeLeft(QUESTION_TIME)
    setQuestionStart(Date.now())
  }, [enterFullscreen])

  // ── Countdown for final overlay ────────────────────────────────────────────
  useEffect(() => {
    if (violationState !== 'final') return
    countdownRef.current = setInterval(() => {
      setFinalCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          // Auto-navigate to results
          if (finalResult) {
            navigate('/quiz/results', { state: finalResult })
          } else {
            navigate('/dashboard')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [violationState, finalResult, navigate])

  // ── Tab visibility change ─────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [handleViolation])

  // ── Fullscreen exit ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleFSChange = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      )
      if (!isFS && instructionsDoneRef.current && !showAIRef.current) {
        handleViolation('fullscreen')
      }
    }
    document.addEventListener('fullscreenchange',       handleFSChange)
    document.addEventListener('webkitfullscreenchange', handleFSChange)
    document.addEventListener('mozfullscreenchange',    handleFSChange)
    return () => {
      document.removeEventListener('fullscreenchange',       handleFSChange)
      document.removeEventListener('webkitfullscreenchange', handleFSChange)
      document.removeEventListener('mozfullscreenchange',    handleFSChange)
    }
  }, [handleViolation])

  // ── Block Escape key ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape' && instructionsDoneRef.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', handleKeydown, true)
    return () => document.removeEventListener('keydown', handleKeydown, true)
  }, [])

  // ── Session sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (attemptId) saveSession({ topic, attemptId, currentIdx })
  }, [topic, attemptId, currentIdx])

  // ── Question timer ────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't run timer if showing warning overlay or not yet started
    if (loading || showAI || !allQuestions.length || currentIdx >= allQuestions.length
        || !instructionsDone || violationState !== null) return

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
  }, [currentIdx, allQuestions.length, loading, showAI, instructionsDone, violationState])

  // ── triggerAdvance ────────────────────────────────────────────────────────
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

  // Keyboard shortcuts — numbers
  useEffect(() => {
    const handler = (e) => {
      if (showAI || loading || answeredRef.current || !instructionsDone || violationState !== null) return
      if (['1','2','3','4'].includes(e.key)) handleSelect(parseInt(e.key) - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAI, loading, handleSelect, instructionsDone, violationState])

  // Keyboard — Enter to advance
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && answeredRef.current && !showAI && !submitting && instructionsDone && violationState === null) {
        clearTimeout(autoNextRef.current); triggerAdvance()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAI, submitting, triggerAdvance, instructionsDone, violationState])

  // ── Navigate to results after final violation ─────────────────────────────
  const handleViewFinalResults = useCallback(() => {
    clearInterval(countdownRef.current)
    if (finalResult) {
      navigate('/quiz/results', { state: finalResult })
    } else {
      navigate('/dashboard')
    }
  }, [finalResult, navigate])

  // ── Loading ───────────────────────────────────────────────────────────────
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
          {loadSession()?.topic === topic ? 'Resuming your quiz…' : 'AI preparing your quiz…'}
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
      {/* Instructions Modal — shown every time */}
      {showInstructions && !loading && (
        <InstructionsModal
          topic={topic}
          difficulty={currentDifficulty}
          isResume={isResumeSession}
          onStart={handleStartQuiz}
          onCancel={() => { clearSession(); navigate('/dashboard') }}
        />
      )}

      {/* AI Transition */}
      {showAI && pendingNext && (
        <AITransition nextDifficulty={pendingNext.nextDifficulty} engine={pendingNext.engine} onDone={handleAIDone} />
      )}

      {/* 1st Violation Warning */}
      {violationState === 'warn' && (
        <ViolationWarnOverlay reason={violationReason} onResume={handleResumeFromWarning} />
      )}

      {/* 2nd Violation / Force-submit */}
      {violationState === 'final' && (
        <ViolationFinalOverlay reason={violationReason} countdown={finalCountdown} onViewResults={handleViewFinalResults} />
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
              <button onClick={() => { clearInterval(timerRef.current); clearSession(); navigate('/dashboard') }}
                className="text-slate-600 hover:text-white transition-colors group">
                <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-base">{TOPIC_ICONS[topic] || '📚'}</span>
                <span className="text-white font-bold capitalize text-sm">{topic}</span>
              </div>
            </div>
            <span className={`hidden sm:inline-flex text-xs font-black px-3 py-1.5 rounded-xl border ${ds.badge}`}>{ds.label}</span>
            <CircularTimer timeLeft={instructionsDone ? timeLeft : QUESTION_TIME} total={QUESTION_TIME} />
          </div>
        </header>

        {/* Progress bar */}
        <div className="relative w-full h-1 bg-white/5">
          <div className={`absolute left-0 top-0 h-full ${ds.bar} transition-all duration-700 ease-out`} style={{ width: `${progress}%` }} />
        </div>

        {/* Meta bar */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 font-bold">Window {windowNum}/4</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:inline">Q{qInWindow}/{WINDOW_SIZE}</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:inline text-cyan-500 font-bold text-xs">🤖 {aiEngine}</span>
          </div>
          <span className="text-slate-600 text-xs font-bold">{currentIdx + 1} <span className="text-slate-800">/</span> {TOTAL_QUESTIONS}</span>
        </div>

        {/* Dot progress */}
        <div className="max-w-3xl mx-auto w-full px-4 md:px-6 pb-5">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
              const loaded = i < allQuestions.length
              const done   = i < currentIdx
              const active = i === currentIdx
              return (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                  active ? `w-6 ${ds.bar}` : done ? 'w-3 bg-cyan-500/50' : loaded ? 'w-3 bg-white/10' : 'w-3 bg-white/5'
                }`} />
              )
            })}
          </div>
        </div>

        {/* Resume banner */}
        {isResumeSession && instructionsDone && (
          <div className="max-w-3xl mx-auto w-full px-4 md:px-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
              <span>🔄</span>
              <span>Quiz resumed — continuing from Question {currentIdx + 1}</span>
              <button onClick={() => setIsResumeSession(false)} className="ml-auto text-cyan-600 hover:text-cyan-400 transition-colors">✕</button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col px-4 md:px-6 pb-10 relative z-10">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            {!instructionsDone ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-600 text-sm">Loading instructions…</p>
              </div>
            ) : currentQ ? (
              <>
                {timedOut && (
                  <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold">
                    <span>⏰</span> Time's up! Moving on…
                  </div>
                )}

                {/* Question card */}
                <div className={`relative p-6 md:p-8 rounded-2xl mb-6 border transition-all duration-500 overflow-hidden ${
                  isUrgent && !answered ? 'border-red-500/30 bg-red-500/5 shadow-xl shadow-red-500/10' : 'border-white/5 bg-white/[0.02]'
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
                      <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
                        className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-200 group ${cls}`}>
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${
                            answered && idx === selected && !timedOut
                              ? 'bg-cyan-500 border-cyan-400 text-white'
                              : 'bg-white/5 border-white/10 text-slate-500 group-hover:border-cyan-500/30 group-hover:text-cyan-400'
                          }`}>
                            {['A','B','C','D'][idx]}
                          </span>
                          <span className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">{opt}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {answered && !timedOut && !submitting && (
                  <div className="flex justify-end">
                    <button onClick={() => { clearTimeout(autoNextRef.current); triggerAdvance() }} disabled={submitting}
                      className="relative px-8 py-3.5 font-bold text-white rounded-xl overflow-hidden group hover:scale-105 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/20">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
                      <span className="relative flex items-center gap-2">
                        {currentIdx + 1 === TOTAL_QUESTIONS ? 'Finish Quiz 🎯'
                          : currentIdx % WINDOW_SIZE === WINDOW_SIZE - 1 ? 'Submit Window ⚡'
                          : <>Next <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></>}
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
                      <span className="text-sm font-bold">Submitting to AI…</span>
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
                  <p className="text-slate-600 text-sm">Loading next question…</p>
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