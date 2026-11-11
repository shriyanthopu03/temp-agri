import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { firebaseAuth } from '../firebase'
import { apiRequest } from './api'

export async function requestAuth(path, payload) {
  return apiRequest(`/api/auth/${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
  const idToken = await result.user.getIdToken()
  return requestAuth('firebase', { idToken })
}

export default {
  requestAuth,
  signInWithGoogle,
}
