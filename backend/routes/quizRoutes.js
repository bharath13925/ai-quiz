const express       = require('express')
const router        = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { startQuiz, submitWindow, getTopics, getHistory, getStats } = require('../controllers/quizController')

router.get('/topics',  getTopics)
router.post('/start',  authMiddleware, startQuiz)
router.post('/window', authMiddleware, submitWindow)  // submit 5-question window → AI → next 5
router.get('/history', authMiddleware, getHistory)
router.get('/stats',   authMiddleware, getStats)

module.exports = router