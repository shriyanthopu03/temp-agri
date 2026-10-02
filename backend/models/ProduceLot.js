import mongoose from 'mongoose'

const statuses = ['created', 'received', 'inspected', 'accepted', 'rejected', 'stored', 'allocated', 'dispatched', 'delivered']
const produceLotSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  category: { type: String, required: true, trim: true },
  variety: { type: String, trim: true },
  cropHealth: { type: String, trim: true },
  harvestDate: Date,
  marketPrice: { type: Number, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  availableQuantity: { type: Number, min: 0 },
  unit: { type: String, enum: ['kg', 'tonne', 'crate'], default: 'kg' },
  status: { type: String, enum: statuses, default: 'created', index: true },
  qualityGrade: String,
  qualityRating: { type: Number, min: 0, max: 5 },
  inspectionHistory: [{ inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, measuredQuantity: Number, grade: String, rating: Number, notes: String, inspectedAt: { type: Date, default: Date.now } }],
  statusHistory: [{ status: String, changedBy: mongoose.Schema.Types.ObjectId, changedAt: { type: Date, default: Date.now }, note: String }]
}, { timestamps: true })

export { statuses }
export default mongoose.model('ProduceLot', produceLotSchema)
