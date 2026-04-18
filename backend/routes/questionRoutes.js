const express  = require('express')
const router   = express.Router()
const Question = require('../models/Question')

// POST /api/questions/bulk  — seed questions
router.post('/bulk', async (req, res, next) => {
  try {
    const { questions } = req.body
    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ message: '"questions" must be a non-empty array' })

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.topic || !q.difficulty || !q.question ||
          !Array.isArray(q.options) || q.options.length !== 4 ||
          q.correctAnswer === undefined)
        return res.status(400).json({ message: `Question at index ${i} is missing required fields` })
    }

    const inserted = await Question.insertMany(questions, { ordered: false })
    res.status(201).json({
      message: `${inserted.length} question(s) added`,
      count:   inserted.length,
      ids:     inserted.map((q) => q._id),
    })
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'Some questions already exist' })
    next(err)
  }
})

// GET /api/questions  — list with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { topic, difficulty } = req.query
    const filter = {}
    if (topic)      filter.topic      = topic.toLowerCase()
    if (difficulty) filter.difficulty = difficulty
    const questions = await Question.find(filter).select('-__v').lean()
    res.json({ count: questions.length, questions })
  } catch (err) { next(err) }
})

// DELETE /api/questions/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.json({ message: 'Question deleted' })
  } catch (err) { next(err) }
})

module.exports = router