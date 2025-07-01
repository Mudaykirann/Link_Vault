import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { ThemedButton } from './ThemedButton'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { theme } = useTheme()

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'Enter') {
            onConfirm()
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        onKeyDown={handleKeyDown}
                        tabIndex={-1}
                        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md
                            ${theme === 'light' ? 'bg-white' : 'bg-[#1E293B]'} 
                            rounded-xl shadow-xl p-6`}
                    >
                        <div className="flex flex-col items-center text-center">
                            {/* Warning Icon with animation */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className={`p-3 rounded-full mb-4 ${theme === 'light'
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-red-900/20 text-red-400'
                                    }`}
                            >
                                <AlertTriangle className="w-6 h-6" />
                            </motion.div>

                            {/* Title with animation */}
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-[#1F2937]' : 'text-[#F9FAFB]'}`}
                            >
                                {title}
                            </motion.h2>

                            {/* Message with animation */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`mb-6 ${theme === 'light' ? 'text-[#4B5563]' : 'text-[#9CA3AF]'}`}
                            >
                                {message}
                            </motion.p>

                            {/* Actions with animation */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-3 w-full"
                            >
                                <ThemedButton
                                    variant="secondary"
                                    onClick={onClose}
                                    className="flex-1 hover:opacity-90 transition-opacity"
                                >
                                    Cancel
                                </ThemedButton>
                                <ThemedButton
                                    variant="primary"
                                    onClick={() => {
                                        onConfirm()
                                        onClose()
                                    }}
                                    className={`flex-1 ${theme === 'light'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                        } transition-colors`}
                                >
                                    Delete
                                </ThemedButton>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
} 