import { useTheme } from '../../context/ThemeContext';

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
                w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none
                ${theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
                }
                ${className}
            `}
            {...props}
        />
    );
};

export default ThemedInput;