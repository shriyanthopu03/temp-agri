import { apiRequest } from './api'

export async function requestWorkflow(path, options, token) {
  return apiRequest(`/api/workflow${path}`, options, token)
}

export default {
  requestWorkflow,
}

