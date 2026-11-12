import mongoose from 'mongoose'
import User from '../models/User.js'
import Farm from '../models/Farm.js'
import ProduceLot from '../models/ProduceLot.js'
import PurchaseOrder from '../models/PurchaseOrder.js'
import Shipment from '../models/Shipment.js'
import { scopedFilter } from '../middleware/rbac.js'
import { isValidCoordinate } from '../utils/geo.js'

export async function getPendingInspections(req, res, next) {
  try {
    const lots = await ProduceLot.find({ status: { $in: ['created', 'received'] } })
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres boundary crops cropHealth expectedHarvestDate expectedQuantity')
      .sort({ createdAt: 1 })
    res.json(lots)
  } catch (error) {
    next(error)
  }
}

export async function submitInspection(req, res, next) {
  try {
    const { batchId, grade, rating, measuredQuantity, remarks, accepted, category, cropCondition } = req.body
    const rawGrade = String(grade || 'Grade A').trim()
    const match = rawGrade.match(/\b([A-D])\b/i) || rawGrade.match(/Grade\s*([A-D])/i)
    const letter = match ? match[1].toUpperCase() : (rawGrade.endsWith('D') ? 'D' : rawGrade.endsWith('C') ? 'C' : rawGrade.endsWith('B') ? 'B' : 'A')
    const cleanGrade = `Grade ${letter}`

    const numRating = Number.isFinite(Number(rating)) ? Math.max(0, Math.min(5, Number(rating))) : 4.5

    let lot = null
    if (batchId && mongoose.isValidObjectId(batchId)) {
      lot = await ProduceLot.findOne(scopedFilter(req, { _id: batchId }))
    }
    if (!lot) {
      lot = await ProduceLot.findOne(scopedFilter(req, { status: { $in: ['created', 'received'] } })).sort({ createdAt: -1 })
    }
    if (!lot) {
      return res.status(404).json({ message: 'Produce lot not found for inspection' })
    }

    const measured = Number(measuredQuantity ?? lot.quantity)
    const isAccepted = accepted !== undefined ? Boolean(accepted) : cleanGrade !== 'Grade D'
    const finalGrade = cleanGrade
    const finalStatus = isAccepted ? 'accepted' : 'rejected'

    lot.inspectionHistory.push({
      inspector: req.user.userId,
      measuredQuantity: measured,
      grade: finalGrade,
      rating: numRating,
      notes: remarks || cropCondition,
    })
    lot.qualityGrade = finalGrade
    lot.qualityRating = numRating
    lot.availableQuantity = isAccepted ? measured : 0
    lot.status = finalStatus
    lot.marketPrice = lot.marketPrice || 60
    lot.statusHistory.push({
      status: finalStatus,
      changedBy: req.user.userId,
      note: `Quality inspection completed: ${finalGrade} (${finalStatus})`,
    })
    await lot.save()

    if (lot.farm) {
      await Farm.findByIdAndUpdate(lot.farm, { inspectionStatus: 'inspected' }).catch(() => undefined)
    }

    const populated = await ProduceLot.findById(lot._id)
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres boundary crops')

    res.json(populated)
  } catch (error) {
    next(error)
  }
}

export async function getAvailableBatches(req, res, next) {
  try {
    const lots = await ProduceLot.find({ status: 'accepted', availableQuantity: { $gt: 0 } })
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location boundary areaAcres crops')
      .sort({ createdAt: -1 })
    res.json(lots)
  } catch (error) {
    next(error)
  }
}

