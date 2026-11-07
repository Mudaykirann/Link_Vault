import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Loader2 } from 'lucide-react'
import { ThemedButton } from '../components/ui/ThemedButton'
import { GoogleAuthButton } from '../components/ui/GoogleAuthButton'
import { config } from '../config'
import { useAuth } from '../context/AuthContext'

const Register = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setErrors(prev => ({
            ...prev,
            [name]: '',
            auth: ''
        }))
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.username) {
            newErrors.username = 'Username is required'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        } else if (!/^[A-Za-z0-9_-]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, underscores and dashes'
        }

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Valid email is required'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true)
            try {
                const response = await fetch(`${config.apiUrl}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword
                    })
                })

                const data = await response.json()

                if (response.ok) {
                    if (data.session?.access_token) {
                        localStorage.setItem('token', data.session.access_token)
                        if (data.session.refresh_token) {
                            localStorage.setItem('refresh_token', data.session.refresh_token)
                        }
                        login(data.user, data.session.access_token, data.session.refresh_token)
                        navigate('/dashboard')
                    } else {
                        navigate('/login', {
                            state: { successMessage: 'Account created successfully! Please sign in.' }
                        })
                    }
                } else {
                    const errorMsg = data.errors
                        ? data.errors.map(err => err.msg).join('. ')
                        : (data.error || data.message || 'Registration failed')
                    setErrors({ auth: errorMsg })
                }
            } catch (error) {
                console.error('Registration error:', error)
                setErrors({ auth: 'Connection error. Please check your internet or backend connection and try again.' })
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
                        Create an Account
                    </h1>
                    <p className={theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}>
                        Join LinkVault to start organizing your links
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
                        {/* Google Sign Up */}
                        <div>
                            <GoogleAuthButton mode="register" onError={(msg) => setErrors({ auth: msg })} />

                            <div className="relative my-6 text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className={`w-full border-t ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'}`}></div>
                                </div>
                                <span className={`relative px-3 text-xs uppercase tracking-wider font-semibold ${
                                    theme === 'light' ? 'bg-white text-gray-400' : 'bg-[#1E293B] text-gray-500'
                                }`}>
                                    Or register with email
                                </span>
                            </div>
                        </div>

                        {/* Username Input */}
                        <div>
                            <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                <span className="flex items-center gap-2">
                                    <User className={theme === 'light' ? 'text-[#2563EB]' : 'text-[#FACC15]'} />
                                    Username
                                </span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border transition-colors duration-200 ${errors.username
                                    ? 'border-red-500'
                                    : theme === 'light'
                                        ? 'border-[#E5E7EB] focus:border-[#2563EB]'
                                        : 'border-[#334155] focus:border-[#FACC15]'
                                    } ${theme === 'light'
                                        ? 'bg-white text-[#1F2937]'
                                        : 'bg-[#1E293B] text-[#F9FAFB]'
                                    }`}
                                placeholder="e.g. johndoe"
                            />
                            {errors.username && (
                                <p className="mt-1 text-red-500 text-sm">{errors.username}</p>
                            )}
                        </div>

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

                        {/* Password Inputs */}
                        <div className="space-y-4">
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

                            <div>
                                <label className={`block mb-2 font-medium ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}>
                                    <span className="flex items-center gap-2">
                                        <Lock className={theme === 'light' ? 'text-[#2563EB]' : 'text-[#FACC15]'} />
                                        Confirm Password
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full p-3 rounded-lg border transition-colors duration-200 ${errors.confirmPassword
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
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-red-500 text-sm">{errors.confirmPassword}</p>
                                )}
                            </div>
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
                                'Create Account'
                            )}
                        </ThemedButton>
                    </div>

                    <p className={`mt-4 text-center ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className={`font-medium transition-colors ${theme === 'light'
                                ? 'text-[#2563EB] hover:text-[#1D4ED8]'
                                : 'text-[#FACC15] hover:text-[#EAB308]'
                                }`}
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.form>
            </div>
        </motion.div>
    )
}

export default Register;
