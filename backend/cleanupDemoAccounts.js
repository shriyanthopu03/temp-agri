import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDatabase } from './config/db.js'
import { User } from './models/User.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '.env.development.local') })
dotenv.config()

const DEMO_EMAILS = [
  'farmer@rythusevak.com',
  'qi@gmail.com',
  'buyer@gmail.com',
  'admin@gmail.com',
  'l@gmail.com',
]

async function cleanup() {
  try {
    await connectDatabase()
    console.log('Connected to database for demo account cleanup...')

    const result = await User.deleteMany({ email: { $in: DEMO_EMAILS } })
    console.log(`Successfully removed ${result.deletedCount} demo accounts:`, DEMO_EMAILS.join(', '))
    process.exit(0)
  } catch (err) {
    console.error('Failed to cleanup demo accounts:', err)
    process.exit(1)
  }
}

cleanup()
