import Service from '../models/Service.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { uploadToCloudinary } from '../config/cloudinary.js'

export const createService = asyncHandler(async (req, res) => {
  const { name, category, description, price, address, lat, lng } = req.body

  if (!name || !category || !description || !price || !address) {
    return errorResponse(res, 400, 'Please fill all required fields')
  }

  let imageUrl = ''

  // Image upload karo agar hai
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'servifind/services', {
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
      })
      imageUrl = result.secure_url
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      return errorResponse(res, 500, 'Image upload failed. Try without image.')
    }
  }

  const service = await Service.create({
    provider:    req.user._id,
    name:        name.trim(),
    category,
    description: description.trim(),
    price:       parseFloat(price),
    address:     address.trim(),
    location: {
      type:        'Point',
      coordinates: [parseFloat(lng) || 81.8463, parseFloat(lat) || 25.4358],
    },
    image: imageUrl,
  })

  await service.populate('provider', 'name avatar phone')
  successResponse(res, 201, 'Service created successfully', { service })
})

export const getAllServices = asyncHandler(async (req, res) => {
  const { category, q, lat, lng, radius = 10000, sort = '-rating' } = req.query
  let query = { isActive: true }

  if (category) query.category = category
  if (q) query.name = { $regex: q, $options: 'i' }

  let services

  if (lat && lng) {
    services = await Service.find({
      ...query,
      location: {
        $near: {
          $geometry:   { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    }).populate('provider', 'name avatar phone')
  } else {
    services = await Service.find(query)
      .sort(sort)
      .populate('provider', 'name avatar phone')
  }

  successResponse(res, 200, 'Services fetched', { count: services.length, services })
})

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('provider', 'name avatar phone address bio experience')
  if (!service) return errorResponse(res, 404, 'Service not found')
  successResponse(res, 200, 'Service fetched', { service })
})

export const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id)
  if (!service) return errorResponse(res, 404, 'Service not found')
  if (service.provider.toString() !== req.user._id.toString())
    return errorResponse(res, 403, 'Not authorized')

  // Image update karo agar new image aaye
  if (req.file) {
    try {
      const result = await uploadToCloudinary(req.file.buffer, 'servifind/services', {
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
      })
      req.body.image = result.secure_url
    } catch (err) {
      console.error('Image update error:', err)
    }
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
  successResponse(res, 200, 'Service updated', { service })
})

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) return errorResponse(res, 404, 'Service not found')
  if (service.provider.toString() !== req.user._id.toString())
    return errorResponse(res, 403, 'Not authorized')
  await service.deleteOne()
  successResponse(res, 200, 'Service deleted')
})

export const getMyServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id }).sort('-createdAt')
  successResponse(res, 200, 'My services fetched', { services })
})