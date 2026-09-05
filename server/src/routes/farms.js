import express from 'express'
import { polygon } from '@turf/helpers'
import { area } from '@turf/area'
import Farm from '../models/Farm.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const toGeoJson = (coordinates) => coordinates.map(([latitude, longitude]) => [longitude, latitude])
function validateBoundary(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 3) throw new Error('At least three boundary points are required')
  const open = coordinates.map(([lat, lng]) => [lng, lat])
  const closed = [...open, open[0]]
  for (const [lng, lat] of closed) if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error('Coordinates are invalid')
  const sqm = area(polygon([closed]))
  if (!sqm) throw new Error('Boundary area must be positive')
  return { coordinates: [closed], sqm }
}

router.use(requireAuth)
router.get('/my-farms', async (req, res) => res.json(await Farm.find({ farmer: req.user.id }).sort({ createdAt: -1 })))
router.post('/', async (req, res) => {
  try { const { coordinates, sqm } = validateBoundary(req.body.coordinates); const farm = await Farm.create({ farmer: req.user.id, farmName: req.body.farmName, crops: req.body.crops || [], location: req.body.location || {}, boundary: { type: 'Polygon', coordinates }, areaSqMeters: sqm, areaAcres: sqm / 4046.8564224, areaHectares: sqm / 10000 }); res.status(201).json(farm) } catch (error) { res.status(400).json({ message: error.message }) }
})
router.get('/:id', async (req, res) => { const farm = await Farm.findOne({ _id: req.params.id, farmer: req.user.id }); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.json(farm) })
router.put('/:id', async (req, res) => { try { const { coordinates, sqm } = validateBoundary(req.body.coordinates); const farm = await Farm.findOneAndUpdate({ _id: req.params.id, farmer: req.user.id }, { farmName: req.body.farmName, crops: req.body.crops || [], location: req.body.location || {}, boundary: { type: 'Polygon', coordinates }, areaSqMeters: sqm, areaAcres: sqm / 4046.8564224, areaHectares: sqm / 10000 }, { new: true, runValidators: true }); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.json(farm) } catch (error) { res.status(400).json({ message: error.message }) } })
router.delete('/:id', async (req, res) => { const farm = await Farm.findOneAndDelete({ _id: req.params.id, farmer: req.user.id }); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.status(204).end() })
export default router
