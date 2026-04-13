export const successResponse = (res, statusCode = 200, message = 'Success', data = {}) => {
    return res.status(statusCode).json({ success: true, message, data })
  }
  
  export const errorResponse = (res, statusCode = 500, message = 'Server Error') => {
    return res.status(statusCode).json({ success: false, message })
  }