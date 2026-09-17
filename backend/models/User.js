import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true, index: true },
  firebaseUid: { type: String, unique: true, sparse: true, index: true },
  role: { type: String, enum: ['admin', 'regional_manager', 'org_manager', 'operator', 'farmer'], default: 'farmer' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  regionId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
