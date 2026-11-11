import { Router } from 'express'
import {
  getAuditEvents,
  exportAuditEvents,
  getAuditReport,
  getAdminStats,
} from '../controllers/auditController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const auditors = requireRole('admin', 'platform_admin', 'regional_manager', 'org_manager')

router.get('/', auditors, getAuditEvents)
router.get('/export', auditors, exportAuditEvents)
router.get('/report', auditors, getAuditReport)
router.get('/admin-stats', auditors, getAdminStats)

export default router
