import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { OfflineProvider } from '@/contexts/OfflineContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { CampeurList } from '@/pages/Campeurs/CampeurList'
import { CampeurForm } from '@/pages/Campeurs/CampeurForm'
import { CampeurDetail } from '@/pages/Campeurs/CampeurDetail'
import { ActivityList } from '@/pages/Activities/ActivityList'
import { ActivityForm } from '@/pages/Activities/ActivityForm'
import { ScannerPage } from '@/pages/Scanner'
import { IncidentList } from '@/pages/Incidents/IncidentList'
import { Messagerie } from '@/pages/Messagerie/Messagerie'
import { Repas } from '@/pages/Repas/Repas'
import { SettingsPage } from '@/pages/Settings/Settings'
import { Toaster } from 'react-hot-toast'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#2D6A4F] border-t-transparent rounded-full" /></div>
  if (!profile) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { profile } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={profile ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <OfflineProvider>
              <AppLayout />
            </OfflineProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campeurs" element={<CampeurList />} />
        <Route path="/campeurs/new" element={<CampeurForm />} />
        <Route path="/campeurs/:id" element={<CampeurDetail />} />
        <Route path="/campeurs/:id/edit" element={<CampeurForm />} />
        <Route path="/activites" element={<ActivityList />} />
        <Route path="/activites/new" element={<ActivityForm />} />
        <Route path="/activites/:id/edit" element={<ActivityForm />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/incidents" element={<IncidentList />} />
        <Route path="/messagerie" element={<Messagerie />} />
        <Route path="/repas" element={<Repas />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', background: '#333', color: '#fff', fontSize: '14px' },
          }}
        />
      </AuthProvider>
    </Router>
  )
}
