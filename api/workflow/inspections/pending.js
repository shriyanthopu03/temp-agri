import app from '../../../../backend/server.js'

export default function handler(request, response) {
  request.url = '/api/workflow/inspections/pending'
  return app(request, response)
}
