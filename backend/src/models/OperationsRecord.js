import mongoose from 'mongoose'

const modules = ['produce-categories', 'purchase-orders', 'warehouses', 'shipments', 'vehicles', 'settlements', 'disputes']
const operationsRecordSchema = new mongoose.Schema({
  module: { type: String, enum: modules, required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true, trim: true },
  status: { type: String, default: 'draft', index: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  history: [{ action: String, changedBy: mongoose.Schema.Types.ObjectId, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export { modules }
export default mongoose.model('OperationsRecord', operationsRecordSchema)
