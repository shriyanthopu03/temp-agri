import { apiRequest } from './api'

export function mapFarm(farm) {
  if (!farm) return null
  const points = farm.boundary?.coordinates?.[0] || farm.points || []
  const closedPoints =
    points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
      ? points.slice(0, -1)
      : points

  let coordsStr = ''
  if (closedPoints.length > 0) {
    const sum = closedPoints.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    const avgLat = (sum[1] / closedPoints.length).toFixed(4)
    const avgLng = (sum[0] / closedPoints.length).toFixed(4)
    coordsStr = `GPS: ${avgLat}, ${avgLng}`
  } else if (Number.isFinite(Number(farm.location?.latitude)) && Number.isFinite(Number(farm.location?.longitude))) {
    coordsStr = `GPS: ${Number(farm.location.latitude).toFixed(4)}, ${Number(farm.location.longitude).toFixed(4)}`
  }

  const rawLoc = farm.location?.address || (typeof farm.location === 'string' ? farm.location : '')
  const displayLocation = (rawLoc && !rawLoc.toLowerCase().includes('nashik') && rawLoc !== 'Location pending')
    ? rawLoc
    : (coordsStr || 'GPS Coordinates Registered')

  return {
    ...farm,
    id: farm._id || farm.id || String(Math.random()),
    name: farm.farmName || farm.name || 'Unnamed Farm',
    location: displayLocation,
    crop: farm.crops?.[0] || farm.crop || 'Produce',
    area: farm.areaAcres || farm.area || 0,
    inspectionStatus: farm.inspectionStatus || 'not_requested',
    cropHealth: farm.cropHealth || 'Healthy',
    expectedQuantity: farm.expectedQuantity || 0,
    expectedHarvestDate: farm.expectedHarvestDate,
    status: farm.status || 'Active',
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
