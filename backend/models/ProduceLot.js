import mongoose from 'mongoose'

const statuses = ['created', 'received', 'inspected', 'accepted', 'rejected', 'stored', 'allocated', 'dispatched', 'delivered']
const produceLotSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  category: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['kg', 'tonne', 'crate'], default: 'kg' },
  status: { type: String, enum: statuses, default: 'created', index: true },
  qualityGrade: String,
  inspectionHistory: [{ inspector: mongoose.Schema.Types.ObjectId, grade: String, notes: String, inspectedAt: { type: Date, default: Date.now } }],
  statusHistory: [{ status: String, changedBy: mongoose.Schema.Types.ObjectId, changedAt: { type: Date, default: Date.now }, note: String }]
}, { timestamps: true })

export { statuses }
export default mongoose.model('ProduceLot', produceLotSchema)
