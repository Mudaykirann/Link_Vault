import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export const Modal = ({ isOpen, onClose, children, title }) => {
    const { theme } = useTheme()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md
                            ${theme === 'light'
                                ? 'bg-white'
                                : 'bg-[#1E293B]'
                            } rounded-xl shadow-xl p-6`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'
                                }`}>
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${theme === 'light'
                                        ? 'hover:bg-gray-100 text-gray-500'
                                        : 'hover:bg-gray-800 text-gray-400'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
} 