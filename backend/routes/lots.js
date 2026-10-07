import { Router } from 'express'
import ProduceLot, { statuses } from '../models/ProduceLot.js'
import Farm from '../models/Farm.js'
import { requireAuth } from '../middleware/auth.js'
import { scopedFilter, requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const ownership = req.user.role === 'farmer' ? { farmer: req.user.userId } : {}
    res.json(await ProduceLot.find(scopedFilter(req, ownership))
      .populate('farmer', 'name email')
      .populate('farm', 'farmName location areaAcres areaHectares')
      .sort({ createdAt: -1 }))
  } catch (error) { next(error) }
})

router.post('/', requireRole('farmer', 'admin', 'platform_admin'), async (req, res, next) => {
  try {
    const { category, quantity, unit, farmer, farm } = req.body
    if (!category || !Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Category and positive quantity are required' })
    const ownerId = req.user.role === 'farmer' ? req.user.userId : farmer
    if (!ownerId) return res.status(400).json({ message: 'farmer is required for admin batch creation' })
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
    const rawGrade = String(req.body.grade || 'A').toUpperCase()
    const cleanGrade = rawGrade.includes('B') ? 'B' : rawGrade.includes('C') ? 'C' : 'A'
    const rating = Number.isFinite(Number(req.body.rating)) ? Math.max(0, Math.min(5, Number(req.body.rating))) : 4.5
    const isAccepted = req.body.accepted !== undefined ? Boolean(req.body.accepted) : cleanGrade !== 'C'
    const finalGrade = isAccepted ? (cleanGrade === 'C' ? 'A' : cleanGrade) : 'C'
    const finalStatus = isAccepted ? 'accepted' : 'rejected'

    const measuredQuantity = Number(req.body.measuredQuantity ?? lot.quantity)
    if (!Number.isFinite(measuredQuantity) || measuredQuantity <= 0 || measuredQuantity > lot.quantity) return res.status(400).json({ message: 'Measured quantity must be positive and cannot exceed lot quantity' })

    lot.inspectionHistory.push({ inspector: req.user.userId, grade: finalGrade, rating, measuredQuantity, notes: req.body.notes })
    lot.qualityGrade = finalGrade
    lot.qualityRating = rating
    lot.availableQuantity = measuredQuantity
    lot.status = finalStatus
    lot.marketPrice = lot.marketPrice || 50
    lot.statusHistory.push({ status: finalStatus, changedBy: req.user.userId, note: 'Inspection completed' })
    await lot.save()
    res.json(await ProduceLot.findById(lot._id).populate('farmer', 'name email').populate('farm', 'farmName location areaAcres'))
  } catch (error) { next(error) }
})

export default router
