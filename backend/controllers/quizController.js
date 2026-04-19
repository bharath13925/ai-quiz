const axios    = require('axios')
const mongoose = require('mongoose')
const Attempt  = require('../models/Attempt')
const Question = require('../models/Question')
const { updateLeaderboard } = require('./leaderboardController')

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_MAP     = { easy: 0, medium: 1, hard: 2 }
const WEIGHT             = { easy: 1, medium: 1.5, hard: 2 }
const WINDOW_SIZE        = 5
const TOTAL_QUESTIONS    = 20

// ─── Topic metadata (display only — actual available topics come from DB) ─────
const TOPIC_META = {
  graphs:               { label: 'Graphs',                icon: '🔗', color: 'from-blue-500/20 to-blue-600/5',       border: 'border-blue-500/30',       accent: 'text-blue-400'    },
  arrays:               { label: 'Arrays',                icon: '📊', color: 'from-cyan-500/20 to-cyan-600/5',       border: 'border-cyan-500/30',       accent: 'text-cyan-400'    },
  dbms:                 { label: 'DBMS',                  icon: '🗄️', color: 'from-indigo-500/20 to-indigo-600/5',   border: 'border-indigo-500/30',     accent: 'text-indigo-400'  },
  os:                   { label: 'Operating Systems',     icon: '💻', color: 'from-sky-500/20 to-sky-600/5',         border: 'border-sky-500/30',        accent: 'text-sky-400'     },
  stacks:               { label: 'Stacks',                icon: '📚', color: 'from-violet-500/20 to-violet-600/5',   border: 'border-violet-500/30',     accent: 'text-violet-400'  },
  queues:               { label: 'Queues',                icon: '🔁', color: 'from-pink-500/20 to-pink-600/5',       border: 'border-pink-500/30',       accent: 'text-pink-400'    },
  'linked lists':       { label: 'Linked Lists',          icon: '🔗', color: 'from-orange-500/20 to-orange-600/5',   border: 'border-orange-500/30',     accent: 'text-orange-400'  },
  trees:                { label: 'Trees',                 icon: '🌳', color: 'from-green-500/20 to-green-600/5',     border: 'border-green-500/30',      accent: 'text-green-400'   },
  hashing:              { label: 'Hashing',               icon: '#️⃣', color: 'from-yellow-500/20 to-yellow-600/5',  border: 'border-yellow-500/30',     accent: 'text-yellow-400'  },
  'greedy algorithms':  { label: 'Greedy Algorithms',     icon: '⚡', color: 'from-amber-500/20 to-amber-600/5',    border: 'border-amber-500/30',      accent: 'text-amber-400'   },
  'dynamic programming':{ label: 'Dynamic Programming',   icon: '🧩', color: 'from-teal-500/20 to-teal-600/5',      border: 'border-teal-500/30',       accent: 'text-teal-400'    },
  backtracking:         { label: 'Backtracking',          icon: '↩️', color: 'from-rose-500/20 to-rose-600/5',      border: 'border-rose-500/30',       accent: 'text-rose-400'    },
  'bit manipulation':   { label: 'Bit Manipulation',      icon: '⚙️', color: 'from-slate-500/20 to-slate-600/5',    border: 'border-slate-500/30',      accent: 'text-slate-400'   },
}

const DEFAULT_META = {
  label: null,
  icon: '📚',
  color: 'from-slate-500/20 to-slate-600/5',
  border: 'border-slate-500/30',
  accent: 'text-slate-400',
}

// ─── Helper: call Flask AI service ───────────────────────────────────────────
const callAI = async (features) => {
  try {
    const aiRes = await axios.post(
      `${process.env.FLASK_AI_URL || 'http://localhost:5001'}/predict`,
      features,
      { timeout: 5000 }
    )
    return {
      difficulty: aiRes.data.difficulty || 'medium',
      engine:     aiRes.data.engine     || 'xgboost',
    }
  } catch {
    return { difficulty: 'medium', engine: 'fallback' }
  }
}

// ─── Helper: compute features ────────────────────────────────────────────────
const computeFeatures = (windowQuestions, prevDifficulty = 'medium') => {
  if (!windowQuestions || windowQuestions.length === 0) {
    return { accuracy: 0.5, avg_time: 15, streak: 0, prev_difficulty: DIFFICULTY_MAP[prevDifficulty] ?? 1 }
  }
  let correct = 0, totalTime = 0, streak = 0
  let counting = true
  for (let i = windowQuestions.length - 1; i >= 0; i--) {
    const q = windowQuestions[i]
    if (q.isCorrect) correct++
    totalTime += q.timeTaken || 0
    if (counting) { if (q.isCorrect) streak++; else counting = false }
  }
  return {
    accuracy:        correct / windowQuestions.length,
    avg_time:        totalTime / windowQuestions.length,
    streak,
    prev_difficulty: DIFFICULTY_MAP[prevDifficulty] ?? 1,
  }
}

