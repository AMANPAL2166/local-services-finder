import Booking from '../models/Booking.model.js'
import Service from '../models/Service.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, date, timeSlot, address, phone, notes } = req.body
  const service = await Service.findById(serviceId)
  if (!service) return errorResponse(res, 404, 'Service not found')

  const booking = await Booking.create({
    user:     req.user._id,
    service:  serviceId,
    provider: service.provider,
    date, timeSlot, address, phone, notes,
    price: service.price,
  })

  await booking.populate(['service', 'provider'])
  successResponse(res, 201, 'Booking created', { booking })
})

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('service', 'name image category')
    .populate('provider', 'name phone')
    .sort('-createdAt')
  successResponse(res, 200, 'Bookings fetched', { bookings })
})

export const getProviderBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ provider: req.user._id })
    .populate('service', 'name category')
    .populate('user', 'name phone')
    .sort('-createdAt')
  successResponse(res, 200, 'Provider bookings fetched', { bookings })
})

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const booking = await Booking.findById(req.params.id)
  if (!booking) return errorResponse(res, 404, 'Booking not found')

  const isProvider = booking.provider.toString() === req.user._id.toString()
  const isUser     = booking.user.toString()     === req.user._id.toString()
  if (!isProvider && !isUser) return errorResponse(res, 403, 'Not authorized')

  booking.status = status
  await booking.save()
  successResponse(res, 200, 'Booking updated', { booking })
})