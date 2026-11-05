import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { X } from 'lucide-react'

export const ThemedModal = ({ isOpen, onClose, title, children }) => {
    const { theme } = useTheme()

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-[95%] max-w-lg mx-auto"
                    >
                        <div
                            className={`${theme === 'light'
                                ? 'bg-white'
                                : 'bg-slate-800'
                                } rounded-xl shadow-2xl overflow-hidden`}
                        >
                            {/* Header */}
                            <div className={`flex justify-between items-center p-6 border-b ${theme === 'light'
                                ? 'border-gray-200'
                                : 'border-gray-700'
                                }`}>
                                <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors ${theme === 'light'
                                        ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                        : 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
} 