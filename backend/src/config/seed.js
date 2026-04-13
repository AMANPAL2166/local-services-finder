import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.model.js'
import Service from '../models/Service.model.js'

const USERS = [
  { name: 'Ravi Kumar',    email: 'ravi@servifind.com',    password: 'password123', role: 'provider', phone: '9876543210' },
  { name: 'Suresh Sharma', email: 'suresh@servifind.com',  password: 'password123', role: 'provider', phone: '9123456789' },
  { name: 'Priya Singh',   email: 'priya@servifind.com',   password: 'password123', role: 'provider', phone: '9988776655' },
  { name: 'Mohan Lal',     email: 'mohan@servifind.com',   password: 'password123', role: 'provider', phone: '9012345678' },
  { name: 'Ajay Verma',    email: 'ajay@servifind.com',    password: 'password123', role: 'provider', phone: '8877665544' },
  { name: 'Rahul Gupta',   email: 'rahul@servifind.com',   password: 'password123', role: 'provider', phone: '7766554433' },
  { name: 'Neha Tiwari',   email: 'neha@servifind.com',    password: 'password123', role: 'provider', phone: '9654321087' },
  { name: 'Suman Devi',    email: 'suman@servifind.com',   password: 'password123', role: 'provider', phone: '8899001122' },
  { name: 'Aman Pal',      email: 'aman@servifind.com',    password: 'password123', role: 'user',     phone: '9999988888' },
]

const SERVICES = (providers) => [
  {
    provider:    providers[0]._id,
    name:        'Ravi Plumbing Works',
    category:    'Plumber',
    description: 'Expert plumbing services with 10+ years experience. Leak repair, pipe fitting, bathroom installation and more. Available 7 days a week.',
    price:       299,
    address:     'Civil Lines, Prayagraj',
    image:       'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8463, 25.4610] },
    rating:      4.8,
    totalReviews: 124,
    isActive:    true,
  },
  {
    provider:    providers[1]._id,
    name:        'Sharma Electricals',
    category:    'Electrician',
    description: 'Licensed electrician for wiring, switchboard, inverter installation and all electrical work. Safety first approach.',
    price:       349,
    address:     'Katra, Prayagraj',
    image:       'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8400, 25.4500] },
    rating:      4.6,
    totalReviews: 89,
    isActive:    true,
  },
  {
    provider:    providers[2]._id,
    name:        'CleanPro Services',
    category:    'Cleaner',
    description: 'Deep cleaning, home sanitization, sofa and carpet cleaning with eco-friendly products. Trained professional team.',
    price:       499,
    address:     'George Town, Prayagraj',
    image:       'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8530, 25.4720] },
    rating:      4.9,
    totalReviews: 210,
    isActive:    true,
  },
  {
    provider:    providers[3]._id,
    name:        'WoodCraft Carpentry',
    category:    'Carpenter',
    description: 'Custom furniture, door/window repair, modular kitchen installation and woodwork of all kinds.',
    price:       599,
    address:     'Mumfordganj, Prayagraj',
    image:       'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8600, 25.4580] },
    rating:      4.5,
    totalReviews: 67,
    isActive:    true,
  },
  {
    provider:    providers[4]._id,
    name:        'ColorMaster Painters',
    category:    'Painter',
    description: 'Interior and exterior painting, waterproofing, texture and wall design. Premium quality paints used.',
    price:       449,
    address:     'Naini, Prayagraj',
    image:       'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8900, 25.4400] },
    rating:      4.7,
    totalReviews: 98,
    isActive:    true,
  },
  {
    provider:    providers[5]._id,
    name:        'QuickFix Mechanics',
    category:    'Mechanic',
    description: 'Two-wheeler and four-wheeler repair, servicing, and emergency roadside assistance. Doorstep service available.',
    price:       399,
    address:     'Jhunsi, Prayagraj',
    image:       'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.9000, 25.4650] },
    rating:      4.4,
    totalReviews: 156,
    isActive:    true,
  },
  {
    provider:    providers[6]._id,
    name:        'BrightMinds Tutor',
    category:    'Tutor',
    description: 'Home tuition for Class 6–12, JEE/NEET coaching, and spoken English classes by IIT graduate.',
    price:       199,
    address:     'Allenganj, Prayagraj',
    image:       'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8350, 25.4480] },
    rating:      4.9,
    totalReviews: 311,
    isActive:    true,
  },
  {
    provider:    providers[7]._id,
    name:        'GlamourCut Salon',
    category:    'Salon',
    description: 'Haircut, facial, waxing, threading and bridal makeup at home by certified beautician.',
    price:       249,
    address:     'Tagore Town, Prayagraj',
    image:       'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8250, 25.4550] },
    rating:      4.6,
    totalReviews: 178,
    isActive:    true,
  },
  {
    provider:    providers[0]._id,
    name:        'AquaFix Plumbing',
    category:    'Plumber',
    description: 'Motor fitting, water tank cleaning, drainage and pipeline services at affordable rates.',
    price:       259,
    address:     'Phaphamau, Prayagraj',
    image:       'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8100, 25.4800] },
    rating:      4.3,
    totalReviews: 55,
    isActive:    true,
  },
  {
    provider:    providers[1]._id,
    name:        'PowerSafe Electricals',
    category:    'Electrician',
    description: 'CCTV installation, smart home wiring, solar panel setup and all electrical repairs.',
    price:       399,
    address:     'Colonelganj, Prayagraj',
    image:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8450, 25.4620] },
    rating:      4.5,
    totalReviews: 73,
    isActive:    true,
  },
  {
    provider:    providers[2]._id,
    name:        'SparkleHome Cleaners',
    category:    'Cleaner',
    description: 'Post-construction cleaning, office cleaning, kitchen degreasing and bathroom sanitization.',
    price:       599,
    address:     'Lukerganj, Prayagraj',
    image:       'https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8480, 25.4670] },
    rating:      4.7,
    totalReviews: 142,
    isActive:    true,
  },
  {
    provider:    providers[4]._id,
    name:        'WallArt Painters',
    category:    'Painter',
    description: '3D wall art, stencil painting, weather shield coating and complete home painting packages.',
    price:       349,
    address:     'Civil Lines, Prayagraj',
    image:       'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80',
    location:    { type: 'Point', coordinates: [81.8470, 25.4600] },
    rating:      4.6,
    totalReviews: 88,
    isActive:    true,
  },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected ✅')

    // Clear existing data
    await User.deleteMany({})
    await Service.deleteMany({})
    console.log('Cleared existing data 🗑️')

    // Create users (password hashing handled by pre-save hook)
    const createdUsers = await User.insertMany(
      await Promise.all(
        USERS.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 12),
        }))
      )
    )
    console.log(`Created ${createdUsers.length} users 👤`)

    // Separate providers
    const providers = createdUsers.filter(u => u.role === 'provider')

    // Create services
    const createdServices = await Service.insertMany(SERVICES(providers))
    console.log(`Created ${createdServices.length} services 🔧`)

    console.log('\n✅ Seed complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Test accounts (password: password123)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Customer  → aman@servifind.com')
    console.log('Provider  → ravi@servifind.com')
    console.log('Provider  → priya@servifind.com')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed ❌', err)
    process.exit(1)
  }
}

seed()