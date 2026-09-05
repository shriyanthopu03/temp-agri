import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requireRole, scopedFilter } from '../middleware/rbac.js'
import PurchaseOrder from '../models/PurchaseOrder.js'
import Warehouse from '../models/Warehouse.js'
import Shipment from '../models/Shipment.js'
import Settlement from '../models/Settlement.js'
import Dispute from '../models/Dispute.js'

const router = Router()
router.use(requireAuth)

const resources = { 'purchase-orders': PurchaseOrder, warehouses: Warehouse, shipments: Shipment, settlements: Settlement, disputes: Dispute }
const managers = requireRole('admin', 'regional_manager', 'org_manager', 'operator')
const editors = requireRole('admin', 'regional_manager', 'org_manager')

function getModel(resource, response) {
  const Model = resources[resource]
  if (!Model) response.status(404).json({ message: 'Unsupported enterprise resource' })
  return Model
}

router.get('/:resource', async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const query = { ...scopedFilter(request) }
    if (request.query.status) query.status = request.query.status
    if (request.query.search) query.$or = [{ name: new RegExp(request.query.search, 'i') }, { reference: new RegExp(request.query.search, 'i') }]
    response.json(await Model.find(query).sort({ updatedAt: -1 }).limit(250))
  } catch (error) { next(error) }
})

router.get('/:resource/:id', async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!record) return response.status(404).json({ message: 'Record not found' })
    response.json(record)
  } catch (error) { next(error) }
})

router.post('/:resource', managers, async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.create({ ...request.body, ...scopedFilter(request) })
    response.status(201).json(record)
  } catch (error) { next(error) }
})

router.patch('/:resource/:id', editors, async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.findOneAndUpdate(scopedFilter(request, { _id: request.params.id }), { $set: request.body }, { new: true, runValidators: true })
    if (!record) return response.status(404).json({ message: 'Record not found' })
    response.json(record)
  } catch (error) { next(error) }
})

router.delete('/:resource/:id', editors, async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const result = await Model.deleteOne(scopedFilter(request, { _id: request.params.id }))
    if (!result.deletedCount) return response.status(404).json({ message: 'Record not found' })
    response.status(204).end()
  } catch (error) { next(error) }
})

router.patch('/:resource/:id/status', managers, async (request, response, next) => {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    if (!request.body.status) return response.status(400).json({ message: 'status is required' })
    const record = await Model.findOneAndUpdate(scopedFilter(request, { _id: request.params.id }), { $set: { status: request.body.status } }, { new: true, runValidators: true })
    if (!record) return response.status(404).json({ message: 'Record not found' })
    response.json(record)
  } catch (error) { next(error) }
})

export default router
