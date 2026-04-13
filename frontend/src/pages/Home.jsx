import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiMapPin } from 'react-icons/fi'
import { getAllServicesApi } from '../api/serviceApi'
import toast from 'react-hot-toast'
import usePageTitle from '../hooks/usePageTitle'

const CATEGORIES = [
  { label: 'Plumber',     icon: '🔧' },
  { label: 'Electrician', icon: '⚡' },
  { label: 'Cleaner',     icon: '🧹' },
  { label: 'Carpenter',   icon: '🪚' },
  { label: 'Painter',     icon: '🎨' },
  { label: 'Mechanic',    icon: '🔩' },
  { label: 'Tutor',       icon: '📚' },
  { label: 'Salon',       icon: '💇' },
]


const StarRating = ({ rating }) => (
  <span className="text-yellow-400 text-sm">
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span className="text-gray-500 ml-1 text-xs">{rating}</span>
  </span>
)

const ServiceCard = ({ service, onClick }) => (
  <div onClick={onClick}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
  >
    <img
      src={service.image || 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80'}
      alt={service.name} className="w-full h-44 object-cover"
    />
    <div className="p-4">
      <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{service.category}</span>
      <h3 className="font-semibold text-gray-800 mt-2 text-base">{service.name}</h3>
      <StarRating rating={service.rating || 0} />
      <p className="text-xs text-gray-400 mt-0.5">{service.totalReviews || 0} reviews</p>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <FiMapPin size={12} /><span>{service.address}</span>
        </div>
        <span className="text-blue-600 font-bold text-sm">₹{service.price}</span>
      </div>
    </div>
  </div>
)

const Home = () => {
  const [query, setQuery]               = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [services, setServices]         = useState([])
  const [loading, setLoading]           = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchServices()
  }, [activeCategory])

  const fetchServices = async (params = {}) => {
    setLoading(true)
    try {
      const res = await getAllServicesApi({ category: activeCategory, ...params })
      setServices(res.data.data.services)
    } catch {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/services?q=${query}&category=${activeCategory}`)
  }

  const handleGeoLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => navigate(`/services?lat=${coords.latitude}&lng=${coords.longitude}`),
      () => toast.error('Could not get location')
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Find trusted services<br />near you
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Plumbers, electricians, cleaners & more — book in minutes
          </p>
          <form onSubmit={handleSearch}
            className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden px-4 py-2 gap-2"
          >
            <FiSearch className="text-gray-400 shrink-0" size={20} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search plumber, cleaner, tutor..."
              className="flex-1 text-gray-700 text-sm outline-none py-2 bg-transparent"
            />
            <button type="button" onClick={handleGeoLocation}
              className="flex items-center gap-1 text-xs text-blue-600 font-medium border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition shrink-0"
            >
              <FiMapPin size={13} /> Near me
            </button>
            <button type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Browse by category</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <button key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? '' : cat.label)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-medium transition ${
                activeCategory === cat.label
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            {activeCategory ? `${activeCategory}s near you` : 'Services near you'}
            <span className="ml-2 text-sm font-normal text-gray-400">({services.length} found)</span>
          </h2>
          <button onClick={() => navigate('/services')} className="text-sm text-blue-600 font-medium hover:underline">
            View all →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No services found yet. Add some from the provider dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard key={service._id} service={service}
                onClick={() => navigate(`/services/${service._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 ServiFind · Built with MERN Stack
      </footer>
    </div>
  )
}

export default Home