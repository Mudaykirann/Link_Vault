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
                    }, 200);
                    return 100;
                }
                return prev + 5;
            });
        }, 16);

        return () => clearInterval(interval);
    }, [onLoadingComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-200 ${
                        theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-[#050608]'
                    }`}
                >
                    {/* Ambient Obsidian Glow */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] opacity-25 ${
                            theme === 'light' ? 'bg-cyan-200' : 'bg-cyan-900/30'
                        }`} />
                    </div>

                    {/* Logo Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8 relative z-10 flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <LinkIcon className="w-7 h-7 text-slate-950" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            <span className={theme === 'light' ? 'text-[#0F172A]' : 'text-white'}>Link</span>
                            <span className="text-cyan-500">Vault</span>
                        </div>
                    </motion.div>

                    {/* Laser Obsidian Progress Bar */}
                    <div className="relative z-10 w-64 sm:w-72">
                        <div className={`h-2 rounded-full overflow-hidden p-[1px] border ${
                            theme === 'light' 
                                ? 'bg-slate-200/80 border-slate-300' 
                                : 'bg-[#0B0D11] border-[#181C24]'
                        }`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.15 }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                            />
                        </div>

                        {/* Progress Status Readout */}
                        <div className="mt-4 flex items-center justify-between text-xs font-mono">
                            <span className={theme === 'light' ? 'text-slate-500 font-medium' : 'text-[#8A94A6]'}>
                                Initializing vault...
                            </span>
                            <span className="font-bold text-cyan-600 dark:text-cyan-400">
                                {progress}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
