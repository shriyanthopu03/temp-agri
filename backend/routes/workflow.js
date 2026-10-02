import { Router } from 'express'
import Farm from '../models/Farm.js'
import ProduceLot from '../models/ProduceLot.js'
import PurchaseOrder from '../models/PurchaseOrder.js'
import Shipment from '../models/Shipment.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole, scopedFilter } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const inspectors = requireRole('admin', 'platform_admin', 'quality_inspector')
const buyers = requireRole('admin', 'platform_admin', 'buyer')
const logistics = requireRole('admin', 'platform_admin', 'logistics_coordinator')

function coordinates(value) {
  const latitude = Number(value?.latitude)
  const longitude = Number(value?.longitude)
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

router.get('/inspections/pending', inspectors, async (req, res, next) => {
  try {
    const lots = await ProduceLot.find(scopedFilter(req, { status: { $in: ['created', 'received'] } }))
      .populate('farmer', 'name email').populate('farm', 'farmName location areaAcres')
      .sort({ createdAt: 1 })
    res.json(lots)
  } catch (error) { next(error) }
})

router.post('/inspections', inspectors, async (req, res, next) => {
  try {
    const { batchId, grade, rating, measuredQuantity, remarks } = req.body
    if (!batchId || !['A', 'B', 'C'].includes(grade) || !Number.isFinite(Number(rating)) || Number(rating) < 0 || Number(rating) > 5) return res.status(400).json({ message: 'Batch, grade, and rating between 0 and 5 are required' })
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: batchId }))
    if (!lot) return res.status(404).json({ message: 'Batch not found' })
    if (!['created', 'received'].includes(lot.status)) return res.status(409).json({ message: 'Batch is not waiting for inspection' })
    const measured = Number(measuredQuantity ?? lot.quantity)
    if (!Number.isFinite(measured) || measured <= 0 || measured > lot.quantity) return res.status(400).json({ message: 'Measured quantity must be positive and cannot exceed batch quantity' })
    lot.inspectionHistory.push({ inspector: req.user.userId, measuredQuantity: measured, grade, rating: Number(rating), notes: remarks })
    lot.qualityGrade = grade
    lot.qualityRating = Number(rating)
    lot.availableQuantity = measured
    lot.status = grade === 'C' ? 'rejected' : 'accepted'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.userId, note: 'Quality inspection completed' })
    await lot.save()
    res.json(lot)
  } catch (error) { next(error) }
})

router.get('/available-batches', buyers, async (req, res, next) => {
  try {
    const lots = await ProduceLot.find(scopedFilter(req, { status: 'accepted', availableQuantity: { $gt: 0 } }))
      .populate('farmer', 'name email').populate('farm', 'farmName location areaAcres')
      .sort({ createdAt: -1 })
    res.json(lots)
  } catch (error) { next(error) }
})

router.post('/orders', buyers, async (req, res, next) => {
  try {
    const { batchId, quantity, buyerLocation } = req.body
    const requested = Number(quantity)
    if (!batchId || !Number.isFinite(requested) || requested <= 0 || !buyerLocation?.address || !coordinates(buyerLocation)) return res.status(400).json({ message: 'Batch, positive quantity, delivery address, latitude, and longitude are required' })
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: batchId, status: 'accepted', availableQuantity: { $gte: requested } })).populate('farm')
    if (!lot) return res.status(409).json({ message: 'Only inspected, available batches can be purchased' })
    const pickup = lot.farm?.location
    if (!coordinates(pickup)) return res.status(409).json({ message: 'Farmer farm coordinates are required before purchase' })
    const order = await PurchaseOrder.create({
      ...scopedFilter(req), supplier: lot.farmer, buyer: req.user.userId, farm: lot.farm._id, batch: lot._id,
      number: `ORD-${Date.now()}`, status: 'submitted', crop: lot.category, quantity: requested, unit: lot.unit,
      unitPrice: lot.marketPrice || 0, totalAmount: requested * (lot.marketPrice || 0),
      buyerLocation: { address: buyerLocation.address, latitude: Number(buyerLocation.latitude), longitude: Number(buyerLocation.longitude) },
      pickupLocation: { address: pickup.location.address, latitude: Number(pickup.latitude), longitude: Number(pickup.longitude) },
      lines: [{ category: lot.category, quantity: requested, unitPrice: lot.marketPrice || 0, allocatedLots: [{ lot: lot._id, quantity: requested }] }],
      history: [{ status: 'submitted', changedBy: req.user.userId, note: 'Buyer order created' }],
    })
    lot.availableQuantity -= requested
    if (lot.availableQuantity === 0) lot.status = 'allocated'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.userId, note: `Reserved ${requested} ${lot.unit}` })
    await lot.save()
    const shipment = await Shipment.create({ ...scopedFilter(req), order: order._id, buyer: order.buyer, farmer: order.supplier, shipmentNumber: `SHP-${Date.now()}`, status: 'ready_for_pickup', lots: [{ lot: lot._id, quantity: requested }], pickupLocation: order.pickupLocation, destination: order.buyerLocation, qualityGrade: lot.qualityGrade, history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from buyer purchase' }] })
    order.shipment = shipment._id
    await order.save()
    res.status(201).json(await order.populate([{ path: 'supplier', select: 'name' }, { path: 'batch' }, { path: 'farm' }]))
  } catch (error) { next(error) }
})

