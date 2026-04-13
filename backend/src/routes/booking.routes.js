import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  createBooking, getMyBookings,
  getProviderBookings, updateBookingStatus
} from '../controllers/booking.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }
  next()
}

const validateBooking = [
  body('serviceId')
    .notEmpty().withMessage('Service ID is required')
    .isMongoId().withMessage('Invalid service ID'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isDate().withMessage('Invalid date format'),
  body('timeSlot')
    .notEmpty().withMessage('Time slot is required'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 10 }).withMessage('Please enter complete address'),
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes too long'),
]

const validateStatus = [
  body('status')
    .isIn(['confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
]

router.post('/',           protect, authorize('user'), validateBooking, validate, createBooking)
router.get('/my',          protect, getMyBookings)
router.get('/provider',    protect, authorize('provider', 'admin'), getProviderBookings)
router.put('/:id/status',  protect, validateStatus, validate, updateBookingStatus)

export default router