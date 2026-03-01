/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['Outfit', 'system-ui', 'sans-serif'],
                body: ['Nunito Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                surface: {
                    DEFAULT: '#0F172A',   // Rich navy base
                    raised: '#1E293B',    // Card backgrounds
                    elevated: '#273548',  // Hover/active states
                    overlay: '#334155',   // Modal overlays
                },
                accent: {
                    DEFAULT: '#818CF8',   // Soft indigo
                    light: '#A5B4FC',
                    dark: '#6366F1',
                    glow: 'rgba(129, 140, 248, 0.15)',
                },
                gold: {
                    DEFAULT: '#F59E0B',   // Warm gold accent
                    light: '#FCD34D',
                    dark: '#D97706',
                    glow: 'rgba(245, 158, 11, 0.15)',
                },
                emerald: {
                    DEFAULT: '#34D399',
                    light: '#6EE7B7',
                    dark: '#059669',
                },
                rose: {
                    DEFAULT: '#FB7185',
                    light: '#FDA4AF',
                    dark: '#E11D48',
                },
                sky: {
                    DEFAULT: '#38BDF8',
                    light: '#7DD3FC',
                    dark: '#0284C7',
                },
                muted: '#94A3B8',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                glow: '0 0 20px rgba(129, 140, 248, 0.1)',
                'glow-gold': '0 0 20px rgba(245, 158, 11, 0.1)',
                card: '0 4px 24px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 8px 40px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)',
                premium: '0 4px 30px rgba(0, 0, 0, 0.25), 0 0 40px rgba(129, 140, 248, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.4s ease-out forwards',
                shimmer: 'shimmer 2.5s linear infinite',
                glow: 'glowPulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(129, 140, 248, 0.1)' },
                    '50%': { boxShadow: '0 0 40px rgba(129, 140, 248, 0.2)' },
                },
            },
        },
    },
    plugins: [],
};
