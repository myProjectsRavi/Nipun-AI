import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
    /* ── Ignores ───────────────────────────────────────────── */
    { ignores: ['**/dist/', '**/node_modules/', '**/.wrangler/'] },

    /* ── Base: JS + TS recommended ─────────────────────────── */
    js.configs.recommended,
    ...tseslint.configs.recommended,

    /* ── Frontend (React) ──────────────────────────────────── */
    {
        files: ['frontend/src/**/*.{ts,tsx}'],
        plugins: { 'react-hooks': reactHooks },
        rules: reactHooks.configs.recommended.rules,
        languageOptions: { globals: globals.browser },
    },

    /* ── Worker (Cloudflare Workers) ───────────────────────── */
    {
        files: ['worker/src/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.worker,
                caches: 'readonly',
            },
        },
    },

    /* ── Shared rules ──────────────────────────────────────── */
    {
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },

    /* ── Disable formatting rules (Prettier handles them) ── */
    prettier,
);
