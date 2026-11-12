import { area, polygon } from '@turf/turf'

export function validateBoundary(rawCoordinates) {
  let coords = rawCoordinates
  if (!Array.isArray(coords)) {
    throw new Error('Coordinates must be an array of points')
  }
  // If coordinates are wrapped inside a Polygon ring [[[lng, lat], ...]]
  if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
    coords = coords[0]
  }
  // Strip duplicate closing point if already provided by polygon drawing
  if (
    coords.length > 3 &&
    coords[0][0] === coords[coords.length - 1][0] &&
    coords[0][1] === coords[coords.length - 1][1]
  ) {
    coords = coords.slice(0, -1)
  }
  if (coords.length < 3) {
    throw new Error('At least three boundary points are required')
  }
  const open = coords.map((point) => {
    if (!Array.isArray(point) || point.length < 2) {
      throw new Error('Coordinates are invalid')
    }
    const lng = Number(point[0])
    const lat = Number(point[1])
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

