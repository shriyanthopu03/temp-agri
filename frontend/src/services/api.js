export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('agritrade-session')
        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: data.message || 'Session expired. Please log in again.',
          })
        )
      }
      throw new Error(data.message || 'Your session has expired. Please sign in again.')
    }
    throw new Error(data.message || `Request failed with status ${response.status}`)
  }
  return data
}

export default apiRequest

