import app from '../../../backend/server.js'

export default function handler(request, response) {
  return app(request, response)
}
