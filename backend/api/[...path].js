import app from "./server.js"

export default async function handler(request, response) {
  return app(request, response)
}
