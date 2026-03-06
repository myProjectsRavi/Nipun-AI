/**
 * ─── Worker Types ─────────────────────────────────────────────────
 * Re-exports all shared data-model types from shared/types.ts
 * and adds worker-only interfaces (Cloudflare bindings).
 */
export * from '../../shared/types';

// ─── Worker Environment (Cloudflare-only) ──────────────────────────
export interface Env {
    ENVIRONMENT: string;
    ALLOWED_ORIGINS: string;
    /** Set to 'true' in YOUR Cloudflare dashboard to force demo-only mode on hosted instance */
    DEMO_ONLY?: string;
}