// ─── Helper: fetch N random questions ────────────────────────────────────────
const fetchQuestions = async (topic, difficulty, count, excludeIds = []) => {
  const match = { topic: topic.toLowerCase(), difficulty }
  if (excludeIds.length > 0) match._id = { $nin: excludeIds }
  let questions = await Question.aggregate([{ $match: match }, { $sample: { size: count } }])
  if (questions.length < count) {
    const relaxMatch = { topic: topic.toLowerCase() }
    if (excludeIds.length > 0) relaxMatch._id = { $nin: excludeIds }
    questions = await Question.aggregate([{ $match: relaxMatch }, { $sample: { size: count } }])
  }
  return questions
}

// ─── GET /api/quiz/topics — ONLY topics that have questions in MongoDB ────────
const getTopics = async (req, res, next) => {
  try {
    const topics = await Question.distinct('topic')

    const result = topics.map((t) => {
      const meta = TOPIC_META[t] || DEFAULT_META
      return {
        id:     t,
        label:  meta.label || (t.charAt(0).toUpperCase() + t.slice(1)),
        icon:   meta.icon,
        color:  meta.color,
        border: meta.border,
        accent: meta.accent,
      }
    })

    res.json({ topics: result })
  } catch (err) { next(err) }
}

// ─── POST /api/quiz/start ─────────────────────────────────────────────────────
const startQuiz = async (req, res, next) => {
  try {
    const { topic } = req.body
    const userId    = req.userId

    const validTopics = await Question.distinct('topic')
    if (!topic || !validTopics.includes(topic.toLowerCase())) {
      return res.status(400).json({ message: `Invalid topic. Available: ${validTopics.join(', ')}` })
    }

    // ── Resume existing incomplete attempt ──────────────────────────────────
    const existing = await Attempt.findOne({
      userId,
      topic:      topic.toLowerCase(),
      isComplete: false,
    }).sort({ createdAt: -1 })

    if (existing) {
      const resumeIdx = existing.questions.length

      const windowIdx    = Math.floor(resumeIdx / WINDOW_SIZE)
      const currentWindow = existing.windows[windowIdx] || existing.windows[existing.windows.length - 1]
      const windowStart  = windowIdx * WINDOW_SIZE
      const windowEnd    = Math.min(windowStart + WINDOW_SIZE - 1, existing.questionIds.length - 1)

      const servedIds = existing.questionIds

      const questions = await Question.find({ _id: { $in: servedIds } }).lean()
      const qMap      = Object.fromEntries(questions.map((q) => [q._id.toString(), q]))
      const orderedQ  = servedIds
        .map((id) => {
          const q = qMap[id.toString()]
          if (!q) return null
          const { correctAnswer, __v, ...safe } = q
          return safe
        })
        .filter(Boolean)

      return res.json({
        attemptId:          existing._id,
        topic:              existing.topic,
        difficulty:         currentWindow?.difficulty || existing.difficulty,
        currentQuestionIdx: resumeIdx,
        questions:          orderedQ,
        windows:            existing.windows,
        violationCount:     existing.violationCount || 0,
        isResume:           true,
      })
    }

    // ── Fresh start ──────────────────────────────────────────────────────────
    const lastAttempts = await Attempt.find({
      userId,
      topic:      topic.toLowerCase(),
      isComplete: true,
    }).sort({ createdAt: -1 }).limit(5).lean()

    const pastQuestions = lastAttempts.flatMap((a) => a.questions)
    const features      = computeFeatures(pastQuestions, 'medium')
    const { difficulty, engine } = await callAI(features)

    const firstBatch = await fetchQuestions(topic.toLowerCase(), difficulty, WINDOW_SIZE)
    if (firstBatch.length === 0) {
      return res.status(404).json({ message: `No questions found for topic "${topic}"` })
    }

    const questionIds = firstBatch.map((q) => q._id)
    const windows     = [{ startIdx: 0, endIdx: WINDOW_SIZE - 1, difficulty }]

    const attempt = await Attempt.create({
      userId,
      topic:              topic.toLowerCase(),
      difficulty,
      questions:          [],
      questionIds,
      windows,
      currentQuestionIdx: 0,
      violationCount:     0,
      autoSubmitted:      false,
      isComplete:         false,
    })

    const safeQuestions = firstBatch.map(({ correctAnswer, __v, ...q }) => q)

    res.json({
      attemptId:          attempt._id,
      topic:              topic.toLowerCase(),
      difficulty,
      engine,
      currentQuestionIdx: 0,
      questions:          safeQuestions,
      windows,
      violationCount:     0,
      isResume:           false,
    })
  } catch (err) { next(err) }
}

