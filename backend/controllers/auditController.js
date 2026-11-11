import AuditEvent from '../models/AuditEvent.js'
import ProduceLot from '../models/ProduceLot.js'
import OperationsRecord from '../models/OperationsRecord.js'
import { scopedFilter } from '../middleware/rbac.js'

export async function getAuditEvents(req, res, next) {
  try {
    const events = await AuditEvent.find(scopedFilter(req))
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(250)
    res.json(events)
  } catch (error) {
    next(error)
  }
}

export async function exportAuditEvents(req, res, next) {
  try {
    const events = await AuditEvent.find(scopedFilter(req)).sort({ createdAt: -1 }).limit(5000).lean()
    const header = 'timestamp,action,entityType,entityId,actor\n'
    const rows = events
      .map((event) =>
        [event.createdAt?.toISOString() || '', event.action, event.entityType || '', event.entityId || '', event.actor || '']
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="agritrade-audit.csv"')
    res.send(header + rows)
  } catch (error) {
    next(error)
  }
}

export async function getAuditReport(req, res, next) {
  try {
    const filter = scopedFilter(req)
    const [lots, operations] = await Promise.all([
      ProduceLot.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 }, quantity: { $sum: '$quantity' } } }]),
      OperationsRecord.aggregate([{ $match: filter }, { $group: { _id: { module: '$module', status: '$status' }, count: { $sum: 1 } } }]),
    ])
    res.json({ generatedAt: new Date(), lots, operations })
  } catch (error) {
    next(error)
  }
}

export default {
  getAuditEvents,
  exportAuditEvents,
  getAuditReport,
}
