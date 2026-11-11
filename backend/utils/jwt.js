import jwt from 'jsonwebtoken'

export function issueToken(user) {
  const secret = process.env.JWT_SECRET || 'agritrade_default_jwt_secret_dev_key_2026'
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : undefined,
      regionId: user.regionId ? user.regionId.toString() : undefined,
    },
    secret,
    { expiresIn: '8h' }
  )
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'agritrade_default_jwt_secret_dev_key_2026'
  return jwt.verify(token, secret)
}

export default {
  issueToken,
  verifyToken,
}

