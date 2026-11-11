import { Router } from 'express'
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', getNotifications)
router.patch('/:id/read', markNotificationRead)

export default router
