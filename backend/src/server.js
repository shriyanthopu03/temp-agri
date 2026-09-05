import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import farms from './routes/farms.js'
import auth from './routes/auth.js'
import lots from './routes/lots.js'
import operations from './routes/operations.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'agritrade-api' }))
app.use('/api/auth', auth)
app.use('/api/farms', farms)
app.use('/api/lots', lots)
app.use('/api/operations', operations)
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message || 'Server error' }))
const port = process.env.PORT || 5000
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`AgriTrade API listening on ${port}`))).catch((error) => { console.error('MongoDB connection failed', error); process.exit(1) })
else app.listen(port, () => console.log(`AgriTrade API listening on ${port} (MONGODB_URI not configured)`))
export default app
