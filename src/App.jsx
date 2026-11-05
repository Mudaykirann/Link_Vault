import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Links from './pages/Links'
import Profile from './pages/Profile'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import LoadingScreen from './components/LoadingScreen'
import CommandPalette from './components/CommandPalette'
import ImportExportModal from './components/ImportExportModal'
import { useState, useRef, useEffect } from 'react'

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const hasShownLoader = useRef(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isImportExportOpen, setIsImportExportOpen] = useState(false)

  useEffect(() => {
    // Show the loading screen only on the first app load
    if (!hasShownLoader.current) {
      hasShownLoader.current = true
    }

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
          {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}

          {!isLoading && (
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
              <Routes>
                {/* Auth routes outside Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Navigate to="/register" replace />} />

                {/* Protected Dashboard */}
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
                  {/* Protected routes */}
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
            </div>
          )}
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
