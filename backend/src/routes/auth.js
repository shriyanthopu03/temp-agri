import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()

function issueToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role, organizationId: user.organizationId.toString(), regionId: user.regionId.toString() }, process.env.JWT_SECRET, { expiresIn: '8h' })
}

router.post('/register', async (request, response, next) => {
  try {
    const { name, email, password, role = 'farmer', organizationId, regionId } = request.body
    if (!name || !email || !password || !organizationId || !regionId) return response.status(400).json({ message: 'Name, email, password, organizationId, and regionId are required' })
    if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return response.status(409).json({ message: 'Email already registered' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash, role, organizationId, regionId })
    return response.status(201).json({ token: issueToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, regionId: user.regionId } })
  } catch (error) { next(error) }
})

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body
    const user = await User.findOne({ email: email?.toLowerCase(), active: true }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return response.status(401).json({ message: 'Invalid credentials' })
    return response.json({ token: issueToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId, regionId: user.regionId } })
  } catch (error) { next(error) }
})

export default router
