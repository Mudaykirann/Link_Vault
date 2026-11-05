/**
 * Theme Configuration
 * Defines color palettes and other theme-related values
 */

export const themeConfig = {
    light: {
        // Main colors
        primary: '#2563EB',    // Royal Blue - Buttons, Links, Highlights
        secondary: '#7C3AED',  // Violet - CTAs, Icons
        background: '#F9FAFB', // Soft White - Main Background
        cardBg: '#E5E7EB',    // Cool Gray - Cards, Sections
        text: '#1F2937',      // Charcoal Gray - Main Text
        accent: '#60A5FA',    // Sky Blue - Hover Effects

        // Interactive states
        primaryHover: '#1D4ED8',
        secondaryHover: '#6D28D9',
        success: '#10B981',   // Emerald - Success States
        error: '#EF4444',     // Rose Red - Error States
        warning: '#F59E0B',   // Amber - Warning States

        // UI Elements
        border: '#E5E7EB',
        inputBg: '#FFFFFF',
        divider: '#E5E7EB',
        shadow: 'rgba(0, 0, 0, 0.1)',
    },
    dark: {
        // Main colors
        primary: '#1E293B',   // Deep Navy - Main Background
        secondary: '#334155',  // Slate Gray - Cards
        accent: '#FACC15',    // Gold - CTAs, Highlights
        background: '#1E293B', // Deep Navy
        cardBg: '#334155',    // Slate Gray
        text: '#F9FAFB',      // Pure White

        // Interactive states
        primaryHover: '#475569',
        accentHover: '#EAB308',
        success: '#10B981',   // Emerald
        error: '#EF4444',     // Rose Red
        warning: '#F59E0B',   // Amber

        // UI Elements
        border: '#334155',
        inputBg: '#1E293B',
        divider: '#334155',
        shadow: 'rgba(0, 0, 0, 0.25)',
    },
    // Common values
    transition: {
        default: 'transition-all duration-300',
        fast: 'transition-all duration-150',
        slow: 'transition-all duration-500',
    },
    rounded: {
        sm: 'rounded-md',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        full: 'rounded-full',
    },
    shadow: {
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    },
};

// Utility function to get theme value
export const getThemeValue = (theme, path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], themeConfig[theme]);
};

// Common color combinations for different states
export const colorCombinations = {
    button: {
        primary: {
            light: `bg-[${themeConfig.light.primary}] hover:bg-[${themeConfig.light.primaryHover}] text-white`,
            dark: `bg-[${themeConfig.dark.accent}] hover:bg-[${themeConfig.dark.accentHover}] text-[${themeConfig.dark.primary}]`,
        },
        secondary: {
            light: `bg-[${themeConfig.light.secondary}] hover:bg-[${themeConfig.light.secondaryHover}] text-white`,
            dark: `bg-[${themeConfig.dark.secondary}] hover:bg-[${themeConfig.dark.primaryHover}] text-white`,
        },
    },
    card: {
        light: `bg-[${themeConfig.light.cardBg}] text-[${themeConfig.light.text}]`,
        dark: `bg-[${themeConfig.dark.cardBg}] text-[${themeConfig.dark.text}]`,
    },
    text: {
        light: `text-[${themeConfig.light.text}]`,
        dark: `text-[${themeConfig.dark.text}]`,
    },
};

// Custom hook for using theme values (create this in a separate file if preferred)
export const useThemeValue = (path, theme) => {
    return getThemeValue(theme, path);
}; 