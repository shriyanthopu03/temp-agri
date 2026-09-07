import { Router } from 'express'
import ProduceLot, { statuses } from '../models/ProduceLot.js'
import { requireAuth } from '../middleware/auth.js'
import { scopedFilter, requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try { res.json(await ProduceLot.find(scopedFilter(req)).sort({ createdAt: -1 })) } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    const { category, quantity, unit, farmer, farm } = req.body
    if (!category || !farmer || !Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Category, farmer, and positive quantity are required' })
    const lot = await ProduceLot.create({ ...scopedFilter(req), category, quantity, unit, farmer, farm, statusHistory: [{ status: 'created', changedBy: req.user.id }] })
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
    lot.statusHistory.push({ status, changedBy: req.user.id, note })
    await lot.save()
    res.json(lot)
  } catch (error) { next(error) }
})

router.post('/:id/inspection', requireRole('admin', 'regional_manager', 'org_manager', 'operator'), async (req, res, next) => {
  try {
    const lot = await ProduceLot.findOne(scopedFilter(req, { _id: req.params.id }))
    if (!lot) return res.status(404).json({ message: 'Lot not found' })
    lot.inspectionHistory.push({ inspector: req.user.id, grade: req.body.grade, notes: req.body.notes })
    lot.qualityGrade = req.body.grade
    lot.status = req.body.accepted ? 'accepted' : 'rejected'
    lot.statusHistory.push({ status: lot.status, changedBy: req.user.id, note: 'Inspection completed' })
    await lot.save()
    res.json(lot)
  } catch (error) { next(error) }
})

export default router
