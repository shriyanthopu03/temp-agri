import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '.env.development.local') })
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from './models/User.js'
import Farm from './models/Farm.js'
import ProduceLot from './models/ProduceLot.js'
import { connectDatabase } from './config/db.js'

const defaultOrgId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011')
const defaultRegId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012')

async function seed() {
  await connectDatabase()
  console.log('Connected to MongoDB for seeding...')

  const demoUsers = [
    {
      name: 'Demo Farmer',
      email: 'farmer@rythusevak.com',
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

  const createdUsers = {}

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
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    )
    createdUsers[demo.role] = user
    console.log(`Seeded user: ${demo.email} [${demo.role}]`)
  }

  // Ensure Demo Farm for farmer
  const farmerUser = createdUsers['farmer']
  if (farmerUser) {
    let farm = await Farm.findOne({ farmer: farmerUser._id })
    if (!farm) {
      farm = await Farm.create({
        organizationId: defaultOrgId,
        regionId: defaultRegId,
        farmer: farmerUser._id,
        farmName: 'Nashik Valley Vineyard & Orchard',
        crops: ['Alphonso Mangoes', 'Thompson Seedless Grapes'],
        cropHealth: 'Excellent',
        expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        expectedQuantity: 2500,
        inspectionStatus: 'inspected',
        location: {
          address: 'Nashik Agro Belt, Maharashtra',
          latitude: 19.9975,
          longitude: 73.7898,
        },
        boundary: {
          type: 'Polygon',
          coordinates: [
            [
              [73.785, 19.995],
              [73.795, 19.995],
              [73.795, 20.005],
              [73.785, 20.005],
              [73.785, 19.995],
            ],
          ],
        },
        areaSqMeters: 50585,
        areaAcres: 12.5,
        areaHectares: 5.0585,
      })
      console.log('Seeded demo farm with GPS polygon coordinates')
    }

    // Ensure one pending inspection lot
    const pendingLot = await ProduceLot.findOne({ farm: farm._id, status: 'created' })
    if (!pendingLot) {
      await ProduceLot.create({
        organizationId: defaultOrgId,
        regionId: defaultRegId,
        farmer: farmerUser._id,
        farm: farm._id,
        category: 'Alphonso Mangoes',
        variety: 'Export Grade Ratnagiri',
        cropHealth: 'Healthy',
        harvestDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        quantity: 1500,
        availableQuantity: 1500,
        unit: 'kg',
        marketPrice: 65,
        status: 'created', // Pending Inspection
        statusHistory: [{ status: 'created', changedBy: farmerUser._id, note: 'Harvest batch submitted for inspection' }],
      })
      console.log('Seeded pending inspection lot for Quality Inspector testing')
    }

    // Ensure one accepted lot for Buyer marketplace
    const acceptedLot = await ProduceLot.findOne({ farm: farm._id, status: 'accepted' })
    if (!acceptedLot) {
      await ProduceLot.create({
        organizationId: defaultOrgId,
        regionId: defaultRegId,
        farmer: farmerUser._id,
        farm: farm._id,
        category: 'Thompson Seedless Grapes',
        variety: 'Table Grapes',
        cropHealth: 'Excellent',
        harvestDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        quantity: 2000,
        availableQuantity: 2000,
        unit: 'kg',
        marketPrice: 80,
        status: 'accepted',
        qualityGrade: 'Grade A',
        qualityRating: 4.8,
        inspectionHistory: [
          {
            inspector: createdUsers['quality_inspector']?._id,
            grade: 'Grade A',
            rating: 4.8,
            measuredQuantity: 2000,
            notes: 'Inspected on-site. Low moisture, uniform cluster density, export certified.',
          },
        ],
        statusHistory: [
          { status: 'created', changedBy: farmerUser._id },
          { status: 'accepted', changedBy: createdUsers['quality_inspector']?._id, note: 'Certified Grade A' },
        ],
      })
      console.log('Seeded accepted Grade A batch for Buyer testing')
    }
  }

  await mongoose.disconnect()
  console.log('Seeding completed successfully.')
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
