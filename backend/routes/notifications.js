import { Router } from 'express'
import Notification from '../models/Notification.js'
import { requireAuth } from '../middleware/auth.js'
import { scopedFilter } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try { res.json(await Notification.find(scopedFilter(req, { recipient: req.user.id })).sort({ createdAt: -1 }).limit(100)) } catch (error) { next(error) }
})

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(scopedFilter(req, { _id: req.params.id, recipient: req.user.id }), { readAt: new Date() }, { new: true })
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json(notification)
  } catch (error) { next(error) }
})

export default router
