const axios    = require('axios')
const mongoose = require('mongoose')
const Attempt  = require('../models/Attempt')
const Question = require('../models/Question')
const { updateLeaderboard } = require('./leaderboardController')

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_MAP     = { easy: 0, medium: 1, hard: 2 }
const WEIGHT             = { easy: 1, medium: 1.5, hard: 2 }
const WINDOW_SIZE        = 5   // questions per AI evaluation window
const TOTAL_QUESTIONS    = 20  // total questions per quiz session

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

// ─── Helper: compute features from a window of answered questions ─────────────
// windowQuestions: array of { isCorrect, timeTaken }
// prevDifficulty: string 'easy'|'medium'|'hard'
const computeFeatures = (windowQuestions, prevDifficulty = 'medium') => {
  if (!windowQuestions || windowQuestions.length === 0) {
    return {
      accuracy:        0.5,
      avg_time:        15,
      streak:          0,
      prev_difficulty: DIFFICULTY_MAP[prevDifficulty] ?? 1,
    }
  }

  let correct = 0
  let totalTime = 0
  let streak = 0
  let counting = true

  for (let i = windowQuestions.length - 1; i >= 0; i--) {
    const q = windowQuestions[i]
    if (q.isCorrect) correct++
    totalTime += q.timeTaken || 0
    if (counting) {
      if (q.isCorrect) streak++
      else counting = false
    }
  }

  return {
    accuracy:        correct / windowQuestions.length,
    avg_time:        totalTime / windowQuestions.length,
    streak,
    prev_difficulty: DIFFICULTY_MAP[prevDifficulty] ?? 1,
  }
}

// ─── Helper: fetch N random questions (exclude already-used IDs) ──────────────
const fetchQuestions = async (topic, difficulty, count, excludeIds = []) => {
  const match = { topic: topic.toLowerCase(), difficulty }
  if (excludeIds.length > 0) match._id = { $nin: excludeIds }

  let questions = await Question.aggregate([
    { $match: match },
    { $sample: { size: count } },
  ])

  // Fallback: relax difficulty if not enough questions available
  if (questions.length < count) {
    const relaxMatch = { topic: topic.toLowerCase() }
    if (excludeIds.length > 0) relaxMatch._id = { $nin: excludeIds }
    questions = await Question.aggregate([
      { $match: relaxMatch },
      { $sample: { size: count } },
    ])
  }

  return questions
}

// ─── GET /api/quiz/topics ─────────────────────────────────────────────────────
const getTopics = async (req, res, next) => {
  try {
    const topics = await Question.distinct('topic')
    const topicMeta = {
      graphs: { label: 'Graphs',            icon: '🔗', color: 'from-blue-500/20 to-blue-600/5',     border: 'border-blue-500/30',    accent: 'text-blue-400'   },
      arrays: { label: 'Arrays',            icon: '📊', color: 'from-cyan-500/20 to-cyan-600/5',     border: 'border-cyan-500/30',    accent: 'text-cyan-400'   },
      dbms:   { label: 'DBMS',              icon: '🗄️', color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/30',  accent: 'text-indigo-400' },
      os:     { label: 'Operating Systems', icon: '💻', color: 'from-sky-500/20 to-sky-600/5',       border: 'border-sky-500/30',     accent: 'text-sky-400'    },
    }
    const result = topics.map((t) => ({
      id: t,
      ...(topicMeta[t] || { label: t, icon: '📚', color: 'from-slate-500/20 to-slate-600/5', border: 'border-slate-500/30', accent: 'text-slate-400' }),
    }))
    res.json({ topics: result })
  } catch (err) { next(err) }
}

// ─── POST /api/quiz/start ─────────────────────────────────────────────────────
// Creates a new attempt with first window of 5 questions, OR resumes an existing one.
// On fresh start: calls AI with features from the user's last completed attempts.
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
      const questions = await Question.find({ _id: { $in: existing.questionIds } }).lean()
      const qMap      = Object.fromEntries(questions.map((q) => [q._id.toString(), q]))
      const orderedQ  = existing.questionIds
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
        difficulty:         existing.difficulty,
        currentQuestionIdx: existing.currentQuestionIdx,
        questions:          orderedQ,
        windows:            existing.windows,
        isResume:           true,
      })
    }

    // ── Fresh start: compute features from last completed attempts ──────────
    // Use the last 5 COMPLETED attempts for this topic to build initial features.
    const lastAttempts = await Attempt.find({
      userId,
      topic:      topic.toLowerCase(),
      isComplete: true,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    // Flatten the questions from those attempts (most recent first)
    const pastQuestions = lastAttempts.flatMap((a) => a.questions)
    const features      = computeFeatures(pastQuestions, 'medium')
    const { difficulty, engine } = await callAI(features)

    // Fetch first window of 5 questions
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
      isResume:           false,
    })
  } catch (err) { next(err) }
}

