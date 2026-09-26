import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ExplorePage } from './pages/ExplorePage'
import { HomePage } from './pages/HomePage'
import { MapPage } from './pages/MapPage'
import { SignupPage } from './pages/SignupPage'
import { ProfileProvider, useProfile } from './lib/profile-context'

function RequireProfile({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  if (!profile) return <Navigate to="/signup" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <RequireProfile>
            <HomePage />
          </RequireProfile>
        }
      />
      <Route
        path="/explore"
        element={
          <RequireProfile>
            <ExplorePage />
          </RequireProfile>
        }
      />
      <Route
        path="/map"
        element={
          <RequireProfile>
            <MapPage />
          </RequireProfile>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ProfileProvider>
      <AppRoutes />
    </ProfileProvider>
  )
}
