import mongoose from 'mongoose'

const purchaseOrderSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'ProduceLot', index: true },
  number: { type: String, required: true, unique: true },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'partially_fulfilled', 'fulfilled', 'cancelled'], default: 'draft', index: true },
  lines: [{ category: String, quantity: { type: Number, min: 0 }, unitPrice: { type: Number, min: 0 }, allocatedLots: [{ lot: mongoose.Schema.Types.ObjectId, quantity: Number }] }],
  crop: String,
  quantity: { type: Number, min: 0 },
  unit: String,
  unitPrice: { type: Number, min: 0 },
  totalAmount: { type: Number, min: 0 },
  buyerLocation: { address: String, latitude: Number, longitude: Number },
  pickupLocation: { address: String, latitude: Number, longitude: Number },
  shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  deliveryConfirmedAt: Date,
  history: [{ status: String, changedBy: mongoose.Schema.Types.ObjectId, note: String, changedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('PurchaseOrder', purchaseOrderSchema)
