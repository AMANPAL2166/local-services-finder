import express from 'express'
import { body, validationResult } from 'express-validator'
import {
  register, login, logout, getMe,
  updateProfile, uploadAvatarHandler
} from '../controllers/auth.controller.js'
import { protect } from '../middlewares/auth.middleware.js'
import { uploadAvatar } from '../config/cloudinary.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg })
  }
  next()
}

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Min 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('role').optional()
    .isIn(['user', 'provider']).withMessage('Invalid role'),
]

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
]

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message })
    next()
  })
}

router.post('/register',     validateRegister, validate, register)
router.post('/login',        validateLogin,    validate, login)
router.post('/logout',       logout)
router.get('/me',            protect, getMe)
router.put('/profile',       protect, updateProfile)
router.put('/avatar',        protect, handleAvatarUpload, uploadAvatarHandler)

export default router