import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiMapPin, FiClock, FiPhone, FiArrowLeft, FiCalendar, FiStar } from 'react-icons/fi'
import { getServiceByIdApi } from '../api/serviceApi'
import { getServiceReviewsApi, createReviewApi } from '../api/reviewApi'
import toast from 'react-hot-toast'

const ServiceDetail = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { isAuthenticated, user } = useSelector(state => state.auth)

  const [service, setService]         = useState(null)
  const [reviews, setReviews]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [reviewText, setReviewText]   = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sRes, rRes] = await Promise.all([
          getServiceByIdApi(id),
          getServiceReviewsApi(id),
        ])
        setService(sRes.data.data.service)
        setReviews(rRes.data.data.reviews)
      } catch (err) {
        console.error('ServiceDetail error:', err)
        toast.error('Failed to load service details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Login to submit a review'); return }
    if (!reviewText.trim()) { toast.error('Write something first'); return }
    setSubmitting(true)
    try {
      const res = await createReviewApi({
        serviceId: id,
        rating:    reviewRating,
        comment:   reviewText,
      })
      setReviews(prev => [res.data.data.review, ...prev])
      setReviewText('')
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book')
      navigate('/login')
      return
    }
    if (user?.role === 'provider') {
      toast.error('Providers cannot book services')
      return
    }
    navigate(`/book/${id}`)
  }

  // LOADING STATE
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )

  // NOT FOUND STATE
  if (!service) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-xl font-semibold text-gray-600">Service not found</p>
        <button
          onClick={() => navigate('/services')}
          className="mt-4 text-blue-600 text-sm hover:underline"
        >
          ← Back to services
        </button>
      </div>
    </div>
  )

  const tax = Math.round(service.price * 0.18)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition mb-5"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero Image */}
            <img
              src={service.image || 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80'}
              alt={service.name}
              className="w-full h-64 object-cover rounded-2xl shadow-sm"
            />

            {/* Service Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                {service.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-3">{service.name}</h1>

              <div className="flex items-center gap-3 mt-2">
                <div className="text-yellow-400">
                  {'★'.repeat(Math.floor(service.rating || 0))}
                  {'☆'.repeat(5 - Math.floor(service.rating || 0))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{service.rating || 'New'}</span>
                <span className="text-sm text-gray-400">({service.totalReviews || 0} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
                <FiMapPin size={14} className="text-blue-500" />
                {service.address}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mt-4">{service.description}</p>
            </div>

            {/* Provider Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">About the provider</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-blue-200">
                  {service.provider?.name?.[0]?.toUpperCase() || 'P'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{service.provider?.name}</p>
                  {service.provider?.experience && (
                    <p className="text-sm text-gray-500">{service.provider.experience} experience</p>
                  )}
                  {service.provider?.phone && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                      <FiPhone size={12} className="text-green-500" />
                      {service.provider.phone}
                    </div>
                  )}
                </div>
              </div>
              {service.provider?.bio && (
                <p className="text-sm text-gray-500 mt-4 leading-relaxed border-t border-gray-100 pt-4">
                  {service.provider.bio}
                </p>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4">
                Reviews
                <span className="text-gray-400 font-normal text-sm ml-2">({reviews.length})</span>
              </h2>

              {/* Write Review */}
              {isAuthenticated && user?.role !== 'provider' && (
                <form onSubmit={handleReviewSubmit}
                  className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >★</button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                  />
                  <button type="submit" disabled={submitting}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Review List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">⭐</p>
                  <p className="text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                        {r.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{r.user?.name}</p>
                          <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Booking Sidebar */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <p className="text-3xl font-bold text-blue-600">
                ₹{service.price}
                <span className="text-sm font-normal text-gray-400 ml-1">/ visit</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">+ ₹{tax} GST = ₹{service.price + tax} total</p>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiClock className="text-blue-500 shrink-0" size={15} />
                  <span>Available Mon–Sun, 8am–8pm</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-blue-500 shrink-0" size={15} />
                  <span>{service.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-500 shrink-0" size={15} />
                  <span>Instant booking available</span>
                </div>
              </div>

              {/* Rating summary */}
              {service.rating > 0 && (
                <div className="mt-4 bg-yellow-50 rounded-xl p-3 flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{service.rating}</p>
                    <div className="text-yellow-400 text-xs">{'★'.repeat(Math.floor(service.rating))}</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Highly rated</p>
                    <p className="text-xs text-gray-500">{service.totalReviews} verified reviews</p>
                  </div>
                </div>
              )}

              <button onClick={handleBooking}
                className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                {!isAuthenticated ? 'Login to Book' :
                 user?.role === 'provider' ? 'Providers cannot book' :
                 'Book Now'}
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) { toast.error('Please login first'); navigate('/login'); return }
                  toast.success('Provider will be contacted!')
                }}
                className="w-full mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                <FiPhone size={14} /> Contact Provider
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Free cancellation up to 2 hours before
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ServiceDetail