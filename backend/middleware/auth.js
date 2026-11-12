import { verifyToken } from '../utils/jwt.js'

export function requireAuth(request, response, next) {
  let token = null
  const authHeader = request.headers.authorization
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim()
    } else {
      token = authHeader.trim()
    }
  } else if (request.query?.token) {
    token = String(request.query.token).trim()
  }

  if (!token) {
    return response.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = verifyToken(token)
    const userId = decoded.userId || decoded.id || decoded._id
    request.user = {
      ...decoded,
      userId,
      id: userId,
      _id: userId,
    }
    return next()
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' })
  }
}

export default {
  requireAuth,
}
