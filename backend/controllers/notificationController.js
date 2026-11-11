import Notification from '../models/Notification.js'
import { scopedFilter } from '../middleware/rbac.js'

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find(scopedFilter(req, { recipient: req.user.userId }))
      .sort({ createdAt: -1 })
      .limit(100)
    res.json(notifications)
  } catch (error) {
    next(error)
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      scopedFilter(req, { _id: req.params.id, recipient: req.user.userId }),
      { readAt: new Date() },
      { new: true }
    )
    if (!notification) return res.status(404).json({ message: 'Notification not found' })
    res.json(notification)
  } catch (error) {
    next(error)
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany(
      scopedFilter(req, { recipient: req.user.userId, readAt: null }),
      { readAt: new Date() }
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
}

