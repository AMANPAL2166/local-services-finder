import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

// Config function — call karo jab zaroorat ho, pehle nahi
const getCloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  return cloudinary
}

const storage = multer.memoryStorage()

export const uploadServiceImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only images allowed'), false)
  },
}).single('image')

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only images allowed'), false)
  },
}).single('avatar')

export const uploadToCloudinary = (buffer, folder, options = {}) => {
  const cloud = getCloudinaryConfig() // har call pe fresh config
  return new Promise((resolve, reject) => {
    cloud.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })
}

export default cloudinary