import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
dotenv.config({ path: path.join(__dirname, '.env.development.local') })
dotenv.config()

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDatabase, isDatabaseConnected } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

import farms from './routes/farms.js'
import auth from './routes/auth.js'
import lots from './routes/lots.js'
import operations from './routes/operations.js'
import audit from './routes/audit.js'
import notifications from './routes/notifications.js'
import enterprise from './routes/enterprise.js'
import workflow from './routes/workflow.js'

const app = express()
const projectRoot = path.resolve(__dirname, '..')
const frontendDist = path.join(projectRoot, 'frontend', 'dist')

app.use(helmet())
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) =>
  res.json({
    status: isDatabaseConnected() ? 'ok' : 'degraded',
    service: 'rythu-sevak-api',
    database: isDatabaseConnected() ? 'connected' : 'disconnected',
  })
)

// Ensure database connection middleware
app.use(async (_request, _response, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

const apiPrefix = '/api'
app.use(`${apiPrefix}/auth`, auth)
app.use(`${apiPrefix}/farms`, farms)
app.use(`${apiPrefix}/lots`, lots)
app.use(`${apiPrefix}/operations`, operations)
app.use(`${apiPrefix}/audit`, audit)
app.use(`${apiPrefix}/notifications`, notifications)
app.use(`${apiPrefix}/enterprise`, enterprise)
app.use(`${apiPrefix}/workflow`, workflow)

// Serve static frontend in production if built
app.use(express.static(frontendDist))
app.get('/*splat', (request, response, next) => {
  if (request.path.startsWith('/api/')) return next()
  response.sendFile(path.join(frontendDist, 'index.html'))
})

// Centralized error handler
app.use(errorHandler)

const port = process.env.PORT || 5000

async function startServer() {
  await connectDatabase()
  app.listen(port, () => console.log(`Rythu Sevak API listening on ${port} with MongoDB connected`))
}

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('MongoDB connection failed', error)
    process.exit(1)
  })
}

export { app, startServer }
export default app
