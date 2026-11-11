import { Router } from 'express'
import {
  listResource,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
} from '../controllers/enterpriseController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const managers = requireRole('admin', 'regional_manager', 'org_manager', 'operator')
const editors = requireRole('admin', 'regional_manager', 'org_manager')

router.get('/:resource', listResource)
router.get('/:resource/:id', getResourceById)
router.post('/:resource', managers, createResource)
router.put('/:resource/:id', editors, updateResource)
router.patch('/:resource/:id', editors, updateResource)
router.delete('/:resource/:id', editors, deleteResource)

export default router
