import express from 'express'
import { area, polygon } from '@turf/turf'
import Farm from '../models/Farm.js'
import { requireAuth } from '../middleware/auth.js'
import { scopedFilter } from '../middleware/rbac.js'

const router = express.Router()
function validateBoundary(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 3) throw new Error('At least three boundary points are required')
  const open = coordinates.map((point) => {
    if (!Array.isArray(point) || point.length !== 2) throw new Error('Coordinates are invalid')
    const [lng, lat] = point
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error('Coordinates are invalid')
    return [lng, lat]
  })
  const closed = [...open, open[0]]
  const sqm = area(polygon([closed]))
  if (!sqm) throw new Error('Boundary area must be positive')
  return { coordinates: [closed], sqm }
}

router.use(requireAuth)
router.get('/my-farms', async (req, res) => res.json(await Farm.find(scopedFilter(req, { farmer: req.user.id })).sort({ createdAt: -1 })))
router.post('/', async (req, res) => {
  try { const { coordinates, sqm } = validateBoundary(req.body.coordinates); const farm = await Farm.create({ ...scopedFilter(req), farmer: req.user.id, farmName: req.body.farmName, crops: req.body.crops || [], location: req.body.location || {}, boundary: { type: 'Polygon', coordinates }, areaSqMeters: sqm, areaAcres: sqm / 4046.8564224, areaHectares: sqm / 10000 }); res.status(201).json(farm) } catch (error) { res.status(400).json({ message: error.message }) }
})
router.get('/:id', async (req, res) => { const farm = await Farm.findOne(scopedFilter(req, { _id: req.params.id, farmer: req.user.id })); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.json(farm) })
router.put('/:id', async (req, res) => { try { const { coordinates, sqm } = validateBoundary(req.body.coordinates); const farm = await Farm.findOneAndUpdate(scopedFilter(req, { _id: req.params.id, farmer: req.user.id }), { farmName: req.body.farmName, crops: req.body.crops || [], location: req.body.location || {}, boundary: { type: 'Polygon', coordinates }, areaSqMeters: sqm, areaAcres: sqm / 4046.8564224, areaHectares: sqm / 10000 }, { new: true, runValidators: true }); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.json(farm) } catch (error) { res.status(400).json({ message: error.message }) } })
router.delete('/:id', async (req, res) => { const farm = await Farm.findOneAndDelete(scopedFilter(req, { _id: req.params.id, farmer: req.user.id })); if (!farm) return res.status(404).json({ message: 'Farm not found' }); res.status(204).end() })
export default router
