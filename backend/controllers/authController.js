const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' })
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user         = await User.create({ name, email, passwordHash })
    const token        = generateToken(user._id)

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, firebaseUid: user.firebaseUid || null },
    })
  } catch (err) { next(err) }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id)

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, firebaseUid: user.firebaseUid || null },
    })
  } catch (err) { next(err) }
}

// ─── POST /api/auth/firebase-sync ────────────────────────────────────────────
// Called after every Google / Firebase sign-in.
// • Creates the MongoDB user if they don't exist yet.
// • Always writes the Firebase UID into the MongoDB document so it's stored
//   even when the user originally signed up with email+password.
const firebaseSync = async (req, res, next) => {
  try {
    const { uid, email, name } = req.firebaseUser   // decoded by firebaseAdmin middleware

    let user = await User.findOne({ email })

    if (!user) {
      // Brand-new user — create with a deterministic (but unusable) password hash
      const passwordHash = await bcrypt.hash(uid + process.env.JWT_SECRET, 12)
      user = await User.create({
        name:        name || email,
        email,
        passwordHash,
        firebaseUid: uid,
      })
    } else if (user.firebaseUid !== uid) {
      // Existing user — persist Firebase UID if not already set
      user.firebaseUid = uid
      await user.save()
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, firebaseUid: user.firebaseUid },
    })
  } catch (err) { next(err) }
}

module.exports = { register, login, firebaseSync }