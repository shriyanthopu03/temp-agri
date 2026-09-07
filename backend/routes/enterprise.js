import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { requireRole, scopedFilter } from '../../middleware/rbac.js'
import PurchaseOrder from '../../models/PurchaseOrder.js'
import Warehouse from '../../models/Warehouse.js'
import Shipment from '../../models/Shipment.js'
import Settlement from '../../models/Settlement.js'
import Dispute from '../../models/Dispute.js'

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
    const record = await Model.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!record) return response.status(404).json({ message: 'Record not found' })
    if (request.params.resource === 'purchase-orders') {
      const allowed = { draft: ['submitted', 'cancelled'], submitted: ['approved', 'cancelled'], approved: ['partially_fulfilled', 'fulfilled', 'cancelled'], partially_fulfilled: ['fulfilled', 'cancelled'], fulfilled: [], cancelled: [] }
      if (!allowed[record.status]?.includes(request.body.status)) return response.status(409).json({ message: `Cannot move purchase order from ${record.status} to ${request.body.status}` })
      record.history.push({ status: request.body.status, changedBy: request.user.id, note: request.body.note })
    }
    record.status = request.body.status
    await record.save()
    response.json(record)
  } catch (error) { next(error) }
})

router.post('/purchase-orders/:id/allocate', managers, async (request, response, next) => {
  try {
    const order = await PurchaseOrder.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!order) return response.status(404).json({ message: 'Purchase order not found' })
    const { lineIndex, lot, quantity } = request.body
    if (!Number.isInteger(lineIndex) || !lot || !Number.isFinite(quantity) || quantity <= 0) return response.status(400).json({ message: 'lineIndex, lot, and positive quantity are required' })
    const line = order.lines[lineIndex]
    if (!line || quantity > line.quantity - line.allocatedLots.reduce((sum, allocation) => sum + allocation.quantity, 0)) return response.status(400).json({ message: 'Allocation exceeds remaining line quantity' })
    line.allocatedLots.push({ lot, quantity })
    const allocated = order.lines.every((item) => item.allocatedLots.reduce((sum, allocation) => sum + allocation.quantity, 0) >= item.quantity)
    order.status = allocated ? 'fulfilled' : 'partially_fulfilled'
    order.history.push({ status: order.status, changedBy: request.user.id, note: `Allocated ${quantity}` })
    await order.save()
    response.json(order)
  } catch (error) { next(error) }
})

router.post('/warehouses/:id/movements', managers, async (request, response, next) => {
  try {
    const warehouse = await Warehouse.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!warehouse) return response.status(404).json({ message: 'Warehouse not found' })
    const { lot, quantity, direction, reason, bin } = request.body
    if (!lot || !Number.isFinite(quantity) || quantity <= 0 || !['in', 'out'].includes(direction)) return response.status(400).json({ message: 'lot, positive quantity, and direction are required' })
    const item = warehouse.inventory.find((entry) => String(entry.lot) === String(lot))
    const current = item?.quantity || 0
    if (direction === 'out' && quantity > current) return response.status(400).json({ message: 'Insufficient inventory' })
    if (item) { item.quantity += direction === 'in' ? quantity : -quantity; if (bin) item.bin = bin } else if (direction === 'in') warehouse.inventory.push({ lot, quantity, bin })
    warehouse.inventory = warehouse.inventory.filter((entry) => entry.quantity > 0)
    warehouse.movements.push({ lot, quantity, direction, reason, actor: request.user.id })
    await warehouse.save()
    response.json(warehouse)
  } catch (error) { next(error) }
})

router.post('/shipments/:id/dispatch', managers, async (request, response, next) => {
  try {
    const shipment = await Shipment.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!shipment) return response.status(404).json({ message: 'Shipment not found' })
    if (!['created', 'assigned'].includes(shipment.status)) return response.status(409).json({ message: 'Shipment must be created or assigned before dispatch' })
    if (!shipment.vehicle) return response.status(400).json({ message: 'Assign a vehicle before dispatch' })
    shipment.status = 'dispatched'
    shipment.history.push({ status: 'dispatched', actor: request.user.id, note: request.body.note })
    await shipment.save()
    response.json(shipment)
  } catch (error) { next(error) }
})

router.post('/shipments/:id/deliver', managers, async (request, response, next) => {
  try {
    const shipment = await Shipment.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!shipment) return response.status(404).json({ message: 'Shipment not found' })
    if (!['dispatched', 'in_transit'].includes(shipment.status)) return response.status(409).json({ message: 'Shipment is not in transit' })
    shipment.status = 'delivered'
    shipment.deliveredAt = new Date()
    shipment.history.push({ status: 'delivered', actor: request.user.id, note: request.body.note })
    await shipment.save()
    response.json(shipment)
  } catch (error) { next(error) }
})

router.post('/settlements/:id/calculate', managers, async (request, response, next) => {
  try {
    const settlement = await Settlement.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!settlement) return response.status(404).json({ message: 'Settlement not found' })
    const acceptedQuantity = Number(request.body.acceptedQuantity ?? settlement.acceptedQuantity)
    const agreedPrice = Number(request.body.agreedPrice ?? settlement.agreedPrice)
    const deductions = Number(request.body.deductions ?? settlement.deductions ?? 0)
    const adjustments = Number(request.body.adjustments ?? settlement.adjustments ?? 0)
    if (![acceptedQuantity, agreedPrice, deductions, adjustments].every(Number.isFinite) || acceptedQuantity < 0 || agreedPrice < 0 || deductions < 0) return response.status(400).json({ message: 'Settlement values must be valid non-negative numbers' })
    settlement.acceptedQuantity = acceptedQuantity
    settlement.agreedPrice = agreedPrice
    settlement.deductions = deductions
    settlement.adjustments = adjustments
    settlement.total = Math.max(0, acceptedQuantity * agreedPrice - deductions + adjustments)
    await settlement.save()
    response.json(settlement)
  } catch (error) { next(error) }
})

router.post('/disputes/:id/resolve', managers, async (request, response, next) => {
  try {
    const dispute = await Dispute.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!dispute) return response.status(404).json({ message: 'Dispute not found' })
    if (['resolved', 'rejected'].includes(dispute.status)) return response.status(409).json({ message: 'Dispute is already closed' })
    const status = request.body.status || 'resolved'
    if (!['resolved', 'rejected'].includes(status)) return response.status(400).json({ message: 'status must be resolved or rejected' })
    dispute.status = status
    dispute.history.push({ status, actor: request.user.id, note: request.body.note })
    await dispute.save()
    response.json(dispute)
  } catch (error) { next(error) }
})

export default router
