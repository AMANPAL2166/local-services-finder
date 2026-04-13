import { config } from 'dotenv'
config() // SABSE PEHLE — koi bhi import se pehle

import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 8000
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  }
})

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id)
  socket.on('join_room',    (userId) => socket.join(userId))
  socket.on('send_message', ({ senderId, receiverId, message }) => {
    io.to(receiverId).emit('receive_message', { senderId, message })
  })
  socket.on('booking_update', ({ userId, booking }) => {
    io.to(userId).emit('booking_updated', booking)
  })
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id))
})

app.set('io', io)

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`)
    console.log(`Environment: ${process.env.NODE_ENV}`)
  })
})