import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Loader2, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Link as LinkIcon } from 'lucide-react'
import { ThemedButton } from '../components/ui/ThemedButton'
import { GoogleAuthButton } from '../components/ui/GoogleAuthButton'
import { config } from '../config'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const { theme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const successMessage = location.state?.successMessage

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
                    if (data.session?.access_token) {
                        localStorage.setItem('token', data.session.access_token)
                        if (data.session.refresh_token) {
                            localStorage.setItem('refresh_token', data.session.refresh_token)
                        }
                        login(data.user, data.session.access_token, data.session.refresh_token)
                    } else {
                        login(data.user)
                    }
                    navigate('/dashboard')
                } else {
                    const errorMsg = data.errors
                        ? data.errors.map(err => err.msg).join('. ')
                        : (data.error || data.message || 'Login failed')
                    setErrors({ auth: errorMsg })
                }
            } catch (error) {
                console.error('Login error:', error)
                setErrors({ auth: 'Connection error. Please check your internet or backend connection and try again.' })
            } finally {
                setIsLoading(false)
            }
        } else {
            setErrors(newErrors)
        }
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 ${
            theme === 'light' ? 'bg-[#F7F8F9]' : 'bg-[#08090A]'
        }`}>
            {/* Ambient Background Glow in Cyan */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 ${
                    theme === 'light' ? 'bg-cyan-200' : 'bg-cyan-900/25'
                }`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-[#1B2028] glass-card shadow-2xl relative z-10"
            >
                {/* Left Showcase Branding Panel in Obsidian & Cyan */}
                <div className="hidden lg:flex lg:col-span-5 p-10 flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0F141D] via-[#08090A] to-black text-white border-r border-[#1B2028]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                                <LinkIcon className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight">LinkVault</span>
                        </div>
                        <h2 className="text-2xl font-black leading-snug">
                            Your personal library, precision-engineered.
                        </h2>
                        <p className="mt-3 text-xs text-[#8A94A6] leading-relaxed">
                            Organize bookmarks with intelligent tagging, real-time health telemetry, and sub-second Spotlight search.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3 pt-8 border-t border-[#1B2028]">
                        <div className="flex items-center gap-2.5 text-xs text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>Zero link rot with automated health checks</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-300">
                            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                            <span>Instant Spotlight palette (⌘K)</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white/80 dark:bg-[#0E1217]/95">
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Welcome back
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-[#8A94A6]">
                            Sign in to your vault to continue
                        </p>
                        {successMessage && (
                            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* Google Auth Button */}
                    <div className="space-y-4">
                        <GoogleAuthButton mode="login" onError={(msg) => setErrors({ auth: msg })} />

                        <div className="relative my-4 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-[#1B2028]"></div>
                            </div>
                            <span className="relative px-3 text-[11px] uppercase tracking-wider font-semibold bg-white dark:bg-[#0E1217] text-slate-400">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${
                                        errors.email
                                            ? 'border-red-500 ring-1 ring-red-500'
                                            : theme === 'light'
                                                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                                                : 'bg-[#14181F] border-[#1B2028] text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                                    }`}
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${
                                        errors.password
                                            ? 'border-red-500 ring-1 ring-red-500'
                                            : theme === 'light'
                                                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                                                : 'bg-[#14181F] border-[#1B2028] text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                                    }`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {errors.auth && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-center font-medium"
                            >
                                {errors.auth}
                            </motion.div>
                        )}

                        <ThemedButton
                            variant="primary"
                            className="w-full py-2.5 rounded-xl text-sm font-bold mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {isLoading ? 'Signing in...' : 'Sign in to Vault'}
                        </ThemedButton>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-500 dark:text-[#8A94A6]">
                        Don't have an account yet?{' '}
                        <Link
                            to="/register"
                            className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline ml-1"
                        >
                            Create account free
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
