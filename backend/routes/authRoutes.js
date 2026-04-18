const express      = require('express')
const router       = express.Router()
const { register, login, firebaseSync } = require('../controllers/authController')
const firebaseAdmin = require('../middleware/firebaseAdmin')

router.post('/register',      register)
router.post('/login',         login)
router.post('/firebase-sync', firebaseAdmin, firebaseSync)

module.exports = router