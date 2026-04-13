import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/authSlice'
import {
  FiUser, FiPhone, FiMapPin, FiDollarSign, FiFileText,
  FiCalendar, FiClock, FiCheck, FiX, FiLogOut,
  FiTrendingUp, FiStar, FiAlertCircle, FiCheckCircle,
  FiEdit2, FiPlus, FiToggleLeft, FiToggleRight
} from 'react-icons/fi'
import { getProviderBookingsApi, updateBookingStatusApi } from '../api/bookingApi'
import { getMyServicesApi, updateServiceApi } from '../api/serviceApi'
import { updateProfileApi } from '../api/authApi'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

const CATEGORIES = ['Plumber','Electrician','Cleaner','Carpenter','Painter','Mechanic','Tutor','Salon','Other']

const STATUS_CONFIG = {
  confirmed: { color: 'bg-blue-50 text-blue-600',    icon: <FiCheckCircle size={12} /> },
  completed: { color: 'bg-green-50 text-green-600',  icon: <FiCheckCircle size={12} /> },
  pending:   { color: 'bg-yellow-50 text-yellow-600', icon: <FiAlertCircle size={12} /> },
  cancelled: { color: 'bg-red-50 text-red-600',      icon: <FiX size={12} /> },
}

const TABS = ['Overview', 'Bookings', 'My Services', 'Profile Setup']

