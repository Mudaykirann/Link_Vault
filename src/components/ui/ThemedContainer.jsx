import { themeConfig } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

export const ThemedContainer = ({ children, variant = 'default', className = '' }) => {
    const { theme } = useTheme();

    const variants = {
        default: `bg-[${themeConfig[theme].background}] text-[${themeConfig[theme].text}]`,
        card: `bg-[${themeConfig[theme].cardBg}] text-[${themeConfig[theme].text}]`,
        accent: `bg-[${themeConfig[theme].accent}] text-[${themeConfig[theme].primary}]`,
    };

    return (
        <div className={`${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}; 