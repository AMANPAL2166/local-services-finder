import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, providerOnly = false, customerOnly = false }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (providerOnly && user?.role !== 'provider') {
    return <Navigate to="/" replace />
  }

  if (customerOnly && user?.role !== 'user') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute