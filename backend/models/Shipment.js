import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  shipmentNumber: { type: String, required: true, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', index: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['created', 'ready_for_pickup', 'assigned', 'picked_up', 'dispatched', 'in_transit', 'delivered', 'cancelled'], default: 'created', index: true },
  lots: [{ lot: mongoose.Schema.Types.ObjectId, quantity: Number }],
  vehicle: String,
  deliveryAgent: String,
  pickupLocation: { address: String, latitude: Number, longitude: Number },
  destination: { address: String, latitude: Number, longitude: Number },
  qualityGrade: String,
  destination: String,
  deliveredAt: Date,
  history: [{ status: String, actor: mongoose.Schema.Types.ObjectId, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('Shipment', shipmentSchema)
