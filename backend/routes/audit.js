import { Router } from 'express'
import AuditEvent from '../models/AuditEvent.js'
import ProduceLot from '../models/ProduceLot.js'
import OperationsRecord from '../models/OperationsRecord.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole, scopedFilter } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

router.get('/', requireRole('admin', 'regional_manager', 'org_manager'), async (req, res, next) => {
  try { res.json(await AuditEvent.find(scopedFilter(req)).populate('actor', 'name email').sort({ createdAt: -1 }).limit(250)) } catch (error) { next(error) }
})

router.get('/export', async (req, res, next) => {
  try {
    const events = await AuditEvent.find(scopedFilter(req)).sort({ createdAt: -1 }).limit(5000).lean()
    const header = 'timestamp,action,entityType,entityId,actor\\n'
    const rows = events.map((event) => [event.createdAt?.toISOString() || '', event.action, event.entityType || '', event.entityId || '', event.actor || ''].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="agritrade-audit.csv"')
    res.send(header + rows)
  } catch (error) { next(error) }
})

router.get('/report', async (req, res, next) => {
  try {
    const filter = scopedFilter(req)
    const [lots, operations] = await Promise.all([
      ProduceLot.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 }, quantity: { $sum: '$quantity' } } }]),
      OperationsRecord.aggregate([{ $match: filter }, { $group: { _id: { module: '$module', status: '$status' }, count: { $sum: 1 } } }])
    ])
    res.json({ generatedAt: new Date(), lots, operations })
  } catch (error) { next(error) }
})

export default router
