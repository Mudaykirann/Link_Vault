/* eslint-disable no-unused-vars */
import { useTheme } from '../../context/ThemeContext'

export const ThemedButton = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const { theme } = useTheme()

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return theme === 'light'
                    ? 'bg-[#0E7490] hover:bg-[#155E75] text-white font-bold shadow-md shadow-cyan-900/15 active:scale-[0.98]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 active:scale-[0.98]'
            case 'secondary':
                return theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold active:scale-[0.98]'
                    : 'bg-[#12151C] hover:bg-[#181C24] text-slate-200 border border-[#252C37] hover:border-cyan-500/50 active:scale-[0.98]'
            case 'outline':
                return theme === 'light'
                    ? 'border-2 border-slate-300 hover:border-[#0E7490] hover:bg-slate-50 text-slate-800 font-semibold active:scale-[0.98]'
                    : 'border border-[#252C37] hover:bg-[#12151C] text-slate-200 hover:border-cyan-500/60 active:scale-[0.98]'
            case 'ghost':
                return theme === 'light'
                    ? 'hover:bg-slate-100 text-slate-700 hover:text-[#0E7490]'
                    : 'hover:bg-[#12151C] text-slate-400 hover:text-cyan-400'
            default:
                return theme === 'light'
                    ? 'bg-[#0E7490] hover:bg-[#155E75] text-white font-bold shadow-md shadow-cyan-900/15 active:scale-[0.98]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 active:scale-[0.98]'
        }
    }

    return (
        <button
            className={`
                inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none
                ${getVariantClasses()}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
}

export default ThemedButton