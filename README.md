<div align="center">

<img src="https://img.shields.io/badge/ServiFind-Local%20Services%20Platform-2563EB?style=for-the-badge&logoColor=white" alt="ServiFind"/>

# ServiFind — Local Services Booking Platform

**Find and book trusted local services near you — Plumbers, Electricians, Cleaners & more**

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-local--services--finder--five.vercel.app-2563EB?style=flat-square)](https://local-services-finder-five.vercel.app)
[![Backend](https://img.shields.io/badge/🚀%20Backend%20API-Render-46E3B7?style=flat-square)](https://servifind-backend-x3ze.onrender.com/api/v1/health)
[![GitHub](https://img.shields.io/badge/📁%20Source%20Code-GitHub-181717?style=flat-square&logo=github)](https://github.com/AMANPAL2166/local-services-finder)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18-000000?style=flat-square&logo=express&logoColor=white)
![Redux](https://img.shields.io/badge/Redux%20Toolkit-2.0-764ABC?style=flat-square&logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-3.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Implementation](#-security-implementation)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Key Technical Decisions](#-key-technical-decisions)

---

## 🌟 Overview

ServiFind is a **production-deployed, full-stack MERN application** that connects customers with local service providers. Built with a focus on real-world engineering practices — geo-spatial search, role-based access control, real-time updates, and production security.

### The Problem
Finding reliable local service providers (plumbers, electricians, cleaners) is fragmented — no single platform exists for discovery, booking, and management in tier-2/3 Indian cities.

### The Solution
A marketplace platform where:
- **Customers** can search nearby services, view profiles, book appointments, and leave reviews
- **Service Providers** can list services, manage bookings, track earnings, and build their reputation

---

## 🌐 Live Demo

| Link | Description |
|------|-------------|
| 🌐 [Frontend App](https://local-services-finder-five.vercel.app) | React app deployed on Vercel |
| 🚀 [Backend API](https://servifind-backend-x3ze.onrender.com/api/v1/health) | Express API deployed on Render |
| 📁 [GitHub Repository](https://github.com/AMANPAL2166/local-services-finder) | Full source code |

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| 👤 Customer | aman@servifind.com | password123 |
| 🔧 Provider (Plumber) | ravi@servifind.com | password123 |
| 🧹 Provider (Cleaner) | priya@servifind.com | password123 |

---

## ✨ Features

### Customer Features
- 🔍 **Geo-based search** — find services within custom radius using browser geolocation
- 🗂️ **Category browsing** — filter by Plumber, Electrician, Cleaner, Carpenter, etc.
- 📅 **3-step booking flow** — date/time slot selection → personal details → confirmation
- ⭐ **Ratings & reviews** — leave reviews after completed bookings
- 👤 **Profile dashboard** — booking history with real-time status tracking
- 📸 **Avatar upload** — Cloudinary-powered profile photo

### Provider Features
- 🔧 **Service management** — add/edit/toggle services with image upload
- 📊 **Provider dashboard** — earnings stats, booking analytics, rating breakdown
- ✅ **Booking controls** — accept, decline, or mark bookings complete
- 👤 **Profile setup** — bio, experience, service area configuration

### Platform Features
- 🔐 **Role-based auth** — JWT with separate customer and provider flows
- 🌍 **Real-time updates** — Socket.io for live booking status notifications
- 📱 **Fully responsive** — mobile-first design with Tailwind CSS
- 🛡️ **Production security** — rate limiting, helmet, input validation, CORS

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│         React + Vite  ·  Redux Toolkit  ·  Tailwind     │
│              Deployed on Vercel (CDN)                   │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS + REST + WebSocket
┌─────────────────────▼───────────────────────────────────┐
│                    API GATEWAY                          │
│     Express.js  ·  Helmet  ·  CORS  ·  Rate Limiter     │
│              Deployed on Render                         │
├─────────────────────────────────────────────────────────┤
│                  MIDDLEWARE CHAIN                        │
│    JWT Auth  ·  Role Guard  ·  Validation  ·  Multer    │
├───────────────┬────────────────────┬────────────────────┤
│  Auth Routes  │  Service Routes    │  Booking Routes    │
│  /api/v1/auth │  /api/v1/services  │  /api/v1/bookings  │
└───────────────┴────────────────────┴────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                   DATA LAYER                            │
│  MongoDB Atlas  ·  2dsphere Index  ·  Mongoose ODM      │
└─────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│               EXTERNAL SERVICES                         │
│  Cloudinary (Images)  ·  Socket.io (Real-time)          │
└─────────────────────────────────────────────────────────┘
```

### Request Flow
```
User clicks "Near me"
    → Browser Geolocation API → [lat, lng]
    → GET /api/v1/services?lat=25.44&lng=81.84&radius=10000
    → MongoDB $near query on 2dsphere index
    → Returns sorted services by distance
    → React renders service cards
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool & dev server |
| Redux Toolkit | 2.0 | Global state management |
| React Router | 6 | Client-side routing |
| Axios | 1.6 | HTTP client with interceptors |
| Tailwind CSS | 3.0 | Utility-first styling |
| Socket.io Client | 4.6 | Real-time communication |
| React Hot Toast | 2.4 | Notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22 | Runtime environment |
| Express.js | 4.18 | Web framework |
| Mongoose | 8.0 | MongoDB ODM |
| JSON Web Token | 9.0 | Authentication |
| bcryptjs | 2.4 | Password hashing |
| Multer | 1.4 | File upload handling |
| Cloudinary | 1.41 | Media storage & CDN |
| Socket.io | 4.6 | Real-time engine |
| Helmet | 7.1 | Security headers |
| express-rate-limit | 7.0 | Rate limiting |
| express-validator | 7.0 | Input validation |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database with replica set |
| Cloudinary | Image storage, transformation & CDN |
| Vercel | Frontend hosting with global CDN |
| Render | Backend hosting with auto-deploy |
| GitHub | Version control & CI/CD trigger |

---

## 📡 API Documentation

### Authentication
```
POST   /api/v1/auth/register   → Register new user (customer/provider)
POST   /api/v1/auth/login      → Login, returns JWT token
POST   /api/v1/auth/logout     → Clear auth cookie
GET    /api/v1/auth/me         → Get current user [Protected]
PUT    /api/v1/auth/profile    → Update profile [Protected]
PUT    /api/v1/auth/avatar     → Upload avatar to Cloudinary [Protected]
```

### Services
```
GET    /api/v1/services                 → List all services (with geo filter)
GET    /api/v1/services?lat=&lng=&radius=  → Geo-based search
GET    /api/v1/services?category=&q=   → Filter by category/search
GET    /api/v1/services/:id            → Get service detail
GET    /api/v1/services/mine           → Provider's services [Provider only]
POST   /api/v1/services                → Create service + image [Provider only]
PUT    /api/v1/services/:id            → Update service [Provider only]
DELETE /api/v1/services/:id            → Delete service [Provider only]
```

### Bookings
```
POST   /api/v1/bookings              → Create booking [Customer only]
GET    /api/v1/bookings/my           → Customer's bookings [Protected]
GET    /api/v1/bookings/provider     → Provider's bookings [Provider only]
PUT    /api/v1/bookings/:id/status   → Update status (confirm/complete/cancel)
```

### Reviews
```
POST   /api/v1/reviews                     → Create review [Protected]
GET    /api/v1/reviews/service/:serviceId  → Get reviews for service
```

### Sample Response
```json
{
  "success": true,
  "message": "Services fetched",
  "data": {
    "count": 12,
    "services": [
      {
        "_id": "665abc123...",
        "name": "Ravi Plumbing Works",
        "category": "Plumber",
        "price": 299,
        "rating": 4.8,
        "totalReviews": 124,
        "location": {
          "type": "Point",
          "coordinates": [81.8463, 25.4610]
        },
        "provider": {
          "name": "Ravi Kumar",
          "phone": "9876543210"
        }
      }
    ]
  }
}
```

---

## 🗄️ Database Schema

### Collections Overview
```
users          → Authentication, profiles, roles
services       → Service listings with geo-location
bookings       → Appointment records with status
reviews        → Ratings and comments
messages       → Real-time chat (Socket.io)
```

### Key Schema Design

**User Model**
```javascript
{
  name:       String (required),
  email:      String (unique, lowercase),
  password:   String (bcrypt hashed, select: false),
  role:       Enum ['user', 'provider', 'admin'],
  phone:      String,
  avatar:     String (Cloudinary URL),
  bio:        String,        // Provider profile
  experience: String,        // Provider experience
}
```

**Service Model — with geo-spatial index**
```javascript
{
  provider:    ObjectId → User,
  name:        String,
  category:    Enum [8 categories],
  description: String,
  price:       Number,
  image:       String (Cloudinary URL),
  location: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number]    // [longitude, latitude]
  },
  rating:      Number,
  totalReviews: Number,
  isActive:    Boolean,
}
// Index: { location: '2dsphere' }
```

**Booking Model**
```javascript
{
  user:     ObjectId → User,
  service:  ObjectId → Service,
  provider: ObjectId → User,
  date:     String,
  timeSlot: String,
  address:  String,
  phone:    String,
  price:    Number,
  status:   Enum ['pending', 'confirmed', 'completed', 'cancelled'],
}
```

---

## 🔐 Security Implementation

```
Layer 1 — Transport:    HTTPS only, Helmet.js security headers
Layer 2 — Auth:         JWT (7d expiry) in httpOnly + sameSite:strict cookies
Layer 3 — Rate Limit:   Auth: 10 req/15min | API: 100 req/15min | Booking: 20/hr
Layer 4 — Validation:   express-validator on all routes (type, length, format)
Layer 5 — Authorization: Role-based middleware (customer/provider/admin)
Layer 6 — CORS:         Whitelist only production frontend URL
Layer 7 — Passwords:    bcrypt with 12 salt rounds
```

**Security Headers (Helmet)**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: configured
```

---

## 🚀 Getting Started

### Prerequisites
```bash
node --version   # v18+
npm --version    # v9+
```

### 1. Clone the repository
```bash
git clone https://github.com/AMANPAL2166/local-services-finder.git
cd local-services-finder
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env    # Fill in your environment variables
npm run dev             # Starts on http://localhost:8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env    # Fill in your environment variables
npm run dev             # Starts on http://localhost:5173
```

### 4. Seed Sample Data
```bash
cd backend
npm run seed    # Creates 9 users + 12 services in MongoDB
```

### 5. Open the app
```
Frontend:  http://localhost:5173
Backend:   http://localhost:8000/api/v1/health
```

---

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/localservices
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your_maps_api_key
```

---

## 📦 Deployment

### Frontend → Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Environment variables in Vercel Dashboard:
# VITE_API_URL = https://your-backend.onrender.com/api/v1
```

### Backend → Render
```
1. Connect GitHub repo to Render
2. Root Directory: backend
3. Build Command: npm install
4. Start Command: node src/server.js
5. Add all environment variables
```

### `vercel.json` (SPA routing fix)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 💡 Key Technical Decisions

### 1. Why MongoDB over SQL?
- Services have **variable attributes** (plumber needs tools list, tutor needs subjects)
- **Native geo-spatial queries** with 2dsphere index — no PostGIS extension needed
- **Horizontal scaling** via Atlas sharding when needed

### 2. Why JWT over Sessions?
- **Stateless** — enables horizontal scaling without shared session store
- **Mobile-friendly** — can be sent in Authorization header
- Stored in **httpOnly cookies** for XSS protection

### 3. Geo-search Implementation
```javascript
// Key insight: MongoDB coordinates are [longitude, latitude] NOT [latitude, longitude]
Service.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: 10000  // meters
    }
  }
})
// Requires 2dsphere index — queries without index return empty results silently
```

### 4. Image Upload Architecture
```
Client → Multer (memory storage) → Buffer → Cloudinary upload_stream → secure_url → MongoDB
```
Memory storage chosen over disk storage for **serverless compatibility** on Render.

### 5. Real-time with Socket.io
```javascript
// User-specific rooms — provider notifies specific customer
socket.join(userId)           // Each user joins own room
io.to(customerId).emit(...)   // Direct message to customer
```

---

## 📁 Project Structure

```
local-services-finder/
├── backend/
│   └── src/
│       ├── config/          # DB, Cloudinary config
│       ├── controllers/     # Request handlers
│       ├── middlewares/     # Auth, error, validation
│       ├── models/          # Mongoose schemas
│       ├── routes/          # API route definitions
│       ├── utils/           # asyncHandler, apiResponse
│       ├── sockets/         # Socket.io events
│       ├── app.js           # Express app setup
│       └── server.js        # HTTP + Socket.io server
│
└── frontend/
    └── src/
        ├── api/             # Axios instances per module
        ├── components/      # Reusable UI components
        ├── hooks/           # Custom React hooks
        ├── pages/           # Route-level components (8 pages)
        ├── redux/           # Store, slices (auth, services)
        ├── utils/           # Helper functions
        ├── App.jsx          # Router setup
        └── main.jsx         # Redux Provider + App entry
```

---

## 🗺️ Roadmap

- [ ] Razorpay payment gateway integration
- [ ] Redis caching for popular services
- [ ] Push notifications (Firebase FCM)
- [ ] Admin panel for platform management
- [ ] Provider-customer real-time chat
- [ ] Unit & integration tests (Jest + Supertest)
- [ ] Docker containerization
- [ ] CI/CD with GitHub Actions

---

## 👨‍💻 Author

**Aman Pal**

[![GitHub](https://img.shields.io/badge/GitHub-AMANPAL2166-181717?style=flat-square&logo=github)](https://github.com/AMANPAL2166)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/your-profile)

---

<div align="center">

**⭐ If this project helped you, please star it on GitHub!**

Built with ❤️ using MERN Stack

</div>