export async function createOrder(req, res, next) {
  try {
    const {
      isCustomPO,
      batchId,
      quantity,
      unit,
      unitPrice,
      crop,
      farmerName,
      farmerEmail,
      farmName,
      farmId,
      pickupLocation,
      buyerLocation,
      qualityGrade,
      notes,
    } = req.body

    const requested = Number(quantity)
    if (!Number.isFinite(requested) || requested <= 0) {
      return res.status(400).json({ message: 'Positive purchase order quantity is required' })
    }

    const deliveryAddress = buyerLocation?.address || 'Buyer Regional Distribution Center'
    const deliveryLat = isValidCoordinate(buyerLocation?.latitude, buyerLocation?.longitude) ? Number(buyerLocation.latitude) : 19.0760
    const deliveryLng = isValidCoordinate(buyerLocation?.latitude, buyerLocation?.longitude) ? Number(buyerLocation.longitude) : 72.8777
    const deliveryLocationObj = {
      address: deliveryAddress,
      latitude: deliveryLat,
      longitude: deliveryLng,
    }

    let lot = null
    let targetFarm = null
    let supplierUser = null

    if (batchId && mongoose.isValidObjectId(batchId)) {
      lot = await ProduceLot.findById(batchId).populate('farm').populate('farmer')
      if (lot) {
        targetFarm = lot.farm
        supplierUser = lot.farmer
      }
    }

    // Custom PO flow OR when batch is not a strict catalog lot
    if (isCustomPO || !lot) {
      const orderCrop = crop || lot?.category || 'Agricultural Produce'
      const pricePerUnit = Number(unitPrice ?? lot?.marketPrice ?? 50)
      const orderUnit = unit || lot?.unit || 'kg'
      const grade = qualityGrade || lot?.qualityGrade || 'Grade A'

      // 1. Resolve Supplier / Farmer User
      if (!supplierUser && farmerEmail) {
        supplierUser = await User.findOne({ email: farmerEmail.toLowerCase().trim() })
      }
      if (!supplierUser && farmerName) {
        supplierUser = await User.findOne({ name: new RegExp(`^${farmerName.trim()}$`, 'i'), role: 'farmer' })
      }
      if (!supplierUser) {
        supplierUser = await User.findOne({ role: 'farmer' })
      }
      if (!supplierUser) {
        supplierUser = await User.create({
          name: farmerName || 'Registered Farmer',
          email: farmerEmail || `farmer-${Date.now()}@rythusevak.local`,
          role: 'farmer',
          organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
          regionId: req.user.regionId || '507f1f77bcf86cd799439012',
        })
      }

      // 2. Resolve Farm
      if (!targetFarm && farmId && mongoose.isValidObjectId(farmId)) {
        targetFarm = await Farm.findById(farmId)
      }
      if (!targetFarm && farmName) {
        targetFarm = await Farm.findOne({ farmName: new RegExp(`^${farmName.trim()}$`, 'i') })
      }
      if (!targetFarm && supplierUser) {
        targetFarm = await Farm.findOne({ farmer: supplierUser._id })
      }

      // Determine pickup location coordinates
      let pickupLat = Number(pickupLocation?.latitude)
      let pickupLng = Number(pickupLocation?.longitude)
      if (!isValidCoordinate(pickupLat, pickupLng)) {
        if (targetFarm?.location?.latitude && targetFarm?.location?.longitude) {
          pickupLat = targetFarm.location.latitude
          pickupLng = targetFarm.location.longitude
        } else {
          pickupLat = 17.4321
          pickupLng = 78.5678
        }
      }

      const pickupAddress = pickupLocation?.address || targetFarm?.location?.address || `GPS: ${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)}`
      const pickupLocationObj = {
        address: pickupAddress,
        latitude: pickupLat,
        longitude: pickupLng,
      }

      if (!targetFarm) {
        targetFarm = await Farm.create({
          organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
          regionId: req.user.regionId || '507f1f77bcf86cd799439012',
          farmer: supplierUser._id,
          farmName: farmName || `${orderCrop} Farm Plot`,
          crops: [orderCrop],
          location: pickupLocationObj,
          boundary: {
            type: 'Polygon',
            coordinates: [[[pickupLng - 0.005, pickupLat - 0.005], [pickupLng + 0.005, pickupLat - 0.005], [pickupLng + 0.005, pickupLat + 0.005], [pickupLng - 0.005, pickupLat - 0.005]]],
          },
          areaSqMeters: 4046.86,
          areaAcres: 1,
          areaHectares: 0.4047,
          inspectionStatus: 'inspected',
        })
      }

      // 3. Resolve or create produce lot
      if (!lot) {
        lot = await ProduceLot.create({
          organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
          regionId: req.user.regionId || '507f1f77bcf86cd799439012',
          farmer: supplierUser._id,
          farm: targetFarm._id,
          category: orderCrop,
          quantity: requested,
          availableQuantity: 0,
          unit: orderUnit,
          marketPrice: pricePerUnit,
          qualityGrade: grade,
          status: 'allocated',
          statusHistory: [{ status: 'allocated', changedBy: req.user.userId, note: 'Direct Custom PO procurement' }],
        })
      } else {
        lot.availableQuantity = Math.max(0, (lot.availableQuantity || lot.quantity) - requested)
        if (lot.availableQuantity === 0) lot.status = 'allocated'
        await lot.save()
      }

      // 4. Create Purchase Order in MongoDB
      const totalAmount = requested * pricePerUnit
      const order = await PurchaseOrder.create({
        organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
        regionId: req.user.regionId || '507f1f77bcf86cd799439012',
        supplier: supplierUser._id,
        buyer: req.user.userId,
        farm: targetFarm._id,
        batch: lot._id,
        number: `ORD-${Date.now()}`,
        status: 'submitted',
        crop: orderCrop,
        quantity: requested,
        unit: orderUnit,
        unitPrice: pricePerUnit,
        totalAmount: totalAmount,
        buyerLocation: deliveryLocationObj,
        pickupLocation: pickupLocationObj,
        lines: [{ category: orderCrop, quantity: requested, unitPrice: pricePerUnit, allocatedLots: [{ lot: lot._id, quantity: requested }] }],
        history: [{ status: 'submitted', changedBy: req.user.userId, note: notes || 'Custom Purchase Order placed directly with producer' }],
      })

      // 5. Create Shipment for Logistics coordination
      const shipment = await Shipment.create({
        organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
        regionId: req.user.regionId || '507f1f77bcf86cd799439012',
        order: order._id,
        buyer: order.buyer,
        farmer: order.supplier,
        shipmentNumber: `SHP-${Date.now()}`,
        status: 'ready_for_pickup',
        lots: [{ lot: lot._id, quantity: requested }],
        pickupLocation: order.pickupLocation,
        destination: order.buyerLocation,
        qualityGrade: grade,
        history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from custom PO (Pending Logistics)' }],
      })
      order.shipment = shipment._id
      await order.save()

      const populatedOrder = await PurchaseOrder.findById(order._id)
        .populate('supplier', 'name email')
        .populate('buyer', 'name email')
        .populate('farm')
        .populate('batch')
        .populate('shipment')

      return res.status(201).json(populatedOrder)
    }

    // Standard Catalog Purchase
    if (lot.status !== 'accepted' || (lot.availableQuantity ?? lot.quantity) < requested) {
      return res.status(409).json({ message: 'Only inspected, available batches can be purchased with sufficient stock' })
    }

    let pickupLat = lot.farm?.location?.latitude
    let pickupLng = lot.farm?.location?.longitude
    if (!Number.isFinite(Number(pickupLat)) || !Number.isFinite(Number(pickupLng))) {
      const points = lot.farm?.boundary?.coordinates?.[0]
      if (Array.isArray(points) && points.length > 0) {
        const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
        pickupLng = sum[0] / points.length
        pickupLat = sum[1] / points.length
      } else {
        pickupLat = 17.4321
        pickupLng = 78.5678
      }
    }
    const rawAddress = lot.farm?.location?.address
    const pickupAddress = (rawAddress && !rawAddress.toLowerCase().includes('nashik') && rawAddress !== 'Farm Location')
      ? rawAddress
      : `GPS: ${Number(pickupLat).toFixed(4)}, ${Number(pickupLng).toFixed(4)}`
    const pickupLocationObj = { address: pickupAddress, latitude: Number(pickupLat), longitude: Number(pickupLng) }

    const order = await PurchaseOrder.create({
      organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
      regionId: req.user.regionId || '507f1f77bcf86cd799439012',
      supplier: lot.farmer?._id || lot.farmer,
      buyer: req.user.userId,
      farm: lot.farm._id,
      batch: lot._id,
      number: `ORD-${Date.now()}`,
      status: 'submitted',
      crop: lot.category,
      quantity: requested,
      unit: lot.unit,
      unitPrice: lot.marketPrice || 0,
      totalAmount: requested * (lot.marketPrice || 0),
      buyerLocation: deliveryLocationObj,
      pickupLocation: pickupLocationObj,
      lines: [{ category: lot.category, quantity: requested, unitPrice: lot.marketPrice || 0, allocatedLots: [{ lot: lot._id, quantity: requested }] }],
      history: [{ status: 'submitted', changedBy: req.user.userId, note: 'Buyer order created (Pending Logistics)' }],
    })

    lot.availableQuantity -= requested
    if (lot.availableQuantity === 0) lot.status = 'allocated'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.userId, note: `Purchased ${requested} ${lot.unit}` })
    await lot.save()

    const shipment = await Shipment.create({
      organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
      regionId: req.user.regionId || '507f1f77bcf86cd799439012',
      order: order._id,
      buyer: order.buyer,
      farmer: order.supplier,
      shipmentNumber: `SHP-${Date.now()}`,
      status: 'ready_for_pickup',
      lots: [{ lot: lot._id, quantity: requested }],
      pickupLocation: order.pickupLocation,
      destination: order.buyerLocation,
      qualityGrade: lot.qualityGrade,
      history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from buyer purchase (Pending Logistics)' }],
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
  } catch (error) {
    next(error)
  }
}

