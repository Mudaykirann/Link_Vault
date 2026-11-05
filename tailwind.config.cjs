/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                dark: {
                    primary: '#0f172a',      // Dark blue background
                    secondary: '#1E293B',    // Slightly lighter blue
                    accent: '#FACC15',       // Yellow accent
                    accentHover: '#EAB308',  // Darker yellow
                    text: '#F9FAFB',         // Almost white text
                    textSecondary: '#9CA3AF',// Secondary text
                    border: '#334155',       // Border color
                    hover: '#1E293B',        // Hover state
                },
                light: {
                    primary: '#2563EB',      // Blue primary
                    primaryHover: '#1D4ED8', // Darker blue
                    background: '#FFFFFF',    // White background
                    text: '#1F2937',         // Dark text
                    textSecondary: '#4B5563',// Secondary text
                    border: '#E5E7EB',       // Border color
                    hover: '#F3F4F6',        // Hover state
                }
            },
            backgroundColor: theme => ({
                ...theme('colors'),
            }),
            textColor: theme => ({
                ...theme('colors'),
            }),
            borderColor: theme => ({
                ...theme('colors'),
            }),
        }
    },
    safelist: [
        {
            pattern: /bg-(light|dark)-(primary|secondary|accent|background|text|border|hover)/,
            variants: ['hover', 'focus', 'active', 'disabled', 'group-hover'],
        },
        {
            pattern: /text-(light|dark)-(primary|secondary|accent|text|textSecondary)/,
            variants: ['hover', 'focus', 'active', 'disabled', 'group-hover'],
        },
        {
            pattern: /border-(light|dark)-(primary|secondary|accent|border)/,
            variants: ['hover', 'focus', 'active', 'disabled', 'group-hover'],
        },
    ],
    plugins: [
        function ({ addVariant }) {
            addVariant('group-hover', ':merge(.group):hover &')
        }
    ],
} 