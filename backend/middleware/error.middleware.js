const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err.name === 'CastError') { message = `Resource not found`; statusCode = 404 }
  if (err.code === 11000) {
    message = `${Object.keys(err.keyValue)[0]} already exists`
    statusCode = 400
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ')
    statusCode = 400
  }

  if (process.env.NODE_ENV === 'development') console.error(err)

  res.status(statusCode).json({ message, ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) })
}

module.exports = errorHandler
