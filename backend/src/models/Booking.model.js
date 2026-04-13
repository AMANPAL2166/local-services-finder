import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service:  { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: String, required: true },
  timeSlot: { type: String, required: true },
  address:  { type: String, required: true },
  phone:    { type: String, required: true },
  notes:    { type: String, default: '' },
  price:    { type: Number, required: true },
  status:   { type: String, enum: ['pending','confirmed','completed','cancelled'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)