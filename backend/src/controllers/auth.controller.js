import User from '../models/User.model.js'
import generateToken from '../utils/generateToken.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { uploadToCloudinary } from '../config/cloudinary.js'

const cookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
}

const formatUser = (user) => ({
  _id:        user._id,
  name:       user.name,
  email:      user.email,
  role:       user.role,
  avatar:     user.avatar,
  phone:      user.phone,
  address:    user.address,
  bio:        user.bio,
  experience: user.experience,
})

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body
  const exists = await User.findOne({ email })
  if (exists) return errorResponse(res, 400, 'Email already registered')
  const user  = new User({ name, email, password, role })
  await user.save()
  const token = generateToken(user._id)
  res.cookie('token', token, cookieOptions)
  return successResponse(res, 201, 'Registered successfully', { token, user: formatUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select('+password')
  if (!user) return errorResponse(res, 401, 'Invalid email or password')
  const isMatch = await user.matchPassword(password)
  if (!isMatch) return errorResponse(res, 401, 'Invalid email or password')
  const token = generateToken(user._id)
  res.cookie('token', token, cookieOptions)
  return successResponse(res, 200, 'Logged in successfully', { token, user: formatUser(user) })
})

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { maxAge: 0 })
  successResponse(res, 200, 'Logged out successfully')
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  successResponse(res, 200, 'User fetched', { user: formatUser(user) })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, bio, experience } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address, bio, experience },
    { new: true, runValidators: true }
  )
  successResponse(res, 200, 'Profile updated', { user: formatUser(user) })
})

export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 400, 'No image uploaded')

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'servifind/avatars', {
      transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
    })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    )

    successResponse(res, 200, 'Avatar updated', {
      avatar: user.avatar,
      user:   formatUser(user),
    })
  } catch (err) {
    console.error('Avatar upload error:', err)
    return errorResponse(res, 500, 'Failed to upload avatar')
  }
})