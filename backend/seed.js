import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import Venue from './models/Venue.js'

dotenv.config()

const sampleVenues = [
  {
    name: 'Grand Convention Centre',
    description: 'A premium banquet hall perfect for weddings, corporate events, and large gatherings. Features state-of-the-art sound systems and elegant decor.',
    category: 'Banquet Hall',
    location: { city: 'Kochi', state: 'Kerala', address: 'MG Road, Ernakulam, Kochi 682011', lat: 9.9312, lng: 76.2673 },
    price: 25000,
    capacity: 500,
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System', 'Catering', 'Photography'],
    packages: [
      { name: 'Venue Only', description: 'Just the hall', price: 25000, includes: ['Hall', 'Parking', 'AC'] },
      { name: 'Full Package', description: 'Hall + catering + decoration', price: 42000, includes: ['Hall', 'Parking', 'AC', 'Catering', 'Decoration'] }
    ],
    status: 'approved',
    verified: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    name: 'Beach Pavilion',
    description: 'A stunning outdoor venue right on the beach. Ideal for sunset weddings, birthday parties, and cultural events.',
    category: 'Outdoor',
    location: { city: 'Kozhikode', state: 'Kerala', address: 'Beach Road, Kozhikode 673001', lat: 11.2588, lng: 75.7804 },
    price: 18000,
    capacity: 300,
    amenities: ['Parking', 'Sound System', 'Catering', 'Photography'],
    packages: [
      { name: 'Venue Only', description: 'Outdoor space only', price: 18000, includes: ['Outdoor Space', 'Parking'] }
    ],
    status: 'approved',
    verified: false,
    rating: 4.6,
    reviews: 89,
  },
  {
    name: 'Heritage Wedding Hall',
    description: 'A majestic heritage hall with traditional architecture and modern amenities. The most sought-after wedding venue in the city.',
    category: 'Wedding',
    location: { city: 'Thrissur', state: 'Kerala', address: 'Swaraj Round, Thrissur 680001', lat: 10.5276, lng: 76.2144 },
    price: 32000,
    capacity: 800,
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System', 'Catering', 'Photography', 'Decoration'],
    packages: [
      { name: 'Venue Only', description: 'Hall only', price: 32000, includes: ['Hall', 'Parking', 'AC'] },
      { name: 'Silver', description: 'Hall + catering', price: 42000, includes: ['Hall', 'Parking', 'AC', 'Catering'] },
      { name: 'Gold', description: 'Hall + catering + decoration + photography', price: 58000, includes: ['Hall', 'Parking', 'AC', 'Catering', 'Decoration', 'Photography'] }
    ],
    status: 'approved',
    verified: true,
    rating: 4.9,
    reviews: 201,
  },
  {
    name: 'Grand Ballroom',
    description: 'A luxurious ballroom for grand weddings and large celebrations with crystal chandeliers and marble flooring.',
    category: 'Wedding',
    location: { city: 'Thiruvananthapuram', state: 'Kerala', address: 'MG Road, Thiruvananthapuram 695001', lat: 8.5241, lng: 76.9366 },
    price: 45000,
    capacity: 1000,
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System', 'Catering', 'Photography', 'Decoration'],
    packages: [
      { name: 'Venue Only', description: 'Hall only', price: 45000, includes: ['Hall', 'Parking', 'AC'] }
    ],
    status: 'approved',
    verified: true,
    rating: 4.7,
    reviews: 156,
  },
  {
    name: 'Urban Cafe Studio',
    description: 'A cozy cafe studio perfect for small gatherings, birthday parties, and photo shoots.',
    category: 'Cafe',
    location: { city: 'Kozhikode', state: 'Kerala', address: 'SM Street, Kozhikode 673001', lat: 11.2588, lng: 75.7804 },
    price: 8000,
    capacity: 80,
    amenities: ['WiFi', 'AC'],
    packages: [
      { name: 'Venue Only', description: 'Studio space', price: 8000, includes: ['Studio', 'AC'] }
    ],
    status: 'approved',
    verified: false,
    rating: 4.5,
    reviews: 67,
  },
  {
    name: 'Garden Resort',
    description: 'A scenic garden resort with lush greenery, ideal for outdoor weddings and nature-themed events.',
    category: 'Outdoor',
    location: { city: 'Palakkad', state: 'Kerala', address: 'Garden Road, Palakkad 678001', lat: 10.7867, lng: 76.6548 },
    price: 22000,
    capacity: 400,
    amenities: ['Parking', 'Sound System', 'Catering'],
    packages: [
      { name: 'Venue Only', description: 'Garden space', price: 22000, includes: ['Garden', 'Parking'] }
    ],
    status: 'approved',
    verified: true,
    rating: 4.4,
    reviews: 43,
  },
  {
    name: 'Cultural Auditorium',
    description: 'A spacious auditorium perfect for cultural events, conferences, and stage performances.',
    category: 'Auditorium',
    location: { city: 'Kannur', state: 'Kerala', address: 'Fort Road, Kannur 670001', lat: 11.8745, lng: 75.3704 },
    price: 15000,
    capacity: 600,
    amenities: ['WiFi', 'Parking', 'AC', 'Sound System'],
    packages: [
      { name: 'Venue Only', description: 'Auditorium space', price: 15000, includes: ['Auditorium', 'Sound System'] }
    ],
    status: 'approved',
    verified: true,
    rating: 4.6,
    reviews: 78,
  },
  {
    name: 'Birthday Barn',
    description: 'A fun and colorful venue specially designed for birthday parties and kids events.',
    category: 'Birthday',
    location: { city: 'Kottayam', state: 'Kerala', address: 'KK Road, Kottayam 686001', lat: 9.5916, lng: 76.5222 },
    price: 12000,
    capacity: 150,
    amenities: ['Parking', 'Sound System', 'Catering'],
    packages: [
      { name: 'Venue Only', description: 'Hall only', price: 12000, includes: ['Hall', 'Parking'] }
    ],
    status: 'approved',
    verified: false,
    rating: 4.3,
    reviews: 34,
  },
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected for seeding...')

    // Clear existing data
    await Venue.deleteMany({})
    await User.deleteMany({ email: { $regex: '@bookmyvenue-demo.com' } })
    console.log('Cleared old demo data')

    // Create a demo owner account for all sample venues
    const owner = await User.create({
      name: 'Demo Venue Owner',
      email: 'owner@bookmyvenue-demo.com',
      phone: '9876543210',
      password: 'demo1234',
      role: 'owner',
      businessName: 'Demo Properties'
    })
    console.log('Created demo owner account')

    // Attach owner to each venue and insert
    const venuesWithOwner = sampleVenues.map(v => ({ ...v, owner: owner._id }))
    await Venue.insertMany(venuesWithOwner)
    console.log(`Inserted ${venuesWithOwner.length} sample venues`)

    console.log('Seeding complete!')
    process.exit(0)

  } catch (error) {
    console.error('Seeding failed:', error.message)
    process.exit(1)
  }
}

seedDatabase()