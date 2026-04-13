import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUser, logout } from '../redux/authSlice'
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2,
  FiLogOut, FiCalendar, FiStar, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle
} from 'react-icons/fi'
import { getMyBookingsApi } from '../api/bookingApi'
import { updateProfileApi } from '../api/authApi'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-50 text-blue-600',    icon: <FiCheckCircle size={12} /> },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-600',  icon: <FiCheckCircle size={12} /> },
  pending:   { label: 'Pending',   color: 'bg-yellow-50 text-yellow-600', icon: <FiAlertCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600',      icon: <FiXCircle size={12} /> },
}

const TABS = ['My Bookings', 'Edit Profile']

const UserProfile = () => {
  const { user }  = useSelector(state => state.auth)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const [activeTab, setActiveTab]       = useState('My Bookings')
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [filterStatus, setFilter]       = useState('all')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview]     = useState(user?.avatar || null)
  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
  })

  useEffect(() => {
    getMyBookingsApi()
      .then(res => setBookings(res.data.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    try {
      const res = await updateProfileApi(form)
      dispatch(setUser({ ...user, ...res.data.data.user }))
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar must be under 2MB')
      return
    }
    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      dispatch(setUser({ ...user, avatar: res.data.data.avatar }))
      toast.success('Profile photo updated!')
    } catch {
      toast.error('Failed to upload avatar')
      setAvatarPreview(user?.avatar || null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out')
    navigate('/')
  }

  const filtered = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus)

  const stats = [
    { label: 'Total',     value: bookings.length },
    { label: 'Upcoming',  value: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">

            {/* Avatar with upload */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center text-3xl font-bold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition border-2 border-white">
                {uploadingAvatar ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-xs font-bold">✎</span>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-0.5">Customer Account</p>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-blue-200 text-sm">{user?.email}</p>
            </div>
          </div>

          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-3 mt-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* TABS */}
        <div className="flex border-b border-gray-200 mt-6">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >{tab}</button>
          ))}
        </div>

        {/* MY BOOKINGS */}
        {activeTab === 'My Bookings' && (
          <div className="py-6 space-y-5">

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {['all','pending','confirmed','completed','cancelled'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >{s}</button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-3">📋</p>
                <p className="font-medium">No {filterStatus === 'all' ? '' : filterStatus} bookings</p>
                <button onClick={() => navigate('/services')} className="mt-3 text-blue-600 text-sm hover:underline">
                  Browse services →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(booking => {
                  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
                  return (
                    <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex">
                        <img
                          src={booking.service?.image || 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80'}
                          alt={booking.service?.name}
                          className="w-28 h-28 object-cover shrink-0"
                        />
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-800">{booking.service?.name}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">by {booking.provider?.name}</p>
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><FiCalendar size={11} />{booking.date}</span>
                            <span className="flex items-center gap-1"><FiClock size={11} />{booking.timeSlot}</span>
                            <span className="flex items-center gap-1"><FiMapPin size={11} />{booking.address}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-blue-600 font-bold">₹{booking.price}</span>
                            <div className="flex gap-2">
                              {booking.status === 'completed' && (
                                <button
                                  onClick={() => navigate(`/services/${booking.service?._id}`)}
                                  className="flex items-center gap-1 text-xs text-yellow-500 border border-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition"
                                >
                                  <FiStar size={11} /> Leave Review
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/services/${booking.service?._id}`)}
                                className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                              >
                                View Service
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status progress bar */}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center">
                          {['pending','confirmed','completed'].map((s, i) => (
                            <div key={s} className="flex items-center flex-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition shrink-0 ${
                                booking.status === 'cancelled'
                                  ? 'border-red-300 bg-red-50 text-red-400'
                                  : ['pending','confirmed','completed'].indexOf(booking.status) >= i
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-400'
                              }`}>
                                {booking.status === 'cancelled' ? '✕' : i + 1}
                              </div>
                              <span className="text-[10px] text-gray-400 ml-1 capitalize">{s}</span>
                              {i < 2 && (
                                <div className={`flex-1 h-0.5 mx-2 rounded ${
                                  ['confirmed','completed'].indexOf(booking.status) >= i
                                    ? 'bg-blue-600' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!loading && bookings.length > 0 && (
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/services')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition"
                  >+ Book New Service</button>
                  <button onClick={() => setFilter('completed')}
                    className="bg-white hover:bg-blue-50 text-blue-600 text-sm font-medium py-2.5 rounded-xl border border-blue-200 transition"
                  >View Completed</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EDIT PROFILE */}
        {activeTab === 'Edit Profile' && (
          <div className="py-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 max-w-lg">
              <h2 className="text-base font-bold text-gray-800 mb-2">Personal information</h2>

              {[
                { label: 'Full Name', name: 'name',    icon: <FiUser size={14} />,   type: 'text',  placeholder: 'Aman Pal' },
                { label: 'Email',     name: 'email',   icon: <FiMail size={14} />,   type: 'email', placeholder: 'you@example.com' },
                { label: 'Phone',     name: 'phone',   icon: <FiPhone size={14} />,  type: 'tel',   placeholder: '9876543210' },
                { label: 'Address',   name: 'address', icon: <FiMapPin size={14} />, type: 'text',  placeholder: 'Civil Lines, Prayagraj' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="text-gray-400">{field.icon}</span>
                    <input
                      name={field.name} type={field.type}
                      value={form[field.name]} onChange={handleChange}
                      placeholder={field.placeholder}
                      className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>
              ))}

              <button onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                <FiEdit2 size={14} /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-10" />
    </div>
  )
}

export default UserProfile