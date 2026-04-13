import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/authSlice'
import { loginApi } from '../api/authApi'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await loginApi(form)
      const data = res.data.data
      dispatch(setUser(data))

      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)

      // Role-based redirect — the core of production auth
      if (data.user.role === 'provider') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">ServiFind</h1>
          <p className="text-gray-400 text-sm mt-1">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} placeholder="••••••••" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Quick test accounts */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Quick Test Login</p>
          <div className="space-y-2">
            {[
              { label: '👤 Customer',         email: 'aman@servifind.com',  role: 'user' },
              { label: '🔧 Provider (Ravi)',   email: 'ravi@servifind.com',  role: 'provider' },
              { label: '🧹 Provider (Priya)',  email: 'priya@servifind.com', role: 'provider' },
            ].map(acc => (
              <button key={acc.email}
                onClick={() => setForm({ email: acc.email, password: 'password123' })}
                className="w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">{acc.label}</span>
                <span className="text-gray-400">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Password: password123</p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login