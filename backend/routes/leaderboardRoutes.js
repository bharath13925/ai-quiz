const express = require('express')
const router  = express.Router()
const { getLeaderboard, getAllLeaderboards } = require('../controllers/leaderboardController')

router.get('/',       getAllLeaderboards)
router.get('/:topic', getLeaderboard)

module.exports = router