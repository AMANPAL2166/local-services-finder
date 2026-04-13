import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  createService, getAllServices, getServiceById,
  updateService, deleteService, getMyServices
} from '../controllers/service.controller.js'
import { protect, authorize } from '../middlewares/auth.middleware.js'
import { uploadServiceImage } from '../config/cloudinary.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }
  next()
}

const validateService = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Plumber','Electrician','Cleaner','Carpenter','Painter','Mechanic','Tutor','Salon','Other'])
    .withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 1, max: 100000 }).withMessage('Price must be between 1 and 100000'),
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
]

// Multer error handler
const handleUpload = (req, res, next) => {
  uploadServiceImage(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    next()
  })
}

router.get('/',       getAllServices)
router.get('/mine',   protect, authorize('provider', 'admin'), getMyServices)
router.get('/:id',    getServiceById)
router.post('/',      protect, authorize('provider', 'admin'), handleUpload, validateService, validate, createService)
router.put('/:id',    protect, authorize('provider', 'admin'), handleUpload, updateService)
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService)

export default router