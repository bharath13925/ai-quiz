const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type:      String,
      required:  true,
      enum:      ['arrays', 'graphs', 'dbms', 'os','stacks', 'queues', 'linked lists', 'trees', 'hashing', 'greedy algorithms', 'dynamic programming', 'backtracking', 'bit manipulation'],
      lowercase: true,
    },
    difficulty: {
      type:     String,
      required: true,
      enum:     ['easy', 'medium', 'hard'],
    },
    question:  { type: String, required: true },
    options: {
      type:     [String],
      validate: { validator: (v) => v.length === 4, message: 'Must have exactly 4 options' },
      required: true,
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation:   { type: String, default: '' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Question', questionSchema)