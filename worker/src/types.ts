/**
 * ─── Worker Types ─────────────────────────────────────────────────
 * Re-exports all shared data-model types from shared/types.ts
 * and adds worker-only interfaces (Cloudflare bindings).
 */
export * from '../../shared/types';

/** Real balance sheet data from Finnhub financials-reported endpoint */
export interface BalanceSheetData {
    totalAssets: number;
    totalCurrentAssets: number;
    totalCurrentLiabilities: number;
    totalLiabilities: number;
    retainedEarnings: number;
    ebit: number;
    totalRevenue: number;
    stockholdersEquity: number;
}

// ─── Worker Environment (Cloudflare-only) ──────────────────────────
export interface Env {
    ENVIRONMENT: string;
    ALLOWED_ORIGINS: string;
    /** Set to 'true' in YOUR Cloudflare dashboard to force demo-only mode on hosted instance */
    DEMO_ONLY?: string;
    /**
     * Contact email for SEC EDGAR User-Agent header (required by SEC fair-access policy).
     * Store as a Cloudflare secret: `wrangler secret put SEC_API_EMAIL`
     * Falls back to the project GitHub URL if not set.
     */
    SEC_API_EMAIL?: string;
}
