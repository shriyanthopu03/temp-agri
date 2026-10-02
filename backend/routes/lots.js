import { Router } from 'express'
import ProduceLot, { statuses } from '../models/ProduceLot.js'
import Farm from '../models/Farm.js'
import { requireAuth } from '../middleware/auth.js'
import { scopedFilter, requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try { res.json(await ProduceLot.find(scopedFilter(req)).sort({ createdAt: -1 })) } catch (error) { next(error) }
})

router.post('/', requireRole('farmer', 'admin', 'platform_admin'), async (req, res, next) => {
  try {
    const { category, quantity, unit, farmer, farm } = req.body
    if (!category || !farmer || !Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Category, farmer, and positive quantity are required' })
    const ownerId = req.user.role === 'farmer' ? req.user.userId : farmer
    if (!farm) return res.status(400).json({ message: 'Farm is required for a harvest batch' })
    const ownedFarm = await Farm.findOne(scopedFilter(req, { _id: farm, farmer: ownerId }))
    if (!ownedFarm) return res.status(403).json({ message: 'The selected farm is not owned by the batch farmer' })
    const lot = await ProduceLot.create({ ...scopedFilter(req), category, quantity, availableQuantity: quantity, unit, farmer: ownerId, farm, statusHistory: [{ status: 'created', changedBy: req.user.userId }] })
    res.status(201).json(lot)
  } catch (error) { next(error) }
})

router.patch('/:id/status', requireRole('admin', 'regional_manager', 'org_manager', 'operator'), async (req, res, next) => {
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
  } catch (error) { next(error) }
})

router.post('/:id/inspection', requireRole('admin', 'platform_admin', 'quality_inspector'), async (req, res, next) => {
  try {
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    if (!['created', 'received'].includes(lot.status)) return res.status(409).json({ message: 'Lot is not waiting for inspection' })
    if (!['A', 'B', 'C'].includes(req.body.grade) || !Number.isFinite(Number(req.body.rating)) || Number(req.body.rating) < 0 || Number(req.body.rating) > 5) return res.status(400).json({ message: 'Grade must be A, B, or C and rating must be between 0 and 5' })
    lot.inspectionHistory.push({ inspector: req.user.userId, grade: req.body.grade, rating: req.body.rating, measuredQuantity: req.body.measuredQuantity, notes: req.body.notes })
    lot.qualityGrade = req.body.grade
    lot.qualityRating = req.body.rating
    lot.availableQuantity = req.body.measuredQuantity || lot.quantity
    lot.status = req.body.accepted ? 'accepted' : 'rejected'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.userId, note: 'Inspection completed' })
    await lot.save()
    res.json(lot)
  } catch (error) { next(error) }
})

export default router
