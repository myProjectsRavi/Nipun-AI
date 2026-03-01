/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                base: {
                    DEFAULT: '#0A0A0F',
                    50: '#14141F',
                    100: '#1A1A2A',
                    200: '#222235',
                    300: '#2A2A40',
                },
                surface: {
                    DEFAULT: '#12121C',
                    light: '#1C1C2E',
                    lighter: '#252540',
                },
                accent: {
                    DEFAULT: '#0EA5E9',
                    light: '#38BDF8',
                    dark: '#0284C7',
                    glow: 'rgba(14, 165, 233, 0.15)',
                },
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#EF4444',
                muted: '#6B7280',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
                'gradient-glow': 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(14,165,233,0) 60%)',
                'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
                'glow-lg': '0 0 40px rgba(14, 165, 233, 0.2)',
                'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glowPulse: {
                    '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.1)' },
                    '100%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.25)' },
                },
            },
        },
    },
    plugins: [],
};
