import Review from '../models/Review.model.js'
import Service from '../models/Service.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const createReview = asyncHandler(async (req, res) => {
  const { serviceId, rating, comment, bookingId } = req.body

  const existing = await Review.findOne({ user: req.user._id, service: serviceId })
  if (existing) return errorResponse(res, 400, 'You already reviewed this service')

  const review = await Review.create({
    user: req.user._id, service: serviceId,
    booking: bookingId, rating, comment,
  })

  // Recalculate avg rating
  const reviews  = await Review.find({ service: serviceId })
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  await Service.findByIdAndUpdate(serviceId, { rating: avgRating.toFixed(1), totalReviews: reviews.length })

  await review.populate('user', 'name avatar')
  successResponse(res, 201, 'Review added', { review })
})

export const getServiceReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ service: req.params.serviceId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
  successResponse(res, 200, 'Reviews fetched', { reviews })
})