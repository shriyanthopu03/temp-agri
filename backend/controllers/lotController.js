import ProduceLot, { statuses } from '../models/ProduceLot.js'
import Farm from '../models/Farm.js'
import { scopedFilter } from '../middleware/rbac.js'

export async function getLots(req, res, next) {
  try {
    const isFarmer = req.user.role === 'farmer'
    const userId = req.user.userId || req.user.id
    const filter = isFarmer ? { farmer: userId } : {}
    const lots = await ProduceLot.find(filter)
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres areaHectares crops')
      .sort({ createdAt: -1 })
    res.json(lots)
  } catch (error) {
    next(error)
  }
}

export async function createLot(req, res, next) {
  try {
    const { category, quantity, unit, farmer, farm } = req.body
    if (!category || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Category and positive quantity are required' })
    }
    const userId = req.user.userId || req.user.id
    const ownerId = req.user.role === 'farmer' ? userId : (farmer || userId)

    let targetFarm = null
    if (farm) {
      targetFarm = await Farm.findOne({ _id: farm })
    }
    if (!targetFarm) {
      targetFarm = await Farm.findOne({ farmer: ownerId })
    }
    if (!targetFarm) {
      targetFarm = await Farm.create({
        organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
        regionId: req.user.regionId || '507f1f77bcf86cd799439012',
        farmer: ownerId,
        farmName: `${category} Farm`,
        crops: [category],
        location: { address: 'Nashik Agriculture Belt, Maharashtra', latitude: 19.9975, longitude: 73.7898 },
        boundary: {
          type: 'Polygon',
          coordinates: [[[73.785, 19.995], [73.795, 19.995], [73.795, 20.005], [73.785, 19.995]]],
        },
        areaSqMeters: 40468,
        areaAcres: 10,
        areaHectares: 4.0468,
      })
    }

    const numQty = Number(quantity)
    const lot = await ProduceLot.create({
      organizationId: req.user.organizationId || '507f1f77bcf86cd799439011',
      regionId: req.user.regionId || '507f1f77bcf86cd799439012',
      category,
      quantity: numQty,
      availableQuantity: numQty,
      unit: unit || 'kg',
      cropHealth: req.body.cropHealth || 'Healthy',
      harvestDate: req.body.harvestDate || req.body.expectedHarvestDate || new Date(),
      marketPrice: req.body.marketPrice || 50,
      farmer: ownerId,
      farm: targetFarm._id,
      statusHistory: [{ status: 'created', changedBy: userId, note: 'Harvest lot created' }],
    })
    const populated = await ProduceLot.findById(lot._id)
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location boundary areaAcres')
    res.status(201).json(populated)
  } catch (error) {
    next(error)
  }
}

export async function updateLotStatus(req, res, next) {
  try {
    const { status, note, qualityGrade } = req.body
    if (!statuses.includes(status)) return res.status(400).json({ message: 'Invalid lot status' })
    const lot = await ProduceLot.findById(req.params.id)
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    lot.status = status
    if (qualityGrade) lot.qualityGrade = qualityGrade
    const userId = req.user.userId || req.user.id
    lot.statusHistory.push({ status, changedBy: userId, note })
    await lot.save()
    res.json(lot)
  } catch (error) {
    next(error)
  }
}

export async function inspectLot(req, res, next) {
  try {
    const lot = await ProduceLot.findById(req.params.id)
    if (!lot) return res.status(404).json({ message: 'Lot not found' })

    const rawGrade = String(req.body.grade || 'A').toUpperCase()
    const cleanLetter = rawGrade.includes('B') ? 'B' : rawGrade.includes('C') ? 'C' : rawGrade.includes('D') ? 'D' : 'A'
    const finalGrade = `Grade ${cleanLetter}`
    const rating = Number.isFinite(Number(req.body.rating)) ? Math.max(0, Math.min(5, Number(req.body.rating))) : 4.5
    const isAccepted = req.body.accepted !== undefined ? Boolean(req.body.accepted) : cleanLetter !== 'D' && cleanLetter !== 'C'
    const finalStatus = isAccepted ? 'accepted' : 'rejected'

    const measuredQuantity = Number(req.body.measuredQuantity ?? lot.quantity)
    const validMeasured = Number.isFinite(measuredQuantity) && measuredQuantity > 0 ? measuredQuantity : lot.quantity

    const userId = req.user.userId || req.user.id
    lot.inspectionHistory.push({
      inspector: userId,
      grade: finalGrade,
      rating,
      measuredQuantity: validMeasured,
      notes: req.body.notes || req.body.remarks || 'Inspection completed',
    })
    lot.qualityGrade = finalGrade
    lot.qualityRating = rating
    lot.availableQuantity = isAccepted ? validMeasured : 0
    lot.status = finalStatus
    lot.marketPrice = lot.marketPrice || 50
    lot.statusHistory.push({ status: finalStatus, changedBy: userId, note: `Quality inspection completed: ${finalGrade} (${finalStatus})` })
    await lot.save()

    if (lot.farm) {
      await Farm.findByIdAndUpdate(lot.farm, { inspectionStatus: 'inspected' }).catch(() => undefined)
    }

    const populated = await ProduceLot.findById(lot._id)
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres crops')
    res.json(populated)
  } catch (error) {
    next(error)
  }
}

export default {
  getLots,
  createLot,
  updateLotStatus,
  inspectLot,
}

