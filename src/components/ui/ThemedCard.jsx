import { useTheme } from '../../context/ThemeContext';

export const ThemedCard = ({
    children,
    className = '',
    hoverable = false,
    ...props
}) => {
    const { theme } = useTheme();

    return (
        <div
            className={`
                rounded-2xl transition-all duration-200 border
                ${theme === 'light'
                    ? 'bg-white border-slate-200/80 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800/80 shadow-md'
                }
                ${hoverable
                    ? 'hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5'
                    : ''
                }
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
};

export default ThemedCard;