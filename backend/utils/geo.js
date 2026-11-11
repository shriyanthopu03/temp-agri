import { area, polygon } from '@turf/turf'

export function validateBoundary(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    throw new Error('At least three boundary points are required')
  }
  const open = coordinates.map((point) => {
    if (!Array.isArray(point) || point.length !== 2) {
      throw new Error('Coordinates are invalid')
    }
    const [lng, lat] = point
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new Error('Coordinates are invalid')
    }
    return [lng, lat]
  })
  const closed = [...open, open[0]]
  const sqm = area(polygon([closed]))
  if (!sqm) throw new Error('Boundary area must be positive')
  return { coordinates: [closed], sqm }
}

export function isValidCoordinate(latitude, longitude) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export default {
  validateBoundary,
  isValidCoordinate,
}
