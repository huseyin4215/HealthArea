import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  // Show loading spinner if auth state is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect to complete-profile if profile is incomplete
  if (!user?.age || !user?.gender || !user?.height || !user?.weight) {
    return <Navigate to="/complete-profile" replace />
  }

  // All checks passed, show children
  return children
}

export default PrivateRoute 