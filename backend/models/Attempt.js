const mongoose = require('mongoose')

const questionResultSchema = new mongoose.Schema(
  {
    questionId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number, default: null },  // null = timed out
    isCorrect:      { type: Boolean, default: false },
    timeTaken:      { type: Number, default: 0 },     // seconds (capped at 20)
    timedOut:       { type: Boolean, default: false },
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic:      { type: String, required: true, enum: ['graphs', 'arrays', 'dbms', 'os'] },
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },

    // Answers accumulated across all windows
    questions: [questionResultSchema],

    // Ordered question IDs as served (supports resume)
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

    // Per-window metadata: [ { startIdx, endIdx, difficulty } ]
    windows: [
      {
        startIdx:   Number,
        endIdx:     Number,
        difficulty: String,
        _id:        false,
      },
    ],

    score:     { type: Number, default: 0 },
    accuracy:  { type: Number, default: 0 }, // 0–1
    totalTime: { type: Number, default: 0 }, // seconds

    // Resume state
    currentQuestionIdx: { type: Number, default: 0 },
    isComplete:         { type: Boolean, default: false },
    completedAt:        { type: Date,    default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Attempt', attemptSchema)