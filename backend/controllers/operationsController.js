import OperationsRecord, { modules } from '../models/OperationsRecord.js'
import { scopedFilter } from '../middleware/rbac.js'

export async function getOperationsByModule(req, res, next) {
  try {
    if (!modules.includes(req.params.module)) return res.status(404).json({ message: 'Unsupported operations module' })
    res.json(await OperationsRecord.find(scopedFilter(req, { module: req.params.module })).sort({ updatedAt: -1 }))
  } catch (error) {
    next(error)
  }
}

export async function createOperationsRecord(req, res, next) {
  try {
    if (!modules.includes(req.params.module) || !req.body.name) {
      return res.status(400).json({ message: 'Valid module and name are required' })
    }
    const record = await OperationsRecord.create({
      ...scopedFilter(req),
      module: req.params.module,
      name: req.body.name,
      status: req.body.status || 'draft',
      data: req.body.data || {},
      history: [{ action: 'created', changedBy: req.user.userId }],
    })
    res.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

export async function updateOperationsStatus(req, res, next) {
  try {
    const record = await OperationsRecord.findOne(scopedFilter(req, { module: req.params.module, _id: req.params.id }))
    if (!record) return res.status(404).json({ message: 'Record not found' })
    record.status = req.body.status || record.status
    record.history.push({ action: `status:${record.status}`, changedBy: req.user.userId, note: req.body.note })
    await record.save()
    res.json(record)
  } catch (error) {
    next(error)
  }
}

export async function deleteOperationsRecord(req, res, next) {
  try {
    const result = await OperationsRecord.deleteOne(scopedFilter(req, { module: req.params.module, _id: req.params.id }))
    if (!result.deletedCount) return res.status(404).json({ message: 'Record not found' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

export default {
  getOperationsByModule,
  createOperationsRecord,
  updateOperationsStatus,
  deleteOperationsRecord,
}
