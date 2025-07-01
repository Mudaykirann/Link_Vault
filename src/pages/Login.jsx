/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { ThemedButton } from '../components/ui/ThemedButton'
import { config } from '../config'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.email) newErrors.email = 'Email is required'
        if (!formData.password) newErrors.password = 'Password is required'
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true)
            try {
                const response = await fetch(`${config.apiUrl}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                })

                const data = await response.json()

                if (response.ok) {
                    localStorage.setItem('token', data.session.access_token)
                    localStorage.setItem('refresh_token', data.session.refresh_token)
                    login(data.user)
                    navigate('/links')
                } else {
                    setErrors({ auth: data.message || 'Login failed' })
                }
            } catch (error) {
                console.error('Login error:', error)
                setErrors({ auth: 'Something went wrong. Please try again.' })
            } finally {
                setIsLoading(false)
            }
        } else {
            setErrors(newErrors)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4"
        >
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                        Welcome Back
                    </h1>
                    <p className={theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}>
                        Sign in to access your links
                    </p>
                </div>

                <motion.form
                    onSubmit={handleSubmit}
                    className={`p-8 rounded-xl border ${theme === 'light'
                        ? 'bg-white border-[#E5E7EB]'
                        : 'bg-[#1E293B] border-[#334155]'
                        }`}
                >
                    <div className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                <span className="flex items-center gap-2">
                                    <Mail className={theme === 'light' ? 'text-[#2563EB]' : 'text-[#FACC15]'} />
                                    Email
                                </span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border transition-colors duration-200 ${errors.email
                                    ? 'border-red-500'
                                    : theme === 'light'
                                        ? 'border-[#E5E7EB] focus:border-[#2563EB]'
                                        : 'border-[#334155] focus:border-[#FACC15]'
                                    } ${theme === 'light'
                                        ? 'bg-white text-[#1F2937]'
                                        : 'bg-[#1E293B] text-[#F9FAFB]'
                                    }`}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                <span className="flex items-center gap-2">
                                    <Lock className={theme === 'light' ? 'text-[#2563EB]' : 'text-[#FACC15]'} />
                                    Password
                                </span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border transition-colors duration-200 ${errors.password
                                    ? 'border-red-500'
                                    : theme === 'light'
                                        ? 'border-[#E5E7EB] focus:border-[#2563EB]'
                                        : 'border-[#334155] focus:border-[#FACC15]'
                                    } ${theme === 'light'
                                        ? 'bg-white text-[#1F2937]'
                                        : 'bg-[#1E293B] text-[#F9FAFB]'
                                    }`}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        {errors.auth && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm text-center"
                            >
                                {errors.auth}
                            </motion.p>
                        )}

                        <ThemedButton
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Sign in'
                            )}
                        </ThemedButton>
                    </div>

                    <p className={`mt-4 text-center ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className={`font-medium transition-colors ${theme === 'light'
                                ? 'text-[#2563EB] hover:text-[#1D4ED8]'
                                : 'text-[#FACC15] hover:text-[#EAB308]'
                                }`}
                        >
                            Sign up
                        </Link>
                    </p>
                </motion.form>
            </div>
        </motion.div>
    )
}

export default Login 