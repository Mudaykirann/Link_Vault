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
import NotFound from './pages/NotFound'
import LoadingScreen from './components/LoadingScreen'
import { useState, useRef, useEffect } from 'react'
import Navbar from './components/Navbar'

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  const hasShownLoader = useRef(false)

  useEffect(() => {
    // Show the loading screen only on the first app load
    if (!hasShownLoader.current) {
      hasShownLoader.current = true
      // LoadingScreen will automatically hide itself after completion
    }
  }, [])

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}

          {!isLoading && (
            <div className="min-h-screen">
              <Routes>
                {/* Auth routes outside Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

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