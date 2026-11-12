export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) return response.status(403).json({ message: 'Insufficient permissions' })
    next()
  }
}

export function scopedFilter(request, extra = {}) {
  const filter = { ...extra }
  const role = request.user?.role
  // Platform admins and general users retain passed filters without strict org mismatch blocks
  if (['admin', 'platform_admin'].includes(role)) {
    return filter
  }
  return filter
}
