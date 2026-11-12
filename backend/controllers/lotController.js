import ProduceLot, { statuses } from '../models/ProduceLot.js'
import Farm from '../models/Farm.js'
import { scopedFilter } from '../middleware/rbac.js'

export async function getLots(req, res, next) {
  try {
    const ownership = req.user.role === 'farmer' ? { farmer: req.user.userId } : {}
    const lots = await ProduceLot.find(scopedFilter(req, ownership))
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres areaHectares')
      .sort({ createdAt: -1 })
    res.json(lots)
  } catch (error) {
    next(error)
  }
}

export async function createLot(req, res, next) {
  try {
    const { category, quantity, unit, farmer, farm } = req.body
    if (!category || !Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Category and positive quantity are required' })
    }
    const ownerId = req.user.role === 'farmer' ? req.user.userId : (farmer || req.user.userId)

    let targetFarm = null
    if (farm) {
      targetFarm = await Farm.findOne(scopedFilter(req, { _id: farm }))
    }
    if (!targetFarm) {
      targetFarm = await Farm.findOne(scopedFilter(req, { farmer: ownerId }))
    }
    if (!targetFarm) {
      targetFarm = await Farm.create({
        ...scopedFilter(req),
        farmer: ownerId,
        farmName: `${category} Farm`,
        crops: [category],
        location: { address: 'Nashik Agriculture Belt, MH', latitude: 19.9975, longitude: 73.7898 },
        boundary: {
          type: 'Polygon',
          coordinates: [[[73.785, 19.995], [73.795, 19.995], [73.795, 20.005], [73.785, 19.995]]],
        },
        areaSqMeters: 40468,
        areaAcres: 10,
        areaHectares: 4.0468,
      })
    }

    const lot = await ProduceLot.create({
      ...scopedFilter(req),
      category,
      quantity,
      availableQuantity: quantity,
      unit: unit || 'kg',
      cropHealth: req.body.cropHealth || 'Healthy',
      harvestDate: req.body.harvestDate || req.body.expectedHarvestDate || new Date(),
      marketPrice: req.body.marketPrice || 50,
      farmer: ownerId,
      farm: targetFarm._id,
      statusHistory: [{ status: 'created', changedBy: req.user.userId }],
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
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    lot.status = status
    if (qualityGrade) lot.qualityGrade = qualityGrade
    lot.statusHistory.push({ status, changedBy: req.user.userId, note })
    await lot.save()
    res.json(lot)
  } catch (error) {
    next(error)
  }
}

export async function inspectLot(req, res, next) {
  try {
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    const rawGrade = String(req.body.grade || 'A').toUpperCase()
    const cleanGrade = rawGrade.includes('B') ? 'B' : rawGrade.includes('C') ? 'C' : 'A'
    const rating = Number.isFinite(Number(req.body.rating)) ? Math.max(0, Math.min(5, Number(req.body.rating))) : 4.5
    const isAccepted = req.body.accepted !== undefined ? Boolean(req.body.accepted) : cleanGrade !== 'C'
    const finalGrade = isAccepted ? (cleanGrade === 'C' ? 'A' : cleanGrade) : 'C'
    const finalStatus = isAccepted ? 'accepted' : 'rejected'

    const measuredQuantity = Number(req.body.measuredQuantity ?? lot.quantity)
    if (!Number.isFinite(measuredQuantity) || measuredQuantity <= 0 || measuredQuantity > lot.quantity) {
      return res.status(400).json({ message: 'Measured quantity must be positive and cannot exceed lot quantity' })
    }

    lot.inspectionHistory.push({ inspector: req.user.userId, grade: finalGrade, rating, measuredQuantity, notes: req.body.notes })
    lot.qualityGrade = finalGrade
    lot.qualityRating = rating
    lot.availableQuantity = measuredQuantity
    lot.status = finalStatus
    lot.marketPrice = lot.marketPrice || 50
    lot.statusHistory.push({ status: finalStatus, changedBy: req.user.userId, note: 'Inspection completed' })
    await lot.save()
    res.json(await ProduceLot.findById(lot._id).populate('farmer', 'name email').populate('farm', 'farmName location areaAcres'))
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

