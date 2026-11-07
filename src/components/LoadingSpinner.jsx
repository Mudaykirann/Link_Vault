import { motion } from 'framer-motion'

const LoadingSpinner = ({ inline = false, message = null }) => {
    if (inline) {
        return (
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-[#94A3B8]">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-[#1E2430] border-t-[#0E7490] dark:border-t-cyan-400 animate-spin" />
                {message && <span>{message}</span>}
            </div>
        )
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            {/* Top-of-screen ultra-thin hairline progress beam */}
            <div className="h-[2.5px] w-full bg-slate-200/40 dark:bg-slate-900/60 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-transparent via-[#0E7490] to-cyan-400 dark:via-cyan-400 dark:to-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        ease: 'easeInOut'
                    }}
                />
            </div>
        </div>
    )
}

export default LoadingSpinner