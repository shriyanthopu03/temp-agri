import { apiRequest } from './api'

export function mapFarm(farm) {
  const points = farm.boundary?.coordinates?.[0] || []
  const closedPoints =
    points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
      ? points.slice(0, -1)
      : points
  return {
    ...farm,
    id: farm._id || farm.id || String(Math.random()),
    name: farm.farmName || farm.name,
    location: farm.location?.address || farm.location,
    crop: farm.crops?.[0] || farm.crop,
    area: farm.areaAcres || farm.area,
    inspectionStatus: farm.inspectionStatus || 'not_requested',
    cropHealth: farm.cropHealth || 'Healthy',
    expectedQuantity: farm.expectedQuantity || 1000,
    expectedHarvestDate: farm.expectedHarvestDate,
    status: 'Verified',
    points: closedPoints,
  }
}

export async function requestFarms(path, options, token) {
  return apiRequest(`/api/farms${path}`, options, token)
}

export default {
  mapFarm,
  requestFarms,
}
