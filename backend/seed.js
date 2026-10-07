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
      name: 'Quality Inspector',
      email: 'qi@gmail.com',
      password: '12345678',
      role: 'quality_inspector',
    },
    {
      name: 'Buyer',
      email: 'buyer@gmail.com',
      password: '12345678',
      role: 'buyer',
    },
    {
      name: 'Platform Admin',
      email: 'admin@gmail.com',
      password: '12345678',
      role: 'platform_admin',
    },
    {
      name: 'Logistics Coordinator',
      email: 'l@gmail.com',
      password: '12345678',
      role: 'logistics_coordinator',
    },
  ]

  for (const demo of demoUsers) {
    const passwordHash = await bcrypt.hash(demo.password, 12)
    const user = await User.findOneAndUpdate(
      { email: demo.email.toLowerCase() },
      {
        $set: {
          name: demo.name,
          email: demo.email.toLowerCase(),
          passwordHash,
          role: demo.role,
          organizationId: defaultOrgId,
          regionId: defaultRegId,
          active: true,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
    if (user.createdAt && user.createdAt.getTime() === user.updatedAt.getTime()) {
      console.log(`Created demo user: ${demo.email} / ${demo.password}`)
    } else {
      console.log(`Updated demo user: ${demo.email} / ${demo.password}`)
    }
  }

  await mongoose.disconnect()
  console.log('Seeding completed successfully.')
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
