import dotenv from 'dotenv'
dotenv.config({ path: '.env.development.local' })
dotenv.config()
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'

const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI

if (!mongoUrl) {
  console.error('Error: MONGODB_URL environment variable is required.')
  process.exit(1)
}

const defaultOrgId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
const defaultRegId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012')

async function seed() {
  await mongoose.connect(mongoUrl)
  console.log('Connected to MongoDB for seeding...')

  const demoUsers = [
    {
      name: 'Demo Farmer',
      email: 'farmer@agritrade.com',
      password: 'Farmer123!',
      role: 'farmer',
    },
    {
      name: 'Demo Admin',
      email: 'admin@agritrade.com',
      password: 'Admin123!',
      role: 'admin',
    },
  ]

  for (const demo of demoUsers) {
    const existing = await User.findOne({ email: demo.email.toLowerCase() })
    if (!existing) {
      const passwordHash = await bcrypt.hash(demo.password, 12)
      await User.create({
        name: demo.name,
        email: demo.email,
        passwordHash,
        role: demo.role,
        organizationId: defaultOrgId,
        regionId: defaultRegId,
        active: true,
      })
      console.log(`Created demo user: ${demo.email} / ${demo.password}`)
    } else {
      console.log(`User already exists: ${demo.email}`)
    }
  }

  await mongoose.disconnect()
  console.log('Seeding completed successfully.')
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
