const admin = require('firebase-admin')

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null

  if (!privateKey) {
    console.warn('⚠️  Firebase env vars not set — Firebase Admin features disabled')
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        type:                        process.env.FIREBASE_TYPE,
        project_id:                  process.env.FIREBASE_PROJECT_ID,
        private_key_id:              process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key:                 privateKey,
        client_email:                process.env.FIREBASE_CLIENT_EMAIL,
        client_id:                   process.env.FIREBASE_CLIENT_ID,
        auth_uri:                    process.env.FIREBASE_AUTH_URI,
        token_uri:                   process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url:        process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain:             'googleapis.com',
      }),
    })
    console.log('✅ Firebase Admin initialized from environment variables')
  }
}

module.exports = admin