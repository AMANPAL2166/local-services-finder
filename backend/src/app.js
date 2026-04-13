import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes    from './routes/auth.routes.js'
import serviceRoutes from './routes/service.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import reviewRoutes  from './routes/review.routes.js'
import errorHandler  from './middlewares/error.middleware.js'

const app = express()

// ─── Security Headers ───────────────────────────────────────
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))

// ─── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://local-services-finder-five.vercel.app',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body Parser ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Logger (only in dev) ───────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ─── Rate Limiters ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again after 15 minutes' },
})

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 bookings per hour
  message: { success: false, message: 'Too many bookings, please slow down' },
})

app.use('/api/v1', globalLimiter)
app.use('/api/v1/auth/login',    authLimiter)
app.use('/api/v1/auth/register', authLimiter)
app.use('/api/v1/bookings',      bookingLimiter)

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/services', serviceRoutes)
app.use('/api/v1/bookings', bookingRoutes)
app.use('/api/v1/reviews',  reviewRoutes)

// ─── Health Check ────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status:  'API running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// ─── 404 Handler ─────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler)

export default app