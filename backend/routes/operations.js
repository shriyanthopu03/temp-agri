import { Router } from 'express'
import {
  getOperationsByModule,
  createOperationsRecord,
  updateOperationsStatus,
  deleteOperationsRecord,
} from '../controllers/operationsController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const managers = requireRole('admin', 'regional_manager', 'org_manager', 'operator')

router.get('/:module', getOperationsByModule)
router.post('/:module', managers, createOperationsRecord)
router.patch('/:module/:id/status', managers, updateOperationsStatus)
router.delete('/:module/:id', managers, deleteOperationsRecord)

export default router
