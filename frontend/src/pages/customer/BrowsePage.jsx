import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, MapPin, Star, Users, Filter, X, ChevronDown, CheckCircle } from 'lucide-react'

const CATEGORIES = ['All', 'Wedding', 'Birthday', 'Banquet Hall', 'Outdoor', 'Auditorium', 'Cafe', 'Studio']

const SAMPLE_VENUES = [
  { id: '1', name: 'Kochi Convention Centre', location: 'Ernakulam', category: 'Banquet Hall', price: 25000, capacity: 500, rating: 4.8, reviews: 124, verified: true, lat: 9.9312, lng: 76.2673 },
  { id: '2', name: 'Beach Pavilion Kozhikode', location: 'Kozhikode', category: 'Outdoor', price: 18000, capacity: 300, rating: 4.6, reviews: 89, verified: false, lat: 11.2588, lng: 75.7804 },
  { id: '3', name: 'Thrissur Heritage Hall', location: 'Thrissur', category: 'Wedding', price: 32000, capacity: 800, rating: 4.9, reviews: 201, verified: true, lat: 10.5276, lng: 76.2144 },
  { id: '4', name: 'Trivandrum Grand Ballroom', location: 'Thiruvananthapuram', category: 'Wedding', price: 45000, capacity: 1000, rating: 4.7, reviews: 156, verified: true, lat: 8.5241, lng: 76.9366 },
  { id: '5', name: 'Calicut Cafe Studio', location: 'Kozhikode', category: 'Cafe', price: 8000, capacity: 80, rating: 4.5, reviews: 67, verified: false, lat: 11.2588, lng: 75.7804 },
  { id: '6', name: 'Palakkad Garden Resort', location: 'Palakkad', category: 'Outdoor', price: 22000, capacity: 400, rating: 4.4, reviews: 43, verified: true, lat: 10.7867, lng: 76.6548 },
  { id: '7', name: 'Kannur Cultural Auditorium', location: 'Kannur', category: 'Auditorium', price: 15000, capacity: 600, rating: 4.6, reviews: 78, verified: true, lat: 11.8745, lng: 75.3704 },
  { id: '8', name: 'Kottayam Birthday Barn', location: 'Kottayam', category: 'Birthday', price: 12000, capacity: 150, rating: 4.3, reviews: 34, verified: false, lat: 9.5916, lng: 76.5222 },
]

// Haversine formula — calculates distance between two GPS coordinates
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const CATEGORY_EMOJIS = {
  'Wedding': '💍', 'Birthday': '🎂', 'Banquet Hall': '🏛️',
  'Outdoor': '🌿', 'Auditorium': '🎤', 'Cafe': '☕', 'Studio': '📸'
}

function BrowsePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('location') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(50000)
  const [minCapacity, setMinCapacity] = useState(0)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [venues, setVenues] = useState(SAMPLE_VENUES)

  // Near me feature — browser geolocation
  function handleNearMe() {
    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setSortBy('distance')
        setLocating(false)
      },
      () => {
        alert('Could not get your location. Please allow location access.')
        setLocating(false)
      }
    )
  }

  // Filter + sort logic
  const filtered = venues.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase())
      
      const matchCategory = activeCategory === 'All' || v.category === activeCategory
      const matchPrice = v.price <= maxPrice
      const matchCapacity = v.capacity >= minCapacity
      return matchSearch && matchCategory && matchPrice && matchCapacity
    })
    .map(v => ({
      ...v,
      distance: userLocation
        ? getDistance(userLocation.lat, userLocation.lng, v.lat, v.lng)
        : null
    }))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'distance' && a.distance && b.distance) return a.distance - b.distance
      return 0
    })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── SEARCH HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 items-center">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                placeholder="Search venues or locations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Near me button */}
            <button
              onClick={handleNearMe}
              disabled={locating}
              className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-sm font-medium px-4 py-3 rounded-xl transition-colors"
            >
              <MapPin size={16} />
              {locating ? 'Locating...' : 'Near me'}
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border text-sm font-medium px-4 py-3 rounded-xl transition-colors ${
                showFilters
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
              }`}
            >
              <Filter size={16} />
              Filters
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-3 pr-8 rounded-xl outline-none cursor-pointer hover:border-teal-300 transition-colors"
              >
                <option value="rating">Top rated</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                {userLocation && <option value="distance">Nearest first</option>}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap gap-6">
              <div className="flex-1 min-w-48">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Max price: ₹{maxPrice.toLocaleString()}
                </p>
                <input
                  type="range" min="5000" max="50000" step="1000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹5,000</span><span>₹50,000</span>
                </div>
              </div>
              <div className="flex-1 min-w-48">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Min capacity: {minCapacity} guests
                </p>
                <input
                  type="range" min="0" max="1000" step="50"
                  value={minCapacity}
                  onChange={e => setMinCapacity(Number(e.target.value))}
                  className="w-full accent-teal-700"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span><span>1000+</span>
                </div>
              </div>
              <button
                onClick={() => { setMaxPrice(50000); setMinCapacity(0) }}
                className="text-sm text-red-500 hover:underline self-end"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-all ${
                activeCategory === cat
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'
              }`}
            >
              {cat !== 'All' && <span>{CATEGORY_EMOJIS[cat]}</span>}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-800">{filtered.length}</span> venues found
            {activeCategory !== 'All' && ` in ${activeCategory}`}
            {search && ` for "${search}"`}
          </p>
          {userLocation && (
            <p className="text-xs text-teal-600 flex items-center gap-1">
              <MapPin size={12} /> Sorted by distance from you
            </p>
          )}
        </div>

        {/* Venue grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-700 mb-2">No venues found</p>
            <p className="text-sm text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); setMaxPrice(50000); setMinCapacity(0) }}
              className="bg-teal-700 text-white text-sm font-medium px-6 py-3 rounded-xl"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(venue => (
              <div
                key={venue.id}
                onClick={() => navigate(`/venue/${venue.id}`)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group"
              >
                {/* Image */}
                <div className="h-44 bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center relative">
                  <span className="text-5xl">{CATEGORY_EMOJIS[venue.category] || '🏛️'}</span>
                  {venue.verified && (
                    <span className="absolute top-3 left-3 bg-white text-teal-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                  {venue.distance && (
                    <span className="absolute top-3 right-3 bg-white text-gray-700 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                      {venue.distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                      {venue.name}
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {venue.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin size={11} /> {venue.location}
                  </p>

                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> Up to {venue.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      {venue.rating} ({venue.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-bold text-teal-700">
                        ₹{venue.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">/day</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/venue/${venue.id}`) }}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrowsePage