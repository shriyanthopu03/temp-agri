import mongoose from 'mongoose'

const settlementSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lot: mongoose.Schema.Types.ObjectId,
  acceptedQuantity: { type: Number, min: 0, required: true },
  qualityGrade: String,
  agreedPrice: { type: Number, min: 0, required: true },
  deductions: { type: Number, min: 0, default: 0 },
  adjustments: { type: Number, default: 0 },
  total: { type: Number, min: 0, required: true },
  status: { type: String, enum: ['draft', 'approved', 'paid', 'disputed'], default: 'draft', index: true }
}, { timestamps: true })

export default mongoose.model('Settlement', settlementSchema)
