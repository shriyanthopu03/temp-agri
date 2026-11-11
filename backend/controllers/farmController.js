import Farm from '../models/Farm.js'
import { scopedFilter } from '../middleware/rbac.js'
import { validateBoundary } from '../utils/geo.js'

export async function getMyFarms(req, res, next) {
  try {
    const ownership = req.user.role === 'admin' ? {} : { farmer: req.user.userId }
    const farms = await Farm.find(scopedFilter(req, ownership)).sort({ createdAt: -1 })
    res.json(farms)
  } catch (error) {
    next(error)
  }
}

export async function createFarm(req, res, next) {
  try {
    const { coordinates, sqm } = validateBoundary(req.body.coordinates)
    const farmerId = req.user.role === 'admin' ? (req.body.farmerId || req.user.userId) : req.user.userId
    const pts = coordinates[0] || []
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    const computedLng = pts.length ? sum[0] / pts.length : 78.9629
    const computedLat = pts.length ? sum[1] / pts.length : 20.5937
    const locationObj = {
      address: req.body.location?.address || 'Farm Parcel Location',
      latitude: Number(req.body.location?.latitude || computedLat),
      longitude: Number(req.body.location?.longitude || computedLng),
    }
    const farm = await Farm.create({
      ...scopedFilter(req),
      farmer: farmerId,
      farmName: req.body.farmName,
      crops: req.body.crops || [],
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
    const ownership = req.user.role === 'admin' ? {} : { farmer: req.user.userId }
    const farm = await Farm.findOne(scopedFilter(req, { _id: req.params.id, ...ownership }))
    if (!farm) return res.status(404).json({ message: 'Farm not found' })
    res.json(farm)
  } catch (error) {
    next(error)
  }
}

export async function updateFarm(req, res, next) {
  try {
    const { coordinates, sqm } = validateBoundary(req.body.coordinates)
    const ownership = req.user.role === 'admin' ? {} : { farmer: req.user.userId }
    const pts = coordinates[0] || []
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    const computedLng = pts.length ? sum[0] / pts.length : 78.9629
    const computedLat = pts.length ? sum[1] / pts.length : 20.5937
    const locationObj = {
      address: req.body.location?.address || 'Farm Parcel Location',
      latitude: Number(req.body.location?.latitude || computedLat),
      longitude: Number(req.body.location?.longitude || computedLng),
    }
    const farm = await Farm.findOneAndUpdate(
      scopedFilter(req, { _id: req.params.id, ...ownership }),
      {
        farmName: req.body.farmName,
        crops: req.body.crops || [],
        location: locationObj,
        boundary: { type: 'Polygon', coordinates },
        areaSqMeters: sqm,
        areaAcres: sqm / 4046.8564224,
        areaHectares: sqm / 10000,
      },
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
    const ownership = req.user.role === 'admin' ? {} : { farmer: req.user.userId }
    const farm = await Farm.findOneAndDelete(scopedFilter(req, { _id: req.params.id, ...ownership }))
    if (!farm) return res.status(404).json({ message: 'Farm not found' })
    res.json({ message: 'Farm deleted successfully' })
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
}