const ProviderDashboard = () => {
  const { user }  = useSelector(state => state.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const [activeTab, setActiveTab]         = useState('Overview')
  const [bookings, setBookings]           = useState([])
  const [services, setServices]           = useState([])
  const [filterStatus, setFilter]         = useState('all')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [showAddService, setShowAddService]   = useState(false)
  const [savingProfile, setSavingProfile]     = useState(false)
  const [savingService, setSavingService]     = useState(false)
  const [serviceImage, setServiceImage]       = useState(null)
  const [imagePreview, setImagePreview]       = useState(null)

  const [profile, setProfile] = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    address:    user?.address    || '',
    bio:        user?.bio        || '',
    experience: user?.experience || '',
  })

  const [serviceForm, setServiceForm] = useState({
    name: '', category: 'Plumber', description: '',
    price: '', address: '', lat: '25.4358', lng: '81.8463',
  })

  useEffect(() => {
    getProviderBookingsApi()
      .then(res => setBookings(res.data.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoadingBookings(false))

    getMyServicesApi()
      .then(res => setServices(res.data.data.services))
      .catch(() => {})
  }, [])

  const updateStatus = async (id, newStatus) => {
    try {
      await updateBookingStatusApi(id, newStatus)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b))
      toast.success(`Booking ${newStatus}!`)
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      await updateProfileApi(profile)
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setServiceImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!serviceForm.name || !serviceForm.description || !serviceForm.price || !serviceForm.address) {
      toast.error('Please fill all required fields')
      return
    }
    if (serviceForm.description.length < 20) {
      toast.error('Description must be at least 20 characters')
      return
    }
    setSavingService(true)
    try {
      const formData = new FormData()
      formData.append('name',        serviceForm.name)
      formData.append('category',    serviceForm.category)
      formData.append('description', serviceForm.description)
      formData.append('price',       serviceForm.price)
      formData.append('address',     serviceForm.address)
      formData.append('lat',         serviceForm.lat)
      formData.append('lng',         serviceForm.lng)
      if (serviceImage) formData.append('image', serviceImage)

      const res = await api.post('/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setServices(prev => [...prev, res.data.data.service])
      setShowAddService(false)
      setServiceForm({ name: '', category: 'Plumber', description: '', price: '', address: '', lat: '25.4358', lng: '81.8463' })
      setServiceImage(null)
      setImagePreview(null)
      toast.success('Service added! 🎉')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add service')
    } finally {
      setSavingService(false)
    }
  }

  const toggleService = async (id, current) => {
    try {
      await updateServiceApi(id, { isActive: !current })
      setServices(prev => prev.map(s => s._id === id ? { ...s, isActive: !current } : s))
      toast.success(`Service ${!current ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update service')
    }
  }

  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const filtered = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus)
  const isProfileComplete = profile.name && profile.phone && profile.address

  const stats = [
    { label: 'Earnings',  value: `₹${totalEarnings}`,                                      icon: <FiTrendingUp size={16} />, color: 'text-green-600',  bg: 'bg-green-50'  },
    { label: 'Bookings',  value: bookings.length,                                            icon: <FiCalendar size={16} />,   color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { label: 'Pending',   value: bookings.filter(b => b.status === 'pending').length,        icon: <FiAlertCircle size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Services',  value: services.length,                                             icon: <FiStar size={16} />,       color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user?.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase() || 'P'
              }
            </div>
            <div>
              <p className="text-purple-200 text-xs uppercase tracking-widest mb-0.5">Provider Dashboard</p>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-purple-200 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isProfileComplete && (
              <button onClick={() => setActiveTab('Profile Setup')}
                className="flex items-center gap-1.5 text-xs bg-yellow-400 text-yellow-900 font-semibold px-3 py-2 rounded-xl"
              >
                <FiAlertCircle size={13} /> Complete Profile
              </button>
            )}
            <button onClick={() => { dispatch(logout()); navigate('/') }}
              className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
            >
              <FiLogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-2`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-purple-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">

        {/* TABS */}
        <div className="flex border-b border-gray-200 mt-6 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition relative ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'Profile Setup' && !isProfileComplete && (
                <span className="absolute top-2 right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              )}
              {tab === 'Bookings' && bookings.filter(b => b.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && (
          <div className="py-6 space-y-6">

            {/* Checklist */}
            {(!isProfileComplete || services.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-yellow-800 mb-3">🚀 Get started checklist</h3>
                <div className="space-y-2">
                  {[
                    { done: !!profile.name && !!profile.phone, label: 'Complete your profile', action: () => setActiveTab('Profile Setup') },
                    { done: services.length > 0,               label: 'Add your first service', action: () => setActiveTab('My Services') },
                    { done: bookings.length > 0,               label: 'Receive your first booking', action: null },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {item.done ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      {!item.done && item.action && (
                        <button onClick={item.action} className="text-xs text-yellow-700 font-medium hover:underline">
                          Do it →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent bookings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">Recent bookings</h2>
                <button onClick={() => setActiveTab('Bookings')} className="text-sm text-purple-600 hover:underline">View all →</button>
              </div>
              {loadingBookings ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}</div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">No bookings yet. Add services to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map(b => {
                    const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                    return (
                      <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{b.user?.name}</p>
                          <p className="text-xs text-gray-400">{b.service?.name} · {b.date} · {b.timeSlot}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full capitalize ${cfg.color}`}>
                            {cfg.icon} {b.status}
                          </span>
                          <span className="text-purple-600 font-bold text-sm">₹{b.price}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Services preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">My services</h2>
                <button onClick={() => setActiveTab('My Services')} className="text-sm text-purple-600 hover:underline">Manage →</button>
              </div>
              {services.length === 0 ? (
                <button onClick={() => { setActiveTab('My Services'); setShowAddService(true) }}
                  className="w-full bg-white border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center text-purple-400 hover:border-purple-400 hover:bg-purple-50 transition"
                >
                  <FiPlus size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Add your first service</p>
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.slice(0, 4).map(s => (
                    <div key={s._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                      {s.image && (
                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.category} · ₹{s.price}/visit</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${s.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {s.isActive ? 'Active' : 'Off'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'Bookings' && (
          <div className="py-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['all','pending','confirmed','completed','cancelled'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition ${
                    filterStatus === s
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
                >{s}</button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p>No {filterStatus === 'all' ? '' : filterStatus} bookings</p>
              </div>
            ) : (
              filtered.map(b => {
                const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
                return (
                  <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-800">{b.user?.name}</p>
                          <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${cfg.color}`}>
                            {cfg.icon} {b.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{b.service?.name}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><FiCalendar size={11} />{b.date}</span>
                          <span className="flex items-center gap-1"><FiClock size={11} />{b.timeSlot}</span>
                          <span className="flex items-center gap-1"><FiMapPin size={11} />{b.address}</span>
                          <span className="flex items-center gap-1"><FiPhone size={11} />{b.phone}</span>
                        </div>
                        {b.notes && <p className="text-xs text-gray-400 mt-1 italic">📝 {b.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-purple-600 font-bold text-xl">₹{b.price}</p>
                        <div className="flex flex-col gap-2 mt-2">
                          {b.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => updateStatus(b._id, 'confirmed')}
                                className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition"
                              ><FiCheck size={11} /> Accept</button>
                              <button onClick={() => updateStatus(b._id, 'cancelled')}
                                className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
                              ><FiX size={11} /> Decline</button>
                            </div>
                          )}
                          {b.status === 'confirmed' && (
                            <button onClick={() => updateStatus(b._id, 'completed')}
                              className="flex items-center justify-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
                            ><FiCheck size={11} /> Mark Complete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── MY SERVICES TAB ── */}
        {activeTab === 'My Services' && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">
                Your services <span className="text-gray-400 font-normal text-sm">({services.length})</span>
              </h2>
              <button onClick={() => setShowAddService(!showAddService)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <FiPlus size={15} /> Add Service
              </button>
            </div>

            {/* ADD SERVICE FORM */}
            {showAddService && (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-5">Add new service</h3>
                <form onSubmit={handleAddService} className="space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                      <input value={serviceForm.name}
                        onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                        placeholder="e.g. Ravi Plumbing Works"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select value={serviceForm.category}
                        onChange={e => setServiceForm({...serviceForm, category: e.target.value})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      >
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description * <span className="text-gray-400 font-normal">(min 20 characters)</span>
                    </label>
                    <textarea value={serviceForm.description}
                      onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                      placeholder="Describe your service, experience, and what's included..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <p className={`text-xs mt-1 ${serviceForm.description.length < 20 ? 'text-red-400' : 'text-green-500'}`}>
                      {serviceForm.description.length}/20 characters minimum
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per visit (₹) *</label>
                      <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                        <FiDollarSign className="text-gray-400" size={14} />
                        <input type="number" value={serviceForm.price}
                          onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                          placeholder="299" min="1" max="100000"
                          className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Area *</label>
                      <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                        <FiMapPin className="text-gray-400" size={14} />
                        <input value={serviceForm.address}
                          onChange={e => setServiceForm({...serviceForm, address: e.target.value})}
                          placeholder="Civil Lines, Prayagraj"
                          className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* IMAGE UPLOAD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Image <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
                    </label>
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-300 transition cursor-pointer"
                      onClick={() => document.getElementById('service-image').click()}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="preview"
                            className="w-full h-40 object-cover rounded-xl"
                          />
                          <button type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setServiceImage(null)
                              setImagePreview(null)
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                          >✕</button>
                        </div>
                      ) : (
                        <div className="py-4">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-sm text-gray-500">Click to upload service image</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="service-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={savingService}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {savingService ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : 'Add Service'}
                    </button>
                    <button type="button" onClick={() => {
                      setShowAddService(false)
                      setServiceImage(null)
                      setImagePreview(null)
                    }}
                      className="px-6 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SERVICE LIST */}
            {services.length === 0 && !showAddService ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <p className="text-5xl mb-3">🔧</p>
                <p className="font-medium">No services yet</p>
                <p className="text-sm mt-1">Click "Add Service" to list your first service</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(s => (
                  <div key={s._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex">
                      {s.image ? (
                        <img src={s.image} alt={s.name} className="w-24 h-24 object-cover shrink-0" />
                      ) : (
                        <div className="w-24 h-24 bg-purple-50 flex items-center justify-center shrink-0 text-3xl">🔧</div>
                      )}
                      <div className="flex-1 p-4 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-800">{s.name}</p>
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{s.category}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.description}</p>
                          <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                            <span>₹{s.price}/visit</span>
                            <span>{s.totalReviews || 0} reviews</span>
                            <span>⭐ {s.rating || 'New'}</span>
                          </div>
                        </div>
                        <button onClick={() => toggleService(s._id, s.isActive)}
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition shrink-0 ${
                            s.isActive
                              ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {s.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                          {s.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE SETUP TAB ── */}
        {activeTab === 'Profile Setup' && (
          <div className="py-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-5">

              {!isProfileComplete && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                  <FiAlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Profile incomplete</p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      Complete your profile so customers can trust and book you.
                    </p>
                  </div>
                </div>
              )}

              <h2 className="text-base font-bold text-gray-800">Personal details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                    <FiUser className="text-gray-400" size={14} />
                    <input value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="Ravi Kumar"
                      className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                    <FiPhone className="text-gray-400" size={14} />
                    <input value={profile.phone}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      placeholder="9876543210" type="tel"
                      className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Area / Address *</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                  <FiMapPin className="text-gray-400" size={14} />
                  <input value={profile.address}
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    placeholder="Civil Lines, Prayagraj"
                    className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-purple-500">
                  <FiStar className="text-gray-400" size={14} />
                  <input value={profile.experience}
                    onChange={e => setProfile({...profile, experience: e.target.value})}
                    placeholder="e.g. 5 years"
                    className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About You</label>
                <div className="flex items-start border border-gray-200 rounded-xl px-3 gap-2 pt-2.5 focus-within:ring-2 focus-within:ring-purple-500">
                  <FiFileText className="text-gray-400 mt-0.5 shrink-0" size={14} />
                  <textarea value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell customers about yourself, your skills, certifications..."
                    rows={4}
                    className="flex-1 text-sm outline-none bg-transparent resize-none pb-2"
                  />
                </div>
              </div>

              <button onClick={handleProfileSave} disabled={savingProfile}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <><FiEdit2 size={14} /> Save Profile</>
                )}
              </button>

              {isProfileComplete && (
                <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
                  <FiCheckCircle size={16} /> Profile complete — customers can find you!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="h-10" />
    </div>
  )
}

export default ProviderDashboard