import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const LoadingSpinner = ({ message = 'Accessing LinkVault...' }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/60 dark:bg-[#050608]/85 backdrop-blur-md z-50 p-4">
            <motion.div
                className="relative flex flex-col items-center justify-center bg-white dark:bg-[#0B0D11] border border-slate-200 dark:border-[#1E2430] p-8 rounded-3xl shadow-2xl shadow-cyan-500/15 max-w-xs w-full text-center"
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {/* Luminous Ambient Glow */}
                <div className="absolute inset-0 rounded-3xl bg-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Round Concentric Radar Spinner */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                    {/* Outer high-contrast rotating ring */}
                    <div className="absolute inset-0 rounded-full border-[3.5px] border-slate-200 dark:border-slate-800/80 border-t-[#0E7490] dark:border-t-cyan-400 border-r-[#0E7490] dark:border-r-cyan-400 animate-spin shadow-[0_0_15px_rgba(6,182,212,0.35)]" />

                    {/* Middle counter-rotating ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#0E7490]/60 dark:border-b-cyan-300/80 border-l-[#0E7490]/60 dark:border-l-cyan-300/80 animate-[spin_1.4s_linear_infinite_reverse]" />

                    {/* Central pulsating icon badge */}
                    <div className="relative w-9 h-9 rounded-full bg-cyan-50 dark:bg-[#12151C] border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center shadow-inner">
                        <Shield className="w-4 h-4 text-[#0E7490] dark:text-cyan-400 animate-pulse" />
                    </div>
                </div>

                {/* Status Message */}
                <div className="space-y-1">
                    <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                        {message}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
                        <span>Encrypted Session</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default LoadingSpinner