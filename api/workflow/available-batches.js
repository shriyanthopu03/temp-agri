import app from '../../backend/server.js'

export default function handler(request, response) {
  request.url = '/api/workflow/available-batches'
  return app(request, response)
}
