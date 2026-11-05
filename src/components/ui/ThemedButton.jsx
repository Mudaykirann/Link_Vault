/* eslint-disable no-unused-vars */
import { useTheme } from '../../context/ThemeContext'
import { colors } from '../../utils/theme'

export const ThemedButton = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const { theme } = useTheme()
    const themeColors = colors[theme]

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return theme === 'light'
                    ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                    : 'bg-[#FACC15] hover:bg-[#EAB308] text-[#0f172a]'
            case 'secondary':
                return theme === 'light'
                    ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563]'
                    : 'bg-[#1E293B] hover:bg-[#334155] text-[#9CA3AF]'
            default:
                return theme === 'light'
                    ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                    : 'bg-[#FACC15] hover:bg-[#EAB308] text-[#0f172a]'
        }
    }

    return (
        <button
            className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer
                ${getVariantClasses()}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
} 