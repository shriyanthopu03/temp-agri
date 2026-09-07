import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  readAt: Date,
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
