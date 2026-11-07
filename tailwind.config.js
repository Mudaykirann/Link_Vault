/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                // Obsidian & Electric Cyan Brand Palette
                brand: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',  // Electric Cyan
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63',
                    950: '#082f49',
                },
                accent: {
                    cyan: '#00F0FF',
                    mint: '#10B981',
                    emerald: '#059669',
                },
                dark: {
                    primary: '#08090A',      // True Obsidian Black Canvas
                    secondary: '#0F1216',    // Matte Carbon Surface
                    surface: '#14181F',      // Elevated Card Surface
                    accent: '#06B6D4',       // Electric Cyan Accent
                    accentHover: '#22D3EE',  // Bright Cyan Hover
                    text: '#FFFFFF',         // Crisp White
                    textSecondary: '#8A94A6',// Cool Platinum Slate
                    border: '#1B2028',       // Hairline Carbon Border
                    borderSubtle: '#252C37', // Stronger Border
                    hover: '#181D25',        // Hover State
                },
                light: {
                    primary: '#0891B2',      // Deep Cyan Primary
                    primaryHover: '#0E7490', // Darker Cyan Hover
                    background: '#F7F8F9',    // Platinum Canvas
                    surface: '#FFFFFF',      // Pure White Card Surface
                    text: '#0F172A',         // Slate 900 Text
                    textSecondary: '#475569',// Slate 600 Secondary
                    border: '#E2E8F0',       // Soft Border
                    hover: '#F1F5F9',        // Light Hover
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