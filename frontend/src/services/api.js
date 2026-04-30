/**
 * api.js — Central API service layer
 * Supports windowed adaptive quiz, resume, leaderboard with stats.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getToken   = () => localStorage.getItem('aiquiz_token')
export const setToken   = (t) => localStorage.setItem('aiquiz_token', t)
export const clearToken = () => localStorage.removeItem('aiquiz_token')

const apiFetch = async (path, options = {}) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const token = getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`)
    }

    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Server timeout. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}


// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name, email, password) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  firebaseSync: (firebaseIdToken) =>
    apiFetch('/auth/firebase-sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${firebaseIdToken}` },
      body: JSON.stringify({}),
    }),
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
export const quizAPI = {
  getTopics: () => apiFetch('/quiz/topics'),

  /** Start or resume a quiz session */
  start: (topic) =>
    apiFetch('/quiz/start', { method: 'POST', body: JSON.stringify({ topic }) }),

  /**
   * Submit a window of 5 answers — returns next 5 questions or final result.
   * answers: [{ questionId, selectedOption, timeTaken, timedOut }]
   */
  submitWindow: (attemptId, answers, autoSubmit = false) =>
    apiFetch('/quiz/window', { method: 'POST', body: JSON.stringify({ attemptId, answers, autoSubmit }) }),

  /**
   * Record a fullscreen/tab violation.
   * Returns { action: 'warn' | 'force_submit', violationCount }
   */
  recordViolation: (attemptId) =>
    apiFetch('/quiz/violation', { method: 'POST', body: JSON.stringify({ attemptId }) }),

  getHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/quiz/history${qs ? `?${qs}` : ''}`)
  },

  getStats: () => apiFetch('/quiz/stats'),
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
export const leaderboardAPI = {
  getAll:   ()      => apiFetch('/leaderboard'),
  getTopic: (topic) => apiFetch(`/leaderboard/${topic}`),
}

// ── CONTACT ───────────────────────────────────────────────────────────────────
export const contactAPI = {
  submit: (name, email, message) =>
    apiFetch('/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) }),
}