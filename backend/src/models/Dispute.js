import mongoose from 'mongoose'

const disputeSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'assigned', 'investigating', 'resolved', 'rejected', 'escalated'], default: 'open', index: true },
  evidence: [String],
  history: [{ status: String, actor: mongoose.Schema.Types.ObjectId, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('Dispute', disputeSchema)
