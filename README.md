# ServiFind — Local Services Finder

Live Demo: https://local-services-finder-five.vercel.app

## Tech Stack
- Frontend: React, Vite, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Geospatial indexing
- Auth: JWT with role-based access control
- Storage: Cloudinary
- Deployment: Vercel + Render

## Features
- Role-based auth (Customer / Provider)
- Geo-based service search
- Real-time booking system
- Image upload with Cloudinary
- Provider dashboard with earnings
- Customer booking history

## Architecture
- RESTful API with Express
- MongoDB $near operator for geo search
- Socket.io for real-time updates
- Rate limiting & input validation
