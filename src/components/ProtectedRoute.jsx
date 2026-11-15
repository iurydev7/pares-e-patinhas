import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function ProtectedRoute() {
  const { user, verificando } = useAuth()
  const location = useLocation()

  if (verificando) {
    return (
      <div role="status">
        Verificando sua sessão...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute