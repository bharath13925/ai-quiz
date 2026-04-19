const Leaderboard = require('../models/Leaderboard')
const Attempt     = require('../models/Attempt')
const Question    = require('../models/Question')

// ─── GET /api/leaderboard/:topic ──────────────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const { topic } = req.params

    // Validate against actual DB topics
    const validTopics = await Question.distinct('topic')
    if (!validTopics.includes(topic.toLowerCase())) {
      return res.status(400).json({ message: `Invalid topic. Available: ${validTopics.join(', ')}` })
    }

    const topicKey = topic.toLowerCase()
    const totalAttempts = await Attempt.countDocuments({ topic: topicKey, isComplete: true })
    // All users who attempted (not just top 50)
    const allAttemptingUsers = await Attempt.distinct('userId', { topic: topicKey, isComplete: true })

    // Hybrid sort: higher totalScore first, then lower avgTime for tie-breaking
    const entries = await Leaderboard.find({ topic: topicKey })
      .sort({ totalScore: -1, avgTime: 1 })
      .limit(100)
      .populate('userId', 'name email firebaseUid')
      .lean()

    const ranked = entries.map((entry, i) => ({
      rank:           i + 1,
      name:           entry.userId?.name  || 'Anonymous',
      email:          entry.userId?.email || '',
      firebaseUid:    entry.userId?.firebaseUid || null,
      totalScore:     Math.round(entry.totalScore    * 100) / 100,
      bestScore:      Math.round(entry.bestScore     * 100) / 100,
      quizzesTaken:   entry.quizzesTaken,
      avgAccuracy:    Math.round(entry.avgAccuracy   * 100),
      avgTime:        Math.round(entry.avgTime       * 100) / 100,
      totalCorrect:   entry.totalCorrect   || 0,
      totalIncorrect: entry.totalIncorrect || 0,
      totalTimeout:   entry.totalTimeout   || 0,
    }))

    res.json({
      topic:        topicKey,
      leaderboard:  ranked,
      totalAttempts,
      uniqueUsers:  allAttemptingUsers.length,
    })
  } catch (err) { next(err) }
}

// ─── Internal: called after every completed quiz ──────────────────────────────
const updateLeaderboard = async (userId, topic, score, accuracy, avgTime, correctCount = 0, incorrectCount = 0, timeoutCount = 0) => {
  try {
    const existing = await Leaderboard.findOne({ userId, topic })
    if (!existing) {
      await Leaderboard.create({
        userId,
        topic,
        totalScore:     score,
        quizzesTaken:   1,
        bestScore:      score,
        avgAccuracy:    accuracy,
        avgTime:        avgTime,
        totalCorrect:   correctCount,
        totalIncorrect: incorrectCount,
        totalTimeout:   timeoutCount,
      })
    } else {
      const newAvgAccuracy = ((existing.avgAccuracy * existing.quizzesTaken) + accuracy) /
                             (existing.quizzesTaken + 1)
      const newAvgTime     = ((existing.avgTime     * existing.quizzesTaken) + avgTime)   /
                             (existing.quizzesTaken + 1)

      await Leaderboard.findOneAndUpdate(
        { userId, topic },
        {
          $inc: {
            totalScore:     score,
            quizzesTaken:   1,
            totalCorrect:   correctCount,
            totalIncorrect: incorrectCount,
            totalTimeout:   timeoutCount,
          },
          $max: { bestScore: score },
          $set: {
            avgAccuracy: newAvgAccuracy,
            avgTime:     newAvgTime,
          },
        }
      )
    }
  } catch (err) {
    console.error('Leaderboard update error:', err.message)
  }
}

// ─── GET /api/leaderboard — all topics top-3 summary ─────────────────────────
const getAllLeaderboards = async (req, res, next) => {
  try {
    const topics = await Question.distinct('topic')
    const result = {}

    await Promise.all(
      topics.map(async (topic) => {
        const entries = await Leaderboard.find({ topic })
          .sort({ totalScore: -1, avgTime: 1 })
          .limit(3)
          .populate('userId', 'name')
          .lean()

        const totalAttempts = await Attempt.countDocuments({ topic, isComplete: true })
        const uniqueUsers   = await Attempt.distinct('userId', { topic, isComplete: true })

        result[topic] = {
          top: entries.map((e, i) => ({
            rank:       i + 1,
            name:       e.userId?.name || 'Anonymous',
            totalScore: Math.round(e.totalScore * 100) / 100,
          })),
          totalAttempts,
          uniqueUsers: uniqueUsers.length,
        }
      })
    )

    res.json(result)
  } catch (err) { next(err) }
}

module.exports = { getLeaderboard, updateLeaderboard, getAllLeaderboards }