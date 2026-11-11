import { Router } from 'express'
import {
  getLots,
  createLot,
  updateLotStatus,
  inspectLot,
} from '../controllers/lotController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()

router.use(requireAuth)

router.get('/', getLots)
router.post('/', requireRole('farmer', 'admin', 'platform_admin'), createLot)
router.patch('/:id/status', requireRole('admin', 'regional_manager', 'org_manager', 'operator'), updateLotStatus)
router.post('/:id/inspection', requireRole('admin', 'platform_admin', 'quality_inspector'), inspectLot)

export default router
