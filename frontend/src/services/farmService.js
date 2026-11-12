import { apiRequest } from './api'

export function mapFarm(farm) {
  if (!farm) return null
  const points = farm.boundary?.coordinates?.[0] || farm.points || []
  const closedPoints =
    points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
      ? points.slice(0, -1)
      : points
  return {
    ...farm,
    id: farm._id || farm.id || String(Math.random()),
    name: farm.farmName || farm.name || 'Unnamed Farm',
    location: farm.location?.address || farm.location || 'Nashik Belt, Maharashtra, India',
    crop: farm.crops?.[0] || farm.crop || 'Produce',
    area: farm.areaAcres || farm.area || 0,
    inspectionStatus: farm.inspectionStatus || 'not_requested',
    cropHealth: farm.cropHealth || 'Healthy',
    expectedQuantity: farm.expectedQuantity || 1000,
    expectedHarvestDate: farm.expectedHarvestDate,
    status: farm.status || 'Verified',
    points: closedPoints,
  }
}

export async function requestFarms(path = '', options = {}, token = null) {
  const cleanPath = path === '/' ? '' : (path.startsWith('/') ? path : `/${path}`)
  return apiRequest(`/api/farms${cleanPath}`, options, token)
}

export default {
  mapFarm,
  requestFarms,
}
