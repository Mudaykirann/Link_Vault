/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { LinkIcon } from 'lucide-react';

const LoadingScreen = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsVisible(false);
                        onLoadingComplete?.();
                    }, 500);
                    return 100;
                }
                return prev + 1;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [onLoadingComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-slate-900'
                        }`}
                >
                    {/* Logo Container */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className={`text-4xl flex items-center font-bold ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'
                            }`}>
                            <LinkIcon className={`w-6 h-6 mr-2 ${theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}`} />
                            <span className={`text-xl md:text-2xl font-bold transition-colors duration-200
                            ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                Link<span className={theme === 'light' ? 'text-blue-600' : 'text-yellow-400'}>Vault</span>
                            </span>
                        </div>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full ${theme === 'light'
                                ? 'bg-blue-600'
                                : 'bg-yellow-400'
                                }`}
                        />
                    </div>

                    {/* Progress Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-4 text-lg font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                            }`}
                    >
                        {progress}%
                    </motion.div>

                    {/* Loading Message */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`mt-2 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}
                    >
                        Preparing your vault...
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;