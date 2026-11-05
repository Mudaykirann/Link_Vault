import { useTheme } from '../../context/ThemeContext';
import { themeConfig } from '../../utils/theme'; // Updated import

export const ThemedCard = ({
    children,
    className = '',
    ...props
}) => {
    const { theme } = useTheme();

    return (
        <div
            className={`
                bg-white dark:bg-slate-800
                border border-light-border dark:border-dark-border
                rounded-lg shadow-sm
                transition-colors duration-200
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}; 