// ─── POST /api/quiz/violation ─────────────────────────────────────────────────
const recordViolation = async (req, res, next) => {
  try {
    const { attemptId } = req.body
    const userId = req.userId

    if (!attemptId) return res.status(400).json({ message: 'attemptId required' })

    const attempt = await Attempt.findOne({ _id: attemptId, userId })
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' })
    if (attempt.isComplete) return res.status(400).json({ message: 'Quiz already complete' })

    attempt.violationCount = (attempt.violationCount || 0) + 1
    await attempt.save()

    if (attempt.violationCount >= 2) {
      return res.json({ action: 'force_submit', violationCount: attempt.violationCount })
    }

    return res.json({ action: 'warn', violationCount: attempt.violationCount })
  } catch (err) { next(err) }
}

// ─── POST /api/quiz/window ────────────────────────────────────────────────────
const submitWindow = async (req, res, next) => {
  try {
    const { attemptId, answers, autoSubmit } = req.body
    const userId = req.userId

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'attemptId and answers[] required' })
    }

    const attempt = await Attempt.findOne({ _id: attemptId, userId })
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' })
    if (attempt.isComplete) return res.status(400).json({ message: 'Quiz already complete' })

    const ids       = answers.map((a) => a.questionId)
    const questions = await Question.find({ _id: { $in: ids } }).lean()
    const qMap      = Object.fromEntries(questions.map((q) => [q._id.toString(), q]))

    const enriched = answers.map((a) => {
      const q         = qMap[a.questionId]
      const isCorrect = q ? q.correctAnswer === a.selectedOption : false
      return {
        questionId:     a.questionId,
        selectedOption: a.selectedOption ?? null,
        isCorrect,
        timeTaken:      Math.min(a.timeTaken || 0, 20),
        timedOut:       a.timedOut || false,
      }
    })

    attempt.questions.push(...enriched)
    attempt.currentQuestionIdx = attempt.questions.length

    const totalAnswered = attempt.questions.length
    const isLastWindow  = totalAnswered >= TOTAL_QUESTIONS || autoSubmit

    if (isLastWindow) {
      const correct   = attempt.questions.filter((q) => q.isCorrect).length
      const incorrect = attempt.questions.filter((q) => !q.isCorrect && !q.timedOut).length
      const timeout   = attempt.questions.filter((q) => q.timedOut).length
      const total     = attempt.questions.length
      const accuracy  = total > 0 ? correct / total : 0
      const totalTime = attempt.questions.reduce((s, q) => s + (q.timeTaken || 0), 0)
      const avgTime   = total > 0 ? totalTime / total : 0

      // ── Pro Score Formula ──────────────────────────────────────────────────
      // score = ((correct × weight × 10) - (wrong × 5) - (timeout × 10))
      //         × accuracy / (1 + avgTime / 10)
      // Fast + Accurate → highest | Slow + Wrong → lowest
      const lastWindow = attempt.windows[attempt.windows.length - 1]
      const weight     = WEIGHT[lastWindow?.difficulty || 'medium'] || 1

      const rawNumerator = (correct * weight * 10) - (incorrect * 5) - (timeout * 10)
      const score = parseFloat(
        Math.max(0, (rawNumerator * accuracy) / (1 + avgTime / 10)).toFixed(2)
      )

      attempt.score          = score
      attempt.accuracy       = accuracy
      attempt.totalTime      = totalTime
      attempt.correctCount   = correct
      attempt.incorrectCount = incorrect
      attempt.timeoutCount   = timeout
      attempt.isComplete     = true
      attempt.completedAt    = new Date()
      if (autoSubmit) attempt.autoSubmitted = true
      await attempt.save()

      // Pass avgTime as 5th argument (new parameter order)
      updateLeaderboard(userId, attempt.topic, score, accuracy, avgTime, correct, incorrect, timeout).catch(() => {})

      const allQIds  = attempt.questions.map((a) => a.questionId?.toString())
      const allQDocs = await Question.find({ _id: { $in: allQIds } }).lean()
      const allQMap  = Object.fromEntries(allQDocs.map((q) => [q._id.toString(), q]))

      return res.json({
        isComplete:     true,
        score,
        accuracy,
        correctCount:   correct,
        incorrectCount: incorrect,
        timeoutCount:   timeout,
        totalQuestions: total,
        attemptId:      attempt._id,
        difficulty:     lastWindow?.difficulty,
        topic:          attempt.topic,
        autoSubmitted:  attempt.autoSubmitted || false,
        // Score breakdown for UI
        scoreBreakdown: {
          correct,
          incorrect,
          timeout,
          weight,
          avgTime:  parseFloat(avgTime.toFixed(2)),
          accuracy: parseFloat((accuracy * 100).toFixed(1)),
          formula:  `((${correct}×${weight}×10) - (${incorrect}×5) - (${timeout}×10)) × ${parseFloat((accuracy * 100).toFixed(1))}% ÷ (1 + ${parseFloat(avgTime.toFixed(2))}/10)`,
        },
        review: attempt.questions.map((a) => {
          const doc = allQMap[a.questionId?.toString()]
          return {
            questionId:     a.questionId,
            selectedOption: a.selectedOption,
            isCorrect:      a.isCorrect,
            timeTaken:      a.timeTaken,
            timedOut:       a.timedOut,
            correctAnswer:  doc?.correctAnswer,
            explanation:    doc?.explanation || '',
            question:       doc?.question,
            options:        doc?.options,
            difficulty:     doc?.difficulty,
          }
        }),
      })
    }

    const currentWindowDifficulty = attempt.windows[attempt.windows.length - 1]?.difficulty || 'medium'
    const windowFeatures = computeFeatures(enriched, currentWindowDifficulty)
    const { difficulty: nextDifficulty, engine } = await callAI(windowFeatures)

    const nextBatch = await fetchQuestions(
      attempt.topic,
      nextDifficulty,
      WINDOW_SIZE,
      attempt.questionIds
    )

    if (nextBatch.length === 0) {
      return res.status(404).json({ message: 'No more questions available for this topic' })
    }

    const newStartIdx = totalAnswered
    const newEndIdx   = newStartIdx + nextBatch.length - 1
    attempt.questionIds.push(...nextBatch.map((q) => q._id))
    attempt.windows.push({ startIdx: newStartIdx, endIdx: newEndIdx, difficulty: nextDifficulty })
    await attempt.save()

    const safeNext = nextBatch.map(({ correctAnswer, __v, ...q }) => q)

    res.json({
      isComplete:         false,
      nextQuestions:      safeNext,
      nextDifficulty,
      engine,
      currentQuestionIdx: totalAnswered,
      windowFeatures,
      questionsRemaining: TOTAL_QUESTIONS - totalAnswered,
    })
  } catch (err) { next(err) }
}

