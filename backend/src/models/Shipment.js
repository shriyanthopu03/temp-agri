import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  shipmentNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['created', 'assigned', 'dispatched', 'in_transit', 'delivered', 'cancelled'], default: 'created', index: true },
  lots: [{ lot: mongoose.Schema.Types.ObjectId, quantity: Number }],
  vehicle: mongoose.Schema.Types.ObjectId,
  destination: String,
  deliveredAt: Date,
  history: [{ status: String, actor: mongoose.Schema.Types.ObjectId, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('Shipment', shipmentSchema)
