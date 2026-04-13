import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ServiceList from './pages/ServiceList'
import ServiceDetail from './pages/ServiceDetail'
import BookingPage from './pages/BookingPage'
import UserProfile from './pages/UserProfile'
import ProviderDashboard from './pages/ProviderDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Smart home redirect based on role
const HomeRedirect = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth)
  if (isAuthenticated && user?.role === 'provider') {
    return <Navigate to="/dashboard" replace />
  }
  return <Home />
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"             element={<HomeRedirect />} />
        <Route path="/home"         element={<Navigate to="/" replace />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/services"     element={<ServiceList />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* Customer only */}
        <Route path="/book/:id" element={
          <ProtectedRoute customerOnly><BookingPage /></ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute customerOnly><UserProfile /></ProtectedRoute>
        }/>

        {/* Provider only */}
        <Route path="/dashboard" element={
          <ProtectedRoute providerOnly><ProviderDashboard /></ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App