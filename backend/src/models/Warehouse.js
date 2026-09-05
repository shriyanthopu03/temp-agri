import mongoose from 'mongoose'

const warehouseSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  location: String,
  inventory: [{ lot: { type: mongoose.Schema.Types.ObjectId, ref: 'ProduceLot' }, quantity: { type: Number, min: 0 }, bin: String }],
  movements: [{ lot: mongoose.Schema.Types.ObjectId, quantity: Number, direction: { type: String, enum: ['in', 'out'] }, reason: String, actor: mongoose.Schema.Types.ObjectId, movedAt: { type: Date, default: Date.now } }]
}, { timestamps: true })

export default mongoose.model('Warehouse', warehouseSchema)
