import { Router } from 'express'
import {
  googleAuth,
  firebaseAuth,
  googleCallback,
  register,
  login,
  updateProfile,
  getProfile,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/google', googleAuth)
router.post('/firebase', firebaseAuth)
router.get('/google/callback', googleCallback)
router.post('/register', register)
router.post('/login', login)
router.get('/profile', requireAuth, getProfile)
router.put('/profile', requireAuth, updateProfile)

export default router
