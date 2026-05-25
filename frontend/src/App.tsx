import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OrgProvider } from './contexts/OrgContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

// Pages
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import Controls   from './pages/Controls'
import Risks      from './pages/Risks'
import Audits     from './pages/Audits'
import Policies   from './pages/Policies'
import Frameworks from './pages/Frameworks'
import GRCAsCode  from './pages/GRCAsCode'
import Settings   from './pages/Settings'
import Vendors    from './pages/Vendors'
import Incidents  from './pages/Incidents'

/** Layout wrapper used by all protected pages */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <OrgProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppShell><Dashboard /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/monitoring" element={
                  <ProtectedRoute>
                    <AppShell><Monitoring /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/controls" element={
                  <ProtectedRoute>
                    <AppShell><Controls /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/risks" element={
                  <ProtectedRoute>
                    <AppShell><Risks /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/audits" element={
                  <ProtectedRoute>
                    <AppShell><Audits /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/policies" element={
                  <ProtectedRoute>
                    <AppShell><Policies /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/frameworks" element={
                  <ProtectedRoute>
                    <AppShell><Frameworks /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/vendors" element={
                  <ProtectedRoute>
                    <AppShell><Vendors /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/incidents" element={
                  <ProtectedRoute>
                    <AppShell><Incidents /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/grc-as-code" element={
                  <ProtectedRoute>
                    <AppShell><GRCAsCode /></AppShell>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredRoles={['admin', 'grc_manager']}>
                    <AppShell><Settings /></AppShell>
                  </ProtectedRoute>
                } />

                {/* Catch-all → home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </OrgProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