// ─── POST /api/quiz/window ────────────────────────────────────────────────────
// Called after every window of 5 answers.
// • Evaluates correctness for all answers in the window.
// • If NOT the last window: calls AI with features from THIS window → returns next 5 Qs.
// • If IS the last window: finalises the attempt, updates leaderboard, returns full result.
const submitWindow = async (req, res, next) => {
  try {
    const { attemptId, answers } = req.body
    const userId = req.userId

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'attemptId and answers[] required' })
    }

    const attempt = await Attempt.findOne({ _id: attemptId, userId })
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' })
    if (attempt.isComplete) return res.status(400).json({ message: 'Quiz already complete' })

    // ── Evaluate answers ────────────────────────────────────────────────────
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
    const isLastWindow  = totalAnswered >= TOTAL_QUESTIONS

    // ── Last window → finalise ──────────────────────────────────────────────
    if (isLastWindow) {
      const correct   = attempt.questions.filter((q) => q.isCorrect).length
      const total     = attempt.questions.length
      const accuracy  = total > 0 ? correct / total : 0
      const totalTime = attempt.questions.reduce((s, q) => s + (q.timeTaken || 0), 0)
      const avgTime   = total > 0 ? totalTime / total : 0

      const lastWindow = attempt.windows[attempt.windows.length - 1]
      const weight     = WEIGHT[lastWindow?.difficulty || 'medium'] || 1
      const score      = avgTime > 0
        ? parseFloat(((correct * weight) / avgTime * 100).toFixed(2))
        : parseFloat((correct * weight * 10).toFixed(2))

      attempt.score       = score
      attempt.accuracy    = accuracy
      attempt.totalTime   = totalTime
      attempt.isComplete  = true
      attempt.completedAt = new Date()
      await attempt.save()

      // Fire-and-forget leaderboard update
      updateLeaderboard(userId, attempt.topic, score, accuracy).catch(() => {})

      // Build full review (includes correctAnswer + explanation for each Q)
      const allQIds     = attempt.questions.map((a) => a.questionId?.toString())
      const allQDocs    = await Question.find({ _id: { $in: allQIds } }).lean()
      const allQMap     = Object.fromEntries(allQDocs.map((q) => [q._id.toString(), q]))

      return res.json({
        isComplete:     true,
        score,
        accuracy,
        correctCount:   correct,
        totalQuestions: total,
        attemptId:      attempt._id,
        difficulty:     lastWindow?.difficulty,
        topic:          attempt.topic,
        review:         attempt.questions.map((a) => {
          const doc = allQMap[a.questionId?.toString()]
          return {
            questionId:     a.questionId,
            selectedOption: a.selectedOption,
            isCorrect:      a.isCorrect,
            timeTaken:      a.timeTaken,
            timedOut:       a.timedOut,
            correctAnswer:  doc?.correctAnswer,
            explanation:    doc?.explanation,
            question:       doc?.question,
            options:        doc?.options,
          }
        }),
      })
    }

    // ── Not last window → call AI with THIS window's features ───────────────
    const currentWindowDifficulty = attempt.windows[attempt.windows.length - 1]?.difficulty || 'medium'

    // Features computed from ONLY the answers just submitted (the current window)
    const windowFeatures = computeFeatures(enriched, currentWindowDifficulty)
    const { difficulty: nextDifficulty, engine } = await callAI(windowFeatures)

    // Fetch next 5 questions (excluding all already-used IDs)
    const nextBatch = await fetchQuestions(
      attempt.topic,
      nextDifficulty,
      WINDOW_SIZE,
      attempt.questionIds   // Mongoose ObjectId array — Mongo's $nin handles it
    )

    if (nextBatch.length === 0) {
      return res.status(404).json({ message: 'No more questions available for this topic' })
    }

    // Append new question IDs and record the new window
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
      {
        $group: {
          _id:         null,
          totalQuizzes: { $sum: 1 },
          avgAccuracy:  { $avg: '$accuracy' },
          bestScore:    { $max: '$score' },
          totalTime:    { $sum: '$totalTime' },
        },
      },
    ])

    const topicStats = await Attempt.aggregate([
      { $match: { userId: oid, isComplete: true } },
      {
        $group: {
          _id:         '$topic',
          count:       { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' },
          bestScore:   { $max: '$score' },
        },
      },
    ])

    res.json({
      totalQuizzes: agg?.totalQuizzes || 0,
      avgAccuracy:  agg ? Math.round(agg.avgAccuracy * 100) : 0,
      bestScore:    agg?.bestScore   || 0,
      totalTime:    agg?.totalTime   || 0,
      topicStats,
    })
  } catch (err) { next(err) }
}

module.exports = { startQuiz, submitWindow, getTopics, getHistory, getStats }