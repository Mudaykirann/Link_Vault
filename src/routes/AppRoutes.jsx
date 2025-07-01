import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import Home from '../pages/Home'
import Links from '../pages/Links'
import About from '../pages/About'
import Contact from '../pages/Contact'
import Login from '../pages/Login'
import Register from '../pages/Register'

const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Pages - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />

            {/* Main Layout Pages */}
            <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route
                    path="links"
                    element={
                        <ProtectedRoute>
                            <Links />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRoutes 