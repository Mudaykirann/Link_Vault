import { useTheme } from '../../context/ThemeContext';
import { themeConfig } from '../../utils/theme'; // Updated import

export const ThemedInput = ({
    type = 'text',
    className = '',
    ...props
}) => {
    const { theme } = useTheme();

    return (
        <input
            type={type}
            className={`
                themed-input
                ${className}
            `}
            {...props}
        />
    );
}; 