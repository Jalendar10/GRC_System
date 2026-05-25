import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]   // e.g. ['admin', 'grc_manager']
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600/20 mb-4">
            <Shield className="w-6 h-6 text-brand-400 animate-pulse" />
          </div>
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center max-w-md px-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-500">
            Your role <span className="text-slate-300 font-medium">({user.role})</span> does not
            have permission to view this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