export async function getOrders(req, res, next) {
  try {
    const userId = req.user.userId || req.user.id
    const filter = req.user.role === 'buyer' ? { buyer: userId } : req.user.role === 'farmer' ? { supplier: userId } : {}
    const orders = await PurchaseOrder.find(filter)
      .populate('supplier', 'name email')
      .populate('buyer', 'name email')
      .populate('farm', 'farmName location boundary areaAcres')
      .populate('batch', 'category variety qualityGrade qualityRating')
      .populate('shipment')
      .sort({ createdAt: -1 })

    const sanitized = orders.map((ord) => {
      const obj = ord.toObject ? ord.toObject() : ord
      const rawPickup = obj.pickupLocation?.address || ''
      if (!rawPickup || rawPickup.toLowerCase().includes('nashik') || /^[\s,\-—_]+$/.test(rawPickup)) {
        const lat = obj.pickupLocation?.latitude ?? obj.farm?.location?.latitude ?? 17.4321
        const lng = obj.pickupLocation?.longitude ?? obj.farm?.location?.longitude ?? 78.5678
        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          obj.pickupLocation = { ...obj.pickupLocation, address: `GPS: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` }
        }
      }
      const rawBuyerLoc = obj.buyerLocation?.address || ''
      if (!rawBuyerLoc || rawBuyerLoc.toLowerCase().includes('nashik') || /^[\s,\-—_]+$/.test(rawBuyerLoc)) {
        const blat = obj.buyerLocation?.latitude ?? 19.0760
        const blng = obj.buyerLocation?.longitude ?? 72.8777
        obj.buyerLocation = { ...obj.buyerLocation, address: `Buyer Logistics Hub (GPS: ${Number(blat).toFixed(4)}, ${Number(blng).toFixed(4)})` }
      }
      return obj
    })

    res.json(sanitized)
  } catch (error) {
    next(error)
  }
}

