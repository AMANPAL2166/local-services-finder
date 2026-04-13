import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  provider:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['Plumber','Electrician','Cleaner','Carpenter','Painter','Mechanic','Tutor','Salon','Other'] },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  image:       { type: String, default: '' },
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },  // [lng, lat]
  },
  address:     { type: String, required: true },
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

serviceSchema.index({ location: '2dsphere' })
serviceSchema.index({ category: 1, isActive: 1 })

export default mongoose.model('Service', serviceSchema)