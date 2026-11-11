import PurchaseOrder from '../models/PurchaseOrder.js'
import Warehouse from '../models/Warehouse.js'
import Shipment from '../models/Shipment.js'
import Settlement from '../models/Settlement.js'
import Dispute from '../models/Dispute.js'
import { scopedFilter } from '../middleware/rbac.js'

const resources = {
  'purchase-orders': PurchaseOrder,
  warehouses: Warehouse,
  shipments: Shipment,
  settlements: Settlement,
  disputes: Dispute,
}

function getModel(resource, response) {
  const Model = resources[resource]
  if (!Model) response.status(404).json({ message: 'Unsupported enterprise resource' })
  return Model
}

export async function listResource(request, response, next) {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const query = { ...scopedFilter(request) }
    if (request.query.status) query.status = request.query.status
    if (request.query.search) {
      query.$or = [{ name: new RegExp(request.query.search, 'i') }, { reference: new RegExp(request.query.search, 'i') }]
    }
    response.json(await Model.find(query).sort({ updatedAt: -1 }).limit(250))
  } catch (error) {
    next(error)
  }
}

export async function getResourceById(request, response, next) {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.findOne(scopedFilter(request, { _id: request.params.id }))
    if (!record) return response.status(404).json({ message: 'Record not found' })
    response.json(record)
  } catch (error) {
    next(error)
  }
}

export async function createResource(request, response, next) {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.create({ ...request.body, ...scopedFilter(request) })
    response.status(201).json(record)
  } catch (error) {
    next(error)
  }
}

export async function updateResource(request, response, next) {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const record = await Model.findOneAndUpdate(
      scopedFilter(request, { _id: request.params.id }),
      request.body,
      { new: true, runValidators: true }
    )
    if (!record) return response.status(404).json({ message: 'Record not found' })
    response.json(record)
  } catch (error) {
    next(error)
  }
}

export async function deleteResource(request, response, next) {
  try {
    const Model = getModel(request.params.resource, response)
    if (!Model) return
    const result = await Model.deleteOne(scopedFilter(request, { _id: request.params.id }))
    if (!result.deletedCount) return response.status(404).json({ message: 'Record not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
}

export default {
  listResource,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
}