export async function getShipments(req, res, next) {
  try {
    const shipments = await Shipment.find({})
      .populate('buyer', 'name email')
      .populate('farmer', 'name email')
      .populate({
        path: 'order',
        populate: [
          { path: 'farm', select: 'farmName location boundary areaAcres areaHectares crops' },
          { path: 'batch', select: 'category variety quantity availableQuantity unit qualityGrade qualityRating status' },
          { path: 'buyer', select: 'name email' },
          { path: 'supplier', select: 'name email' },
        ],
      })
      .sort({ createdAt: -1 })

    const sanitized = shipments.map((shp) => {
      const obj = shp.toObject ? shp.toObject() : shp
      const rawPickup = obj.pickupLocation?.address || ''
      if (!rawPickup || rawPickup.toLowerCase().includes('nashik') || /^[\s,\-—_]+$/.test(rawPickup)) {
        const lat = obj.pickupLocation?.latitude ?? obj.order?.farm?.location?.latitude ?? 17.4321
        const lng = obj.pickupLocation?.longitude ?? obj.order?.farm?.location?.longitude ?? 78.5678
        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          obj.pickupLocation = { ...obj.pickupLocation, address: `GPS: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` }
        }
      }
      const rawDest = obj.destination?.address || ''
      if (!rawDest || rawDest.toLowerCase().includes('nashik') || /^[\s,\-—_]+$/.test(rawDest)) {
        const dlat = obj.destination?.latitude ?? 19.0760
        const dlng = obj.destination?.longitude ?? 72.8777
        obj.destination = { ...obj.destination, address: `Buyer Logistics Hub (GPS: ${Number(dlat).toFixed(4)}, ${Number(dlng).toFixed(4)})` }
      }
      return obj
    })

    res.json(sanitized)
  } catch (error) {
    next(error)
  }
}