router.get('/orders', async (req, res, next) => {
  try {
    const filter = req.user.role === 'buyer' ? { buyer: req.user.userId } : req.user.role === 'farmer' ? { supplier: req.user.userId } : {}
    res.json(await PurchaseOrder.find(scopedFilter(req, filter)).populate('supplier', 'name').populate('buyer', 'name').populate('farm', 'farmName location').populate('batch', 'category variety qualityGrade qualityRating').sort({ createdAt: -1 }))
  } catch (error) { next(error) }
})

router.get('/shipments', logistics, async (req, res, next) => {
  try { res.json(await Shipment.find(scopedFilter(req)).populate('order').populate('buyer', 'name').populate('farmer', 'name').sort({ createdAt: -1 })) } catch (error) { next(error) }
})

router.post('/shipments', logistics, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findOne(scopedFilter(req, { _id: req.body.orderId, status: 'submitted' })).populate('batch').populate('supplier').populate('buyer')
    if (!order) return res.status(409).json({ message: 'Only a purchased order can be assigned for shipment' })
    const shipment = await Shipment.create({ ...scopedFilter(req), order: order._id, buyer: order.buyer._id, farmer: order.supplier._id, shipmentNumber: `SHP-${Date.now()}`, status: 'ready_for_pickup', lots: [{ lot: order.batch._id, quantity: order.quantity }], pickupLocation: order.pickupLocation, destination: order.buyerLocation, qualityGrade: order.batch.qualityGrade, history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from purchased order' }] })
    order.status = 'approved'
    order.shipment = shipment._id
    order.history.push({ status: 'approved', changedBy: req.user.userId, note: 'Shipment created' })
    await order.save()
    res.status(201).json(shipment)
  } catch (error) { next(error) }
})

router.put('/shipments/:id/assign', logistics, async (req, res, next) => {
  try {
    if (!req.body.vehicleId) return res.status(400).json({ message: 'Vehicle is required' })
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (!['ready_for_pickup', 'created'].includes(shipment.status)) return res.status(409).json({ message: 'Shipment is not ready for assignment' })
    shipment.vehicle = req.body.vehicleId
    shipment.deliveryAgent = req.body.deliveryAgentId || undefined
    shipment.status = 'assigned'
    shipment.history.push({ status: 'assigned', actor: req.user.userId, note: req.body.note })
    await shipment.save()
    res.json(shipment)
  } catch (error) { next(error) }
})

router.put('/shipments/:id/status', logistics, async (req, res, next) => {
  try {
    const allowed = { assigned: ['picked_up'], picked_up: ['in_transit'], in_transit: ['dispatched', 'delivered'], dispatched: ['delivered'] }
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (!allowed[shipment.status]?.includes(req.body.status)) return res.status(409).json({ message: `Cannot move shipment from ${shipment.status} to ${req.body.status}` })
    shipment.status = req.body.status
    if (req.body.status === 'delivered') shipment.deliveredAt = new Date()
    shipment.history.push({ status: req.body.status, actor: req.user.userId, note: req.body.note })
    await shipment.save()
    if (req.body.status === 'delivered' && shipment.order) {
      const order = await PurchaseOrder.findOne(scopedFilter(req, { _id: shipment.order })).populate('batch')
      if (order) {
        order.status = 'fulfilled'
        order.deliveryConfirmedAt = new Date()
        order.history.push({ status: 'fulfilled', changedBy: req.user.userId, note: 'Shipment delivered' })
        await order.save()
        if (order.batch) {
          order.batch.status = 'delivered'
          order.batch.statusHistory.push({ status: 'delivered', changedBy: req.user.userId, note: 'Related shipment delivered' })
          await order.batch.save()
        }
      }
    }
    res.json(shipment)
  } catch (error) { next(error) }
})

router.put('/shipments/:id/dispatch', logistics, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (shipment.status !== 'assigned' || !shipment.vehicle) return res.status(409).json({ message: 'Only an assigned shipment can be dispatched' })
    shipment.status = 'dispatched'
    shipment.history.push({ status: 'dispatched', actor: req.user.userId, note: req.body.note })
    await shipment.save()
    res.json(shipment)
  } catch (error) { next(error) }
})

export default router