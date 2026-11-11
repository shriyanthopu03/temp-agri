export function errorHandler(error, req, res, _next) {
  const status = error.status || error.statusCode || 500
  const message = error.message || 'Server error'
  res.status(status).json({ message })
}

export default errorHandler