export async function createShipment(req, res, next) {
  try {
    const order = await PurchaseOrder.findOne(scopedFilter(req, { _id: req.body.orderId, status: 'submitted' }))
      .populate('batch')
      .populate('supplier')
      .populate('buyer')
    if (!order) return res.status(409).json({ message: 'Only a purchased order can be assigned for shipment' })
    if (order.shipment || (await Shipment.exists(scopedFilter(req, { order: order._id })))) {
      return res.status(409).json({ message: 'A shipment already exists for this order' })
    }
    const shipment = await Shipment.create({
      ...scopedFilter(req),
      order: order._id,
      buyer: order.buyer._id,
      farmer: order.supplier._id,
      shipmentNumber: `SHP-${Date.now()}`,
      status: 'ready_for_pickup',
      lots: [{ lot: order.batch._id, quantity: order.quantity }],
      pickupLocation: order.pickupLocation,
      destination: order.buyerLocation,
      qualityGrade: order.batch.qualityGrade,
      history: [{ status: 'ready_for_pickup', actor: req.user.userId, note: 'Shipment created from purchased order' }],
    })
    order.status = 'approved'
    order.shipment = shipment._id
    order.history.push({ status: 'approved', changedBy: req.user.userId, note: 'Shipment created' })
    await order.save()
    res.status(201).json(shipment)
  } catch (error) {
    next(error)
  }
}

export async function acceptShipmentOrder(req, res, next) {
  try {
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })

    const vehicleId = req.body.vehicleId || `VEH-${Math.floor(1000 + Math.random() * 9000)}`
    shipment.status = 'assigned'
    shipment.vehicle = vehicleId
    shipment.deliveryAgent = req.body.driverName || req.user.name || 'Logistics Fleet Driver'
    shipment.history.push({
      status: 'assigned',
      actor: req.user.userId,
      note: req.body.note || `Order accepted by Logistics Coordinator (${req.user.name || 'Coordinator'}). Vehicle: ${vehicleId}`,
    })
    await shipment.save()

    if (shipment.order) {
      await PurchaseOrder.findByIdAndUpdate(shipment.order, {
        status: 'approved',
        $push: { history: { status: 'approved', changedBy: req.user.userId, note: 'Logistics Coordinator accepted the order' } },
      })
    }

    const updated = await Shipment.findById(shipment._id)
      .populate('buyer', 'name email')
      .populate('farmer', 'name email')
      .populate({
        path: 'order',
        populate: [
          { path: 'farm', select: 'farmName location boundary areaAcres' },
          { path: 'batch', select: 'category variety quantity availableQuantity unit qualityGrade' },
          { path: 'buyer', select: 'name email' },
        ],
      })

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

export async function assignShipment(req, res, next) {
  try {
    if (!req.body.vehicleId) return res.status(400).json({ message: 'Vehicle is required' })
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    if (!['ready_for_pickup', 'created'].includes(shipment.status)) {
      return res.status(409).json({ message: 'Shipment is not ready for assignment' })
    }
    shipment.vehicle = req.body.vehicleId
    shipment.deliveryAgent = req.body.deliveryAgentId || undefined
    shipment.status = 'assigned'
    shipment.history.push({ status: 'assigned', actor: req.user.userId, note: req.body.note })
    await shipment.save()
    res.json(shipment)
  } catch (error) {
    next(error)
  }
}

export async function updateShipmentStatus(req, res, next) {
  try {
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })

    const newStatus = req.body.status
    shipment.status = newStatus
    if (newStatus === 'delivered') shipment.deliveredAt = new Date()
    shipment.history.push({ status: newStatus, actor: req.user.userId, note: req.body.note || `Status updated to ${newStatus}` })
    await shipment.save()

    if (newStatus === 'delivered' && shipment.order) {
      const order = await PurchaseOrder.findOne(scopedFilter(req, { _id: shipment.order })).populate('batch')
      if (order) {
        order.status = 'fulfilled'
        order.deliveryConfirmedAt = new Date()
        order.history.push({ status: 'fulfilled', changedBy: req.user.userId, note: 'Shipment marked as delivered' })
        await order.save()
        if (order.batch) {
          order.batch.status = 'delivered'
          order.batch.statusHistory.push({ status: 'delivered', changedBy: req.user.userId, note: 'Related shipment delivered to buyer' })
          await order.batch.save()
        }
      }
    }
    res.json(shipment)
  } catch (error) {
    next(error)
  }
}

export async function dispatchShipment(req, res, next) {
  try {
    const shipment = await Shipment.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!shipment) return res.status(404).json({ message: 'Shipment not found' })
    shipment.status = 'dispatched'
    shipment.history.push({ status: 'dispatched', actor: req.user.userId, note: req.body.note || 'Shipment dispatched' })
    await shipment.save()
    res.json(shipment)
  } catch (error) {
    next(error)
  }
}

export default {
  getPendingInspections,
  submitInspection,
  getAvailableBatches,
  createOrder,
  getOrders,
  getShipments,
  createShipment,
  acceptShipmentOrder,
  assignShipment,
  updateShipmentStatus,
  dispatchShipment,
}
