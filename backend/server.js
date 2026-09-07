import dotenv from 'dotenv'
dotenv.config({ path: '.env.development.local' })
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import farms from './routes/farms.js'
import auth from './routes/auth.js'
import lots from './routes/lots.js'
import operations from './routes/operations.js'
import audit from './routes/audit.js'
import notifications from './routes/notifications.js'
import enterprise from './routes/enterprise.js'

const app = express()
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const frontendDist = path.join(projectRoot, 'frontend', 'dist')

app.use(helmet())
app.use(cors(process.env.CLIENT_URL ? { origin: process.env.CLIENT_URL } : {}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
let connectionPromise

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return
  if (!mongoUrl) throw new Error('MONGODB_URL is required to access the API')
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUrl).catch((error) => {
      connectionPromise = undefined
      throw error
    })
  }
  await connectionPromise
}

app.use(async (_request, _response, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/api/health', (_req, res) => res.json({
  status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
  service: 'agritrade-api',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}))
const apiPrefix = '/api'
app.use(`${apiPrefix}/auth`, auth)
app.use(`${apiPrefix}/farms`, farms)
app.use(`${apiPrefix}/lots`, lots)
app.use(`${apiPrefix}/operations`, operations)
app.use(`${apiPrefix}/audit`, audit)
app.use(`${apiPrefix}/notifications`, notifications)
app.use(`${apiPrefix}/enterprise`, enterprise)
app.use(express.static(frontendDist))
app.get('/*splat', (request, response, next) => {
  if (request.path.startsWith('/api/')) return next()
  response.sendFile(path.join(frontendDist, 'index.html'))
})
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message || 'Server error' }))
const port = process.env.PORT || 5000
const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI

async function startServer() {
  await connectDatabase()
  app.listen(port, () => console.log(`AgriTrade API listening on ${port} with MongoDB connected`))
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('MongoDB connection failed', error)
    process.exit(1)
  })
}

export { app, startServer }
export default app
