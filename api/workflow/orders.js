import app from '../../backend/server.js'

export default function handler(request, response) {
  request.url = '/api/workflow/orders'
  return app(request, response)
}
