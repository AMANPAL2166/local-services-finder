import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiUser, FiPhone, FiFileText } from 'react-icons/fi'
import { createBookingApi } from '../api/bookingApi'
import { getServiceByIdApi } from '../api/serviceApi'
import toast from 'react-hot-toast'

const TIME_SLOTS = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM','03:00 PM',
  '04:00 PM','05:00 PM','06:00 PM','07:00 PM',
]

const getNext7Days = () => {
  const days = []
  const dayNames   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      date:  `${d.getDate()} ${monthNames[d.getMonth()]}`,
      full:  d.toISOString().split('T')[0],
    })
  }
  return days
}

const STEPS = ['Date & Time', 'Your Details', 'Confirm']

const BookingPage = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const [service, setService]           = useState(null)
  const [loadingService, setLoadingService] = useState(true)
  const [step, setStep]                 = useState(0)
  const [selectedDay, setSelectedDay]   = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booked, setBooked]             = useState(false)
  const [loading, setLoading]           = useState(false)
  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    notes:   '',
  })

  const days = getNext7Days()

  // Real API se service fetch karo
  useEffect(() => {
    getServiceByIdApi(id)
      .then(res => setService(res.data.data.service))
      .catch(() => toast.error('Service not found'))
      .finally(() => setLoadingService(false))
  }, [id])

  const tax = service ? Math.round(service.price * 0.18) : 0

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleNext = () => {
    if (step === 0) {
      if (!selectedDay)  { toast.error('Please select a date'); return }
      if (!selectedSlot) { toast.error('Please select a time slot'); return }
    }
    if (step === 1) {
      if (!form.name.trim())    { toast.error('Enter your name'); return }
      if (!form.phone.trim())   { toast.error('Enter your phone number'); return }
      if (!form.address.trim()) { toast.error('Enter your address'); return }
    }
    setStep(s => s + 1)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await createBookingApi({
        serviceId: id,
        date:      selectedDay.full,
        timeSlot:  selectedSlot,
        address:   form.address,
        phone:     form.phone,
        notes:     form.notes,
      })
      setBooked(true)
      toast.success('Booking confirmed! 🎉')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loadingService) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  // Service not found
  if (!service) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p>Service not found</p>
        <button onClick={() => navigate('/services')} className="mt-3 text-blue-600 text-sm hover:underline">
          ← Back to services
        </button>
      </div>
    </div>
  )

  // Success screen
  if (booked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your booking for <span className="font-semibold text-blue-600">{service.name}</span> on{' '}
          <span className="font-semibold">{selectedDay?.date}</span> at{' '}
          <span className="font-semibold">{selectedSlot}</span> is confirmed.
        </p>
        <div className="bg-blue-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
          {[
            ['Service',  service.name],
            ['Provider', service.provider?.name],
            ['Date',     selectedDay?.date],
            ['Time',     selectedSlot],
            ['Address',  form.address],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-blue-600">₹{service.price + tax}</span>
          </div>
        </div>
        <button onClick={() => navigate('/')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >Back to Home</button>
        <button onClick={() => navigate('/profile')}
          className="w-full mt-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition text-sm"
        >View My Bookings</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <FiArrowLeft /> {step === 0 ? 'Back to service' : 'Previous step'}
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                  i < step   ? 'bg-blue-600 border-blue-600 text-white' :
                  i === step ? 'border-blue-600 text-blue-600' :
                               'border-gray-300 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 mx-1 rounded ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">

            {/* STEP 0 — Date & Time */}
            {step === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiCalendar className="text-blue-600" /> Select a date
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map((day, i) => (
                    <button key={i} onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center py-3 px-1 rounded-xl border text-xs font-medium transition ${
                        selectedDay?.full === day.full
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-[10px] opacity-70">{day.label}</span>
                      <span className="text-sm font-bold mt-0.5">{day.date.split(' ')[0]}</span>
                      <span className="text-[10px] opacity-70">{day.date.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>

                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 pt-2">
                  <FiClock className="text-blue-600" /> Select a time slot
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`py-2 rounded-xl border text-sm font-medium transition ${
                        selectedSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >{slot}</button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — Details */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Your details</h2>
                {[
                  { label: 'Full Name',    name: 'name',  icon: <FiUser size={15} />,  type: 'text', placeholder: 'Aman Pal' },
                  { label: 'Phone Number', name: 'phone', icon: <FiPhone size={15} />, type: 'tel',  placeholder: '9876543210' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2 focus-within:ring-2 focus-within:ring-blue-500">
                      <span className="text-gray-400">{field.icon}</span>
                      <input name={field.name} type={field.type} value={form[field.name]}
                        onChange={handleChange} placeholder={field.placeholder}
                        className="flex-1 py-2.5 text-sm outline-none bg-transparent"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
                  <div className="flex items-start border border-gray-200 rounded-xl px-3 gap-2 pt-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                    <FiMapPin className="text-gray-400 mt-0.5 shrink-0" size={15} />
                    <textarea name="address" value={form.address} onChange={handleChange}
                      placeholder="Flat 4B, Civil Lines, Prayagraj" rows={3}
                      className="flex-1 text-sm outline-none bg-transparent resize-none pb-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex items-start border border-gray-200 rounded-xl px-3 gap-2 pt-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                    <FiFileText className="text-gray-400 mt-0.5 shrink-0" size={15} />
                    <textarea name="notes" value={form.notes} onChange={handleChange}
                      placeholder="Any special instructions..." rows={2}
                      className="flex-1 text-sm outline-none bg-transparent resize-none pb-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Confirm your booking</h2>
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100 text-sm">
                  {[
                    ['Service',  service.name],
                    ['Provider', service.provider?.name],
                    ['Date',     selectedDay?.date],
                    ['Time',     selectedSlot],
                    ['Name',     form.name],
                    ['Phone',    form.phone],
                    ['Address',  form.address],
                    form.notes && ['Notes', form.notes],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} className="flex justify-between py-3 px-4">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-600">Service fee</span><span>₹{service.price}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">GST (18%)</span><span>₹{tax}</span></div>
                  <div className="flex justify-between font-bold text-blue-600 border-t border-blue-100 pt-2">
                    <span>Total</span><span>₹{service.price + tax}</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={step < 2 ? handleNext : handleConfirm} disabled={loading}
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-60"
            >
              {step === 0 ? 'Continue to Details →' :
               step === 1 ? 'Review Booking →' :
               loading    ? 'Confirming...' : 'Confirm & Book 🎉'}
            </button>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <img
                src={service.image || 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&q=80'}
                alt={service.name} className="w-full h-32 object-cover rounded-xl mb-4"
              />
              <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                {service.category}
              </span>
              <h3 className="font-semibold text-gray-800 mt-2 text-sm">{service.name}</h3>
              <p className="text-xs text-gray-500 mt-1">by {service.provider?.name}</p>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-xs text-gray-500">
                {selectedDay  && <div className="flex items-center gap-2"><FiCalendar className="text-blue-500" size={12} /><span>{selectedDay.date}</span></div>}
                {selectedSlot && <div className="flex items-center gap-2"><FiClock className="text-blue-500" size={12} /><span>{selectedSlot}</span></div>}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 text-sm space-y-1.5">
                <div className="flex justify-between text-gray-500"><span>Service fee</span><span>₹{service.price}</span></div>
                <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>₹{tax}</span></div>
                <div className="flex justify-between font-bold text-blue-600 text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span><span>₹{service.price + tax}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage