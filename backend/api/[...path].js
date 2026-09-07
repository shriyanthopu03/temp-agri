import app from '../src/server.js'

export default async function handler(request, response) {
  return app(request, response)
}
