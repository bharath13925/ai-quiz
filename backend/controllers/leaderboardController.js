const Leaderboard = require('../models/Leaderboard')
const Attempt     = require('../models/Attempt')

// ─── GET /api/leaderboard/:topic ──────────────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const { topic } = req.params
    const validTopics = ['graphs', 'arrays', 'dbms', 'os']
    if (!validTopics.includes(topic)) {
      return res.status(400).json({ message: 'Invalid topic' })
    }

    const totalAttempts = await Attempt.countDocuments({ topic, isComplete: true })
    const uniqueUsers   = await Attempt.distinct('userId', { topic, isComplete: true })

    const entries = await Leaderboard.find({ topic })
      .sort({ totalScore: -1 })
      .limit(50)
      .populate('userId', 'name email firebaseUid')
      .lean()

    const ranked = entries.map((entry, i) => ({
      rank:         i + 1,
      name:         entry.userId?.name  || 'Anonymous',
      email:        entry.userId?.email || '',
      firebaseUid:  entry.userId?.firebaseUid || null,
      totalScore:   Math.round(entry.totalScore  * 100) / 100,
      bestScore:    Math.round(entry.bestScore   * 100) / 100,
      quizzesTaken: entry.quizzesTaken,
      avgAccuracy:  Math.round(entry.avgAccuracy * 100),
    }))

    res.json({
      topic,
      leaderboard:  ranked,
      totalAttempts,
      uniqueUsers:  uniqueUsers.length,
    })
  } catch (err) { next(err) }
}

// ─── Internal: called after every completed quiz ──────────────────────────────
const updateLeaderboard = async (userId, topic, score, accuracy) => {
  try {
    const existing = await Leaderboard.findOne({ userId, topic })
    if (!existing) {
      await Leaderboard.create({
        userId,
        topic,
        totalScore:   score,
        quizzesTaken: 1,
        bestScore:    score,
        avgAccuracy:  accuracy,
      })
    } else {
      const newAvg = ((existing.avgAccuracy * existing.quizzesTaken) + accuracy) /
                     (existing.quizzesTaken + 1)
      await Leaderboard.findOneAndUpdate(
        { userId, topic },
        {
          $inc: { totalScore: score, quizzesTaken: 1 },
          $max: { bestScore: score },
          $set: { avgAccuracy: newAvg },
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
    const topics = ['graphs', 'arrays', 'dbms', 'os']
    const result = {}

    await Promise.all(
      topics.map(async (topic) => {
        const entries = await Leaderboard.find({ topic })
          .sort({ totalScore: -1 })
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