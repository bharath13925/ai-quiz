const admin = require('../firebase')

const firebaseAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No Firebase token provided' })

  const idToken = authHeader.split(' ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    req.firebaseUser = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid Firebase token' })
  }
}

module.exports = firebaseAdmin