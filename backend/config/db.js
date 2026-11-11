import mongoose from 'mongoose'

let connectionPromise = null

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection

  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI
  if (!mongoUrl) {
    throw new Error('MONGODB_URL or MONGODB_URI is required to access the database')
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUrl).catch((error) => {
      connectionPromise = null
      throw error
    })
  }

  await connectionPromise
  return mongoose.connection
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1
}

export default {
  connectDatabase,
  isDatabaseConnected,
}

