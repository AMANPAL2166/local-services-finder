import express from 'express'
import { body, validationResult } from 'express-validator'
import { createReview, getServiceReviews } from '../controllers/review.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }
  next()
}

const validateReview = [
  body('serviceId')
    .notEmpty().withMessage('Service ID required')
    .isMongoId().withMessage('Invalid service ID'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 500 }).withMessage('Comment must be 10-500 characters'),
]

router.post('/',                  protect, validateReview, validate, createReview)
router.get('/service/:serviceId', getServiceReviews)

export default router