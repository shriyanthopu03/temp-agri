import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import User from '../models/User.js'

const router = Router()

function issueToken(user) {
  const secret = process.env.JWT_SECRET 
  if (!secret) throw new Error('JWT_SECRET or MAPTILER_API_KEY is required for authentication')
  return jwt.sign({ userId: user._id.toString(), role: user.role, organizationId: user.organizationId.toString(), regionId: user.regionId.toString() }, secret, { expiresIn: '8h' })
}

function getRedirectUri(request) {
  return process.env.GOOGLE_REDIRECT_URI || `${request.protocol}://${request.get('host')}/api/auth/google/callback`
}

function getClientUrl(request) {
  return process.env.CLIENT_URL || `${request.protocol}://${request.get('host')}`
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, regionId: user.regionId }
}

router.get('/google', (request, response) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.JWT_SECRET) return response.status(503).json({ message: 'Google sign-in is not configured' })
  const state = jwt.sign({ nonce: crypto.randomBytes(16).toString('hex') }, process.env.JWT_SECRET, { expiresIn: '10m' })
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: getRedirectUri(request), response_type: 'code', scope: 'openid email profile', access_type: 'offline', prompt: 'select_account', state })
  return response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

router.post('/firebase', async (request, response, next) => {
  try {
    const { idToken } = request.body
    const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY
    if (!idToken || !apiKey) return response.status(400).json({ message: 'Firebase sign-in is not configured' })
    const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })
    const lookup = await lookupResponse.json()
    const profile = lookup.users?.[0]
    const isGoogleUser = profile?.providerUserInfo?.some((provider) => provider.providerId === 'google.com')
    if (!lookupResponse.ok || !profile || !profile.emailVerified || !isGoogleUser) return response.status(401).json({ message: 'Firebase account could not be verified' })
    let user = await User.findOne({ $or: [{ firebaseUid: profile.localId }, { email: profile.email.toLowerCase() }] })
    if (user) {
      if (!user.firebaseUid) { user.firebaseUid = profile.localId; await user.save() }
    } else {
      user = await User.create({ name: profile.displayName || profile.email.split('@')[0], email: profile.email, firebaseUid: profile.localId, role: 'farmer', organizationId: process.env.GOOGLE_DEFAULT_ORGANIZATION_ID || '507f1f77bcf86cd799439011', regionId: process.env.GOOGLE_DEFAULT_REGION_ID || '507f1f77bcf86cd799439012' })
    }
    return response.json({ token: issueToken(user), user: publicUser(user) })
  } catch (error) { next(error) }
})

router.get('/google/callback', async (request, response, next) => {
  try {
    if (!request.query.code || !request.query.state) return response.status(400).send('Google sign-in was cancelled.')
    jwt.verify(request.query.state, process.env.JWT_SECRET)
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: request.query.code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: getRedirectUri(request), grant_type: 'authorization_code' }) })
    const tokens = await tokenResponse.json()
    if (!tokenResponse.ok || !tokens.id_token) return response.status(401).send('Google sign-in could not be completed.')
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokens.id_token)}`)
    const profile = await googleResponse.json()
    if (!googleResponse.ok || profile.aud !== process.env.GOOGLE_CLIENT_ID || profile.email_verified !== 'true') return response.status(401).send('Google account could not be verified.')
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }] })
    if (user) {
      if (!user.googleId) { user.googleId = profile.sub; await user.save() }
    } else {
      user = await User.create({ name: profile.name || profile.email.split('@')[0], email: profile.email, googleId: profile.sub, role: 'farmer', organizationId: process.env.GOOGLE_DEFAULT_ORGANIZATION_ID || '507f1f77bcf86cd799439011', regionId: process.env.GOOGLE_DEFAULT_REGION_ID || '507f1f77bcf86cd799439012' })
    }
    const session = encodeURIComponent(JSON.stringify({ token: issueToken(user), user: publicUser(user) }))
    return response.redirect(`${getClientUrl(request)}/#google-session=${session}`)
  } catch (error) { next(error) }
})

router.post('/register', async (request, response, next) => {
  try {
    const { name, email, password, role = 'farmer', organizationId, regionId } = request.body
    if (!name || !email || !password || !organizationId || !regionId) return response.status(400).json({ message: 'Name, email, password, organizationId, and regionId are required' })
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return response.status(409).json({ message: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role, organizationId, regionId })
    return response.status(201).json({ token: issueToken(user), user: publicUser(user) })
  } catch (error) { next(error) }
})

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body
    const user = await User.findOne({ email: email?.toLowerCase(), active: true }).select('+passwordHash')
    if (!user || !user.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) return response.status(401).json({ message: 'Invalid credentials' })
    return response.json({ token: issueToken(user), user: publicUser(user) })
  } catch (error) { next(error) }
})

export default router
