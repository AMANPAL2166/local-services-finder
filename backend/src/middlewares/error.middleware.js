const errorHandler = (err, req, res, next) => {

  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Internal Server Error'

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', {
      message: err.message,
      stack:   err.stack,
      url:     req.originalUrl,
      method:  req.method,
    })
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400
    message    = 'Invalid ID format'
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400
    message    = Object.values(err.errors).map(e => e.message).join(', ')
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message    = 'Invalid token, please login again'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message    = 'Session expired, please login again'
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400
    message    = 'File too large, max 5MB allowed'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack:  err.stack,
      detail: err,
    }),
  })
}

export default errorHandler