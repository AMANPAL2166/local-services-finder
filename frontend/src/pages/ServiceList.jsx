import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi'
import { getAllServicesApi } from '../api/serviceApi'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Plumber', 'Electrician', 'Cleaner', 'Carpenter', 'Painter', 'Mechanic', 'Tutor', 'Salon']

const ServiceList = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery]             = useState(searchParams.get('q') || '')
  const [category, setCategory]       = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy]           = useState('rating')
  const [maxPrice, setMaxPrice]       = useState(1000)
  const [showFilters, setShowFilters] = useState(false)
  const [services, setServices]       = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const res = await getAllServicesApi({
          q: query,
          category: category !== 'All' ? category : '',
          sort: sortBy === 'rating'     ? '-rating' :
                sortBy === 'price_low'  ? 'price' :
                sortBy === 'price_high' ? '-price' : '-totalReviews',
        })
        let result = res.data.data.services.filter(s => s.price <= maxPrice)
        setServices(result)
      } catch {
        toast.error('Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [query, category, sortBy, maxPrice])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP BAR */}
      <div className="bg-white shadow-sm sticky top-[60px] z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center flex-1 bg-gray-100 rounded-xl px-3 py-2 gap-2">
            <FiSearch className="text-gray-400 shrink-0" />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search services..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700"
            />
          </div>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white text-gray-600"
          >
            <option value="rating">Top Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="reviews">Most Reviewed</option>
          </select>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition ${
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <FiFilter size={14} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="max-w-6xl mx-auto mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Max Price: ₹{maxPrice}
            </p>
            <input type="range" min="100" max="1000" step="50"
              value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹100</span><span>₹1000</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* CATEGORY PILLS */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-full border font-medium transition ${
                category === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* RESULTS COUNT */}
        <p className="text-sm text-gray-500 mt-4 mb-5">
          Showing <span className="font-semibold text-gray-700">{services.length}</span> services
          {category !== 'All' && <> in <span className="font-semibold text-blue-600">{category}</span></>}
        </p>

        {/* GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg">No services found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id}
                onClick={() => navigate(`/services/${service._id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80'}
                  alt={service.name} className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 mt-2">{service.name}</h3>
                  <div className="text-yellow-400 text-sm mt-1">
                    {'★'.repeat(Math.floor(service.rating || 0))}
                    {'☆'.repeat(5 - Math.floor(service.rating || 0))}
                    <span className="text-gray-500 ml-1 text-xs">{service.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{service.totalReviews} reviews</p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FiMapPin size={11} />{service.address}
                    </div>
                    <span className="text-blue-600 font-bold">₹{service.price}</span>
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

export default ServiceList