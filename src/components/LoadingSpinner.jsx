import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const LoadingSpinner = () => {
    const { theme } = useTheme()

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
            <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
            </motion.div>
        </div>
    )
}

export default LoadingSpinner 