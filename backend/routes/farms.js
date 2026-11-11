import { Router } from 'express'
import {
  getMyFarms,
  createFarm,
  getFarmById,
  updateFarm,
  deleteFarm,
  requestQualityInspection,
} from '../controllers/farmController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()

router.use(requireAuth)

router.get('/my-farms', getMyFarms)
router.post('/', requireRole('farmer', 'admin', 'platform_admin'), createFarm)
router.get('/:id', getFarmById)
router.put('/:id', requireRole('farmer', 'admin', 'platform_admin'), updateFarm)
router.delete('/:id', requireRole('farmer', 'admin', 'platform_admin'), deleteFarm)
router.post('/:id/request-inspection', requireRole('farmer', 'admin', 'platform_admin'), requestQualityInspection)

export default router
