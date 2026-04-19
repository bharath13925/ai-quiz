require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const authRoutes        = require('./routes/authRoutes')
const quizRoutes        = require('./routes/quizRoutes')
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const questionRoutes    = require('./routes/questionRoutes')
const contactRoutes     = require('./routes/contactRoutes')
const errorMiddleware   = require('./middleware/errorMiddleware')

const app = express()

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.use('/api/auth',        authRoutes)
app.use('/api/quiz',        quizRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/questions',   questionRoutes)
app.use('/api/contact',     contactRoutes)

app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
)

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    )
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

