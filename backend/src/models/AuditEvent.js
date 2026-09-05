import mongoose from 'mongoose'

const auditEventSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, index: true },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true })

export default mongoose.model('AuditEvent', auditEventSchema)
