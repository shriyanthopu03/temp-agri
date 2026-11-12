import Farm from '../models/Farm.js'
import ProduceLot from '../models/ProduceLot.js'
import { scopedFilter } from '../middleware/rbac.js'
import { validateBoundary } from '../utils/geo.js'

export async function getMyFarms(req, res, next) {
  try {
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const filter = isAdmin ? {} : { farmer: userId }
    const farms = await Farm.find(filter).sort({ createdAt: -1 })
    res.json(farms)
  } catch (error) {
    next(error)
  }
}

export async function createFarm(req, res, next) {
  try {
    const { coordinates, sqm } = validateBoundary(req.body.coordinates)
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const farmerId = isAdmin ? (req.body.farmerId || userId) : userId
    const pts = coordinates[0] || []
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    const computedLng = pts.length ? sum[0] / pts.length : 78.9629
    const computedLat = pts.length ? sum[1] / pts.length : 20.5937
    const locationObj = {
      address: req.body.location?.address || (pts.length ? `GPS: ${computedLat.toFixed(4)}, ${computedLng.toFixed(4)}` : 'Registered Farm Land'),
      latitude: Number(req.body.location?.latitude || computedLat),
      longitude: Number(req.body.location?.longitude || computedLng),
    }

    const cropsArray = Array.isArray(req.body.crops)
      ? req.body.crops
      : req.body.crop
        ? [req.body.crop]
        : ['Produce']

    const farm = await Farm.create({
      organizationId: req.user.organizationId || req.body.organizationId || '507f1f77bcf86cd799439011',
      regionId: req.user.regionId || req.body.regionId || '507f1f77bcf86cd799439012',
      farmer: farmerId,
      farmName: req.body.farmName || req.body.name || 'My Farm',
      crops: cropsArray,
      cropHealth: req.body.cropHealth || 'Healthy',
      expectedHarvestDate: req.body.expectedHarvestDate ? new Date(req.body.expectedHarvestDate) : undefined,
      expectedQuantity: Number(req.body.expectedQuantity || 0),
      inspectionStatus: 'not_requested',
      location: locationObj,
      boundary: { type: 'Polygon', coordinates },
      areaSqMeters: sqm,
      areaAcres: sqm / 4046.8564224,
      areaHectares: sqm / 10000,
    })
    res.status(201).json(farm)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export async function getFarmById(req, res, next) {
  try {
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const ownership = isAdmin ? {} : { farmer: userId }
    const farm = await Farm.findOne({ _id: req.params.id, ...ownership })
    if (!farm) return res.status(404).json({ message: 'Farm not found' })
    res.json(farm)
  } catch (error) {
    next(error)
  }
}

export async function updateFarm(req, res, next) {
  try {
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const ownership = isAdmin ? {} : { farmer: userId }

    const updateFields = {}
    if (req.body.farmName || req.body.name) updateFields.farmName = req.body.farmName || req.body.name
    if (req.body.crops || req.body.crop) {
      updateFields.crops = Array.isArray(req.body.crops) ? req.body.crops : [req.body.crop || req.body.crops]
    }
    if (req.body.cropHealth) updateFields.cropHealth = req.body.cropHealth
    if (req.body.expectedHarvestDate) updateFields.expectedHarvestDate = new Date(req.body.expectedHarvestDate)
    if (req.body.expectedQuantity !== undefined) updateFields.expectedQuantity = Number(req.body.expectedQuantity)
    if (req.body.coordinates) {
      const { coordinates, sqm } = validateBoundary(req.body.coordinates)
      updateFields.boundary = { type: 'Polygon', coordinates }
      updateFields.areaSqMeters = sqm
      updateFields.areaAcres = sqm / 4046.8564224
      updateFields.areaHectares = sqm / 10000
    }
    if (req.body.location) updateFields.location = req.body.location

    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, ...ownership },
      updateFields,
      { new: true, runValidators: true }
    )
    if (!farm) return res.status(404).json({ message: 'Farm not found' })
    res.json(farm)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export async function deleteFarm(req, res, next) {
  try {
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const ownership = isAdmin ? {} : { farmer: userId }
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, ...ownership })
    if (!farm) return res.status(404).json({ message: 'Farm not found' })
    res.json({ message: 'Farm deleted successfully' })
  } catch (error) {
    next(error)
  }
}

export async function requestQualityInspection(req, res, next) {
  try {
    const isAdmin = ['admin', 'platform_admin'].includes(req.user.role)
    const userId = req.user.userId || req.user.id
    const ownership = isAdmin ? {} : { farmer: userId }
    const farm = await Farm.findOne({ _id: req.params.id, ...ownership })
    if (!farm) return res.status(404).json({ message: 'Farm not found' })

    const cropName = farm.crops?.[0] || req.body.crop || 'Produce Harvest'
    const qty = Number(req.body.quantity || farm.expectedQuantity || 1000)

    const lot = await ProduceLot.create({
      organizationId: farm.organizationId || req.user.organizationId || '507f1f77bcf86cd799439011',
      regionId: farm.regionId || req.user.regionId || '507f1f77bcf86cd799439012',
      farmer: farm.farmer,
      farm: farm._id,
      category: cropName,
      cropHealth: farm.cropHealth || req.body.cropHealth || 'Healthy',
      harvestDate: farm.expectedHarvestDate || req.body.harvestDate || new Date(),
      quantity: qty,
      availableQuantity: qty,
      unit: req.body.unit || 'kg',
      marketPrice: req.body.marketPrice || 55,
      status: 'created',
      statusHistory: [{ status: 'created', changedBy: userId, note: 'Farmer submitted Quality Inspection request' }],
    })

    farm.inspectionStatus = 'pending'
    await farm.save()

    const populatedLot = await ProduceLot.findById(lot._id)
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location boundary areaAcres crops cropHealth expectedHarvestDate')

    res.status(201).json({ farm, lot: populatedLot })
  } catch (error) {
    next(error)
  }
}

export default {
  getMyFarms,
  createFarm,
  getFarmById,
  updateFarm,
  deleteFarm,
  requestQualityInspection,
}
