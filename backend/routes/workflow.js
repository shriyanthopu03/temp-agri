import { Router } from 'express'
import {
  getPendingInspections,
  submitInspection,
  getAvailableBatches,
  createOrder,
  getOrders,
  getShipments,
  createShipment,
  acceptShipmentOrder,
  assignShipment,
  updateShipmentStatus,
  dispatchShipment,
} from '../controllers/workflowController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/rbac.js'

const router = Router()
router.use(requireAuth)

const inspectors = requireRole('admin', 'platform_admin', 'quality_inspector')
const buyers = requireRole('admin', 'platform_admin', 'buyer')
const logistics = requireRole('admin', 'platform_admin', 'logistics_coordinator')
const orderViewers = requireRole('admin', 'platform_admin', 'buyer', 'farmer', 'logistics_coordinator')

router.get('/inspections/pending', inspectors, getPendingInspections)
router.get('/pending-inspections', inspectors, getPendingInspections)
router.post('/inspections', inspectors, submitInspection)
router.get('/available-batches', buyers, getAvailableBatches)
router.post('/orders', buyers, createOrder)
router.get('/orders', orderViewers, getOrders)
router.get('/shipments', logistics, getShipments)
router.post('/shipments', logistics, createShipment)
router.put('/shipments/:id/accept', logistics, acceptShipmentOrder)
router.put('/shipments/:id/assign', logistics, assignShipment)
router.put('/shipments/:id/status', logistics, updateShipmentStatus)
router.put('/shipments/:id/dispatch', logistics, dispatchShipment)

export default router
