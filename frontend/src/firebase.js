import { initializeApp }              from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            'AIzaSyDUiKGY8e7wCqTpyulOk1-cem2sRGC8gLQ',
  authDomain:        'ai-quiz-da8bd.firebaseapp.com',
  projectId:         'ai-quiz-da8bd',
  storageBucket:     'ai-quiz-da8bd.appspot.com',
  messagingSenderId: '326858838454',
  appId:             '1:326858838454:web:12bb72c0a4b208e6d4f117',
}

const app = initializeApp(firebaseConfig)

export const auth           = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export default app