import { Router } from 'express'
import {
  getAuditEvents,
  exportAuditEvents,
  getAuditReport,
} from '../controllers/auditController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const auditors = requireRole('admin', 'platform_admin', 'regional_manager', 'org_manager')

router.get('/', auditors, getAuditEvents)
router.get('/export', auditors, exportAuditEvents)
router.get('/report', auditors, getAuditReport)

export default router
