import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import CommandPalette from './components/CommandPalette'
import ImportExportModal from './components/ImportExportModal'

// Dynamic code-splitting for maximum page speed & Core Web Vitals
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Links = lazy(() => import('./pages/Links'))
const Profile = lazy(() => import('./pages/Profile'))
const Categories = lazy(() => import('./pages/Categories'))
const Analytics = lazy(() => import('./pages/Analytics'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))

const App = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  useEffect(() => {
    const handleOpenPalette = () => setIsCommandPaletteOpen(true)
    const handleOpenImport = () => setIsImportExportOpen(true)

    window.addEventListener('linkvault:open-command-palette', handleOpenPalette)
    window.addEventListener('linkvault:open-import-export', handleOpenImport)

    return () => {
      window.removeEventListener('linkvault:open-command-palette', handleOpenPalette)
      window.removeEventListener('linkvault:open-import-export', handleOpenImport)
    }
  }, [])

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen">
            {/* Global Command Palette & Import/Export Modals */}
            <CommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
            />
            <ImportExportModal
              isOpen={isImportExportOpen}
              onClose={() => setIsImportExportOpen(false)}
              onImportSuccess={() => {
                setIsImportExportOpen(false)
                window.dispatchEvent(new CustomEvent('linkvault:refresh-links'))
              }}
            />

            {/* Suspense with Minimal Top Progress Beam */}
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Auth routes outside Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Navigate to="/register" replace />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected Dashboard & Analytics */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />

                {/* Routes with Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route
                    path="/links"
                    element={
                      <ProtectedRoute>
                        <Links />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch all route - 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
