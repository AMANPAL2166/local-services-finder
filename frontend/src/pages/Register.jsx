import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/authSlice'
import { registerApi } from '../api/authApi'
import toast from 'react-hot-toast'

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await registerApi(form)
      const data = res.data.data
      dispatch(setUser(data))

      if (data.user.role === 'provider') {
        toast.success('Account created! Complete your profile to start getting bookings.')
        navigate('/dashboard')
      } else {
        toast.success('Account created! Find services near you.')
        navigate('/')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">ServiFind</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        {/* Role Selector — shown FIRST so user thinks about this */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">I want to...</p>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm({...form, role: 'user'})}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                form.role === 'user'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">🛒</span>
              <span className="text-sm font-semibold text-gray-800">Book Services</span>
              <span className="text-xs text-gray-400 text-center">Find & hire local service providers</span>
            </button>
            <button type="button" onClick={() => setForm({...form, role: 'provider'})}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                form.role === 'provider'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">🔧</span>
              <span className="text-sm font-semibold text-gray-800">Offer Services</span>
              <span className="text-xs text-gray-400 text-center">List your skills & get customers</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="Aman Pal" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="Min. 6 characters" required minLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="submit" disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl transition disabled:opacity-60 text-white ${
              form.role === 'provider'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating account...' : `Create ${form.role === 'provider' ? 'Provider' : 'Customer'} Account`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register