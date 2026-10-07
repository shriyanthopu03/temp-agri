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
const orderViewers = requireRole('admin', 'platform_admin', 'buyer', 'farmer', 'logistics_coordinator')

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
    const { batchId, grade, rating, measuredQuantity, remarks, accepted } = req.body
    if (!batchId) return res.status(400).json({ message: 'Batch ID is required' })
    const rawGrade = String(grade || 'A').toUpperCase()
    const cleanGrade = rawGrade.includes('B') ? 'B' : rawGrade.includes('C') ? 'C' : 'A'
    const numRating = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 4.5

    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: batchId }))
    if (!lot) return res.status(404).json({ message: 'Batch not found' })
    if (!['created', 'received'].includes(lot.status)) return res.status(409).json({ message: 'Batch is not waiting for inspection' })
    const measured = Number(measuredQuantity ?? lot.quantity)
    if (!Number.isFinite(measured) || measured <= 0 || measured > lot.quantity) return res.status(400).json({ message: 'Measured quantity must be positive and cannot exceed batch quantity' })
    
    const isAccepted = accepted !== undefined ? Boolean(accepted) : cleanGrade !== 'C'
    const finalGrade = isAccepted ? (cleanGrade === 'C' ? 'A' : cleanGrade) : 'C'
    const finalStatus = isAccepted ? 'accepted' : 'rejected'

    lot.inspectionHistory.push({ inspector: req.user.userId, measuredQuantity: measured, grade: finalGrade, rating: numRating, notes: remarks })
    lot.qualityGrade = finalGrade
    lot.qualityRating = numRating
    lot.availableQuantity = measured
    lot.status = finalStatus
    lot.statusHistory.push({ status: finalStatus, changedBy: req.user.userId, note: 'Quality inspection completed' })
    await lot.save()
    res.json(await ProduceLot.findById(lot._id).populate('farmer', 'name email').populate('farm', 'farmName location areaAcres'))
  } catch (error) { next(error) }
})

router.get('/available-batches', buyers, async (req, res, next) => {
  try {
    const lots = await ProduceLot.find(scopedFilter(req, { status: 'accepted', availableQuantity: { $gt: 0 } }))
      .populate('farmer', 'name email').populate('farm', 'farmName location boundary areaAcres')
      .sort({ createdAt: -1 })
    res.json(lots)
  } catch (error) { next(error) }
})

router.post('/orders', buyers, async (req, res, next) => {
  try {
    const { batchId, quantity, buyerLocation } = req.body
    const requested = Number(quantity)
    if (!batchId || !Number.isFinite(requested) || requested <= 0 || !buyerLocation?.address || !coordinates(buyerLocation)) {
      return res.status(400).json({ message: 'Batch, positive quantity, delivery address, latitude, and longitude are required' })
    }
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: batchId, status: 'accepted', availableQuantity: { $gte: requested } })).populate('farm')
    if (!lot) return res.status(409).json({ message: 'Only inspected, available batches can be purchased' })
    
    // Extract pickup coordinates from farm location or boundary centroid fallback
    let pickupLat = lot.farm?.location?.latitude
    let pickupLng = lot.farm?.location?.longitude
    if (!Number.isFinite(Number(pickupLat)) || !Number.isFinite(Number(pickupLng))) {
      const points = lot.farm?.boundary?.coordinates?.[0]
      if (Array.isArray(points) && points.length > 0) {
        const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
        pickupLng = sum[0] / points.length
        pickupLat = sum[1] / points.length
      } else {
        pickupLat = 20.5937
        pickupLng = 78.9629
      }
    }
    const pickupAddress = lot.farm?.location?.address || lot.farm?.farmName || 'Farm Location'
    const pickupLocationObj = { address: pickupAddress, latitude: Number(pickupLat), longitude: Number(pickupLng) }

    const order = await PurchaseOrder.create({
      ...scopedFilter(req), supplier: lot.farmer, buyer: req.user.userId, farm: lot.farm._id, batch: lot._id,
      number: `ORD-${Date.now()}`, status: 'submitted', crop: lot.category, quantity: requested, unit: lot.unit,
      unitPrice: lot.marketPrice || 0, totalAmount: requested * (lot.marketPrice || 0),
      buyerLocation: { address: buyerLocation.address, latitude: Number(buyerLocation.latitude), longitude: Number(buyerLocation.longitude) },
      pickupLocation: pickupLocationObj,
      lines: [{ category: lot.category, quantity: requested, unitPrice: lot.marketPrice || 0, allocatedLots: [{ lot: lot._id, quantity: requested }] }],
      history: [{ status: 'submitted', changedBy: req.user.userId, note: 'Buyer order created' }],
    })
    lot.availableQuantity -= requested
    if (lot.availableQuantity === 0) lot.status = 'allocated'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.userId, note: `Reserved ${requested} ${lot.unit}` })
    await lot.save()

    const shipment = await Shipment.create({
      ...scopedFilter(req), order: order._id, buyer: order.buyer, farmer: order.supplier,
      shipmentNumber: `SHP-${Date.now()}`, status: 'ready_for_pickup', lots: [{ lot: lot._id, quantity: requested }],
      pickupLocation: order.pickupLocation, destination: order.buyerLocation, qualityGrade: lot.qualityGrade,
      history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from buyer purchase' }]
    })
    order.shipment = shipment._id
    await order.save()

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate('supplier', 'name email')
      .populate('buyer', 'name email')
      .populate('farm')
      .populate('batch')
      .populate({
        path: 'shipment',
        populate: [
          { path: 'buyer', select: 'name email' },
          { path: 'farmer', select: 'name email' },
        ],
      })
    res.status(201).json(populatedOrder)
  } catch (error) { next(error) }
})

router.get('/orders', orderViewers, async (req, res, next) => {
  try {
    const filter = req.user.role === 'buyer' ? { buyer: req.user.userId } : req.user.role === 'farmer' ? { supplier: req.user.userId } : {}
    res.json(await PurchaseOrder.find(scopedFilter(req, filter)).populate('supplier', 'name').populate('buyer', 'name').populate('farm', 'farmName location').populate('batch', 'category variety qualityGrade qualityRating').sort({ createdAt: -1 }))
  } catch (error) { next(error) }
})

router.get('/shipments', logistics, async (req, res, next) => {
  try {
    const shipments = await Shipment.find(scopedFilter(req))
      .populate('order')
      .populate('buyer', 'name email')
      .populate('farmer', 'name email')
      .populate({
        path: 'order',
        populate: [
          { path: 'farm', select: 'farmName location boundary areaAcres areaHectares crops' },
          { path: 'batch', select: 'category variety quantity availableQuantity unit qualityGrade qualityRating status' },
          { path: 'buyer', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 })
    res.json(shipments)
  } catch (error) { next(error) }
})

router.post('/shipments', logistics, async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findOne(scopedFilter(req, { _id: req.body.orderId, status: 'submitted' })).populate('batch').populate('supplier').populate('buyer')
    if (!order) return res.status(409).json({ message: 'Only a purchased order can be assigned for shipment' })
    if (order.shipment || await Shipment.exists(scopedFilter(req, { order: order._id }))) return res.status(409).json({ message: 'A shipment already exists for this order' })
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