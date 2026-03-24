import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Home, ArrowLeft, AlertCircle } from 'lucide-react'
import { ThemedButton } from '../components/ui/ThemedButton'

const NotFound = () => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const { user } = useAuth()

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    }

    const floatingVariants = {
        floating: {
            y: [0, -20, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    }

    return (
        <div
            className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${theme === 'light'
                    ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
                    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                }`}
        >
            {/* Animated background elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${theme === 'light' ? 'bg-blue-200/20' : 'bg-yellow-500/5'
                    }`}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${theme === 'light' ? 'bg-violet-200/20' : 'bg-violet-500/5'
                    }`}
            />

            {/* Content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 text-center"
            >
                {/* 404 Number with floating animation */}
                <motion.div
                    variants={floatingVariants}
                    animate="floating"
                    className="mb-8"
                >
                    <motion.div
                        variants={itemVariants}
                        className="relative inline-block"
                    >
                        <div
                            className={`text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r ${theme === 'light'
                                    ? 'from-blue-600 to-violet-600'
                                    : 'from-yellow-400 to-violet-400'
                                }`}
                        >
                            404
                        </div>
                        {/* Glowing effect behind number */}
                        <div
                            className={`absolute inset-0 blur-2xl -z-10 ${theme === 'light'
                                    ? 'bg-gradient-to-r from-blue-300 to-violet-300 opacity-30'
                                    : 'bg-gradient-to-r from-yellow-500 to-violet-500 opacity-20'
                                }`}
                        />
                    </motion.div>
                </motion.div>

                {/* Alert Icon */}
                <motion.div variants={itemVariants} className="mb-6">
                    <AlertCircle
                        size={64}
                        className={`mx-auto ${theme === 'light' ? 'text-blue-500' : 'text-yellow-400'
                            }`}
                    />
                </motion.div>

                {/* Heading */}
                <motion.h1
                    variants={itemVariants}
                    className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                >
                    Page Not Found
                </motion.h1>

                {/* Description */}
                <motion.p
                    variants={itemVariants}
                    className={`text-lg md:text-xl mb-8 max-w-md mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                        }`}
                >
                    The page you're looking for doesn't exist. It might have been moved, deleted, or the URL might be incorrect.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${theme === 'light'
                                ? 'bg-white text-slate-900 border-2 border-blue-500 hover:bg-blue-50'
                                : 'bg-slate-700 text-white border-2 border-yellow-400 hover:bg-slate-600'
                            }`}
                    >
                        <ArrowLeft size={20} />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate(user ? '/dashboard' : '/')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${theme === 'light'
                                ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:shadow-lg hover:shadow-yellow-500/30'
                            }`}
                    >
                        <Home size={20} />
                        {user ? 'Dashboard' : 'Home'}
                    </button>
                </motion.div>

                {/* Fun message */}
                <motion.p
                    variants={itemVariants}
                    className={`mt-12 text-sm md:text-base italic ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'
                        }`}
                >
                    "Even the best links sometimes lead to nowhere..." ✨
                </motion.p>
            </motion.div>
        </div>
    )
}

export default NotFound
