/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Premium deep navy palette — not flat black
                base: {
                    DEFAULT: '#0C1222',
                    50: '#111A2E',
                    100: '#162038',
                    200: '#1B2842',
                    300: '#22334F',
                },
                surface: {
                    DEFAULT: '#0F1729',
                    light: '#182240',
                    lighter: '#1E2D52',
                },
                accent: {
                    DEFAULT: '#6366F1',  // Indigo — luxurious
                    light: '#818CF8',
                    dark: '#4F46E5',
                    glow: 'rgba(99, 102, 241, 0.15)',
                },
                cyan: {
                    DEFAULT: '#22D3EE',
                    light: '#67E8F9',
                    dark: '#06B6D4',
                },
                emerald: {
                    DEFAULT: '#34D399',
                    light: '#6EE7B7',
                    dark: '#10B981',
                },
                success: '#34D399',
                warning: '#FBBF24',
                danger: '#F87171',
                muted: '#94A3B8',
                gold: '#F59E0B',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
                'gradient-premium': 'linear-gradient(135deg, #0C1222 0%, #111A2E 30%, #162038 60%, #0C1222 100%)',
                'gradient-glow': 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0) 60%)',
                'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                'gradient-hero': 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(34,211,238,0.04) 50%, transparent 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
                'glow-lg': '0 0 40px rgba(99, 102, 241, 0.2)',
                'glow-cyan': '0 0 30px rgba(34, 211, 238, 0.15)',
                'card': '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
                'card-hover': '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
                'premium': '0 20px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'slide-in': 'slideIn 0.4s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                'gradient-shift': 'gradientShift 8s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-12px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glowPulse: {
                    '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.08)' },
                    '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
};
