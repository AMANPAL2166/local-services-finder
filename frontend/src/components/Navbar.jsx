import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/authSlice'

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          ServiFind
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/services" className="hover:text-blue-600 transition">Services</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden md:block">
                Hi, {user?.name?.split(' ')[0]} 👋
              </span>
              <Link
                to="/profile"
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar