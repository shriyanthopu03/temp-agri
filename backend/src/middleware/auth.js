import jwt from 'jsonwebtoken'

export function requireAuth(request, response, next) {
  const token = request.headers.authorization?.startsWith('Bearer ') ? request.headers.authorization.slice(7) : null
  if (!token) return response.status(401).json({ message: 'Authentication required' })
  try { request.user = jwt.verify(token, process.env.JWT_SECRET) ; return next() } catch { return response.status(401).json({ message: 'Invalid or expired token' }) }
}
