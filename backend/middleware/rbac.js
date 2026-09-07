export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) return response.status(403).json({ message: 'Insufficient permissions' })
    next()
  }
}

export function scopedFilter(request, extra = {}) {
  const filter = { ...extra }
  if (request.user?.organizationId) filter.organizationId = request.user.organizationId
  if (request.user?.regionId) filter.regionId = request.user.regionId
  return filter
}
