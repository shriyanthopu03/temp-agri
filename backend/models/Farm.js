import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmName: { type: String, required: true, trim: true, maxlength: 120 },
    crops: [{ type: String, trim: true }],
    cropHealth: { type: String, trim: true, default: 'Healthy' },
    expectedHarvestDate: { type: Date },
    expectedQuantity: { type: Number, min: 0, default: 1000 },
    inspectionStatus: {
      type: String,
      enum: ['not_requested', 'pending', 'inspected'],
      default: 'not_requested',
      index: true,
    },
    location: {
      address: { type: String, trim: true },
      latitude: Number,
      longitude: Number,
    },
    boundary: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    areaSqMeters: { type: Number, required: true, min: 0 },
    areaAcres: { type: Number, required: true, min: 0 },
    areaHectares: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

farmSchema.index({ boundary: '2dsphere' })
export default mongoose.model('Farm', farmSchema)
