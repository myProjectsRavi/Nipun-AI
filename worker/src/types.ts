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
}
