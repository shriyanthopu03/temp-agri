import { Router } from 'express'
import {
  googleAuth,
  firebaseAuth,
  googleCallback,
  register,
  login,
} from '../controllers/authController.js'

const router = Router()

router.get('/google', googleAuth)
router.post('/firebase', firebaseAuth)
router.get('/google/callback', googleCallback)
router.post('/register', register)
router.post('/login', login)

export default router