// ─── GET /api/quiz/history ────────────────────────────────────────────────────
const getHistory = async (req, res, next) => {
  try {
    const userId = req.userId
    const { topic, limit = 20 } = req.query
    const filter = { userId, isComplete: true }
    if (topic) filter.topic = topic.toLowerCase()
    const attempts = await Attempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('-questions -questionIds')
      .lean()
    res.json({ attempts })
  } catch (err) { next(err) }
}

// ─── GET /api/quiz/stats ──────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const userId = req.userId
    const oid    = mongoose.Types.ObjectId.createFromHexString
      ? mongoose.Types.ObjectId.createFromHexString(userId)
      : new mongoose.Types.ObjectId(userId)

    const [agg] = await Attempt.aggregate([
      { $match: { userId: oid, isComplete: true } },
      { $group: {
        _id: null,
        totalQuizzes:   { $sum: 1 },
        avgAccuracy:    { $avg: '$accuracy' },
        bestScore:      { $max: '$score' },
        totalTime:      { $sum: '$totalTime' },
        totalCorrect:   { $sum: '$correctCount' },
        totalIncorrect: { $sum: '$incorrectCount' },
        totalTimeout:   { $sum: '$timeoutCount' },
      }},
    ])

    const topicStats = await Attempt.aggregate([
      { $match: { userId: oid, isComplete: true } },
      { $group: {
        _id:          '$topic',
        count:        { $sum: 1 },
        avgAccuracy:  { $avg: '$accuracy' },
        bestScore:    { $max: '$score' },
      }},
    ])

    res.json({
      totalQuizzes:   agg?.totalQuizzes   || 0,
      avgAccuracy:    agg ? Math.round(agg.avgAccuracy * 100) : 0,
      bestScore:      agg?.bestScore       || 0,
      totalTime:      agg?.totalTime       || 0,
      totalCorrect:   agg?.totalCorrect    || 0,
      totalIncorrect: agg?.totalIncorrect  || 0,
      totalTimeout:   agg?.totalTimeout    || 0,
      topicStats,
    })
  } catch (err) { next(err) }
}

module.exports = { startQuiz, submitWindow, recordViolation, getTopics, getHistory, getStats }