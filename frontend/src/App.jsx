import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage     from './pages/LandingPage'
import SignupPage      from './pages/SignupPage'
import LoginPage       from './pages/LoginPage'
import Dashboard       from './pages/Dashboard'
import QuizPage        from './pages/QuizPage'
import ResultsPage     from './pages/ResultsPage'
import LeaderboardPage from './pages/LeaderboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                   element={<LandingPage />} />
        <Route path="/signup"             element={<SignupPage />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/quiz/:topic"        element={<QuizPage />} />
        <Route path="/quiz/results"       element={<ResultsPage />} />
        <Route path="/leaderboard"        element={<Navigate to="/leaderboard/graphs" replace />} />
        <Route path="/leaderboard/:topic" element={<LeaderboardPage />} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App