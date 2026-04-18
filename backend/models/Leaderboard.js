const mongoose = require('mongoose')

const leaderboardSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic:        { type: String, required: true, enum: ['graphs', 'arrays', 'dbms', 'os'] },
    totalScore:   { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    bestScore:    { type: Number, default: 0 },
    avgAccuracy:  { type: Number, default: 0 }, // 0–1
  },
  { timestamps: true }
)

// One entry per user per topic
leaderboardSchema.index({ userId: 1, topic: 1 }, { unique: true })

module.exports = mongoose.model('Leaderboard', leaderboardSchema)