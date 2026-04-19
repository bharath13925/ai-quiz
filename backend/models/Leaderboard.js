const mongoose = require('mongoose')

const leaderboardSchema = new mongoose.Schema(
  {
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // No enum — accept any topic that exists in the Question collection
    topic:          { type: String, required: true, lowercase: true, trim: true },
    totalScore:     { type: Number, default: 0 },
    quizzesTaken:   { type: Number, default: 0 },
    bestScore:      { type: Number, default: 0 },
    avgAccuracy:    { type: Number, default: 0 }, // 0–1
    avgTime:        { type: Number, default: 0 }, // average response time in seconds
    totalCorrect:   { type: Number, default: 0 },
    totalIncorrect: { type: Number, default: 0 },
    totalTimeout:   { type: Number, default: 0 },
  },
  { timestamps: true }
)

// One entry per user per topic
leaderboardSchema.index({ userId: 1, topic: 1 }, { unique: true })

module.exports = mongoose.model('Leaderboard', leaderboardSchema)