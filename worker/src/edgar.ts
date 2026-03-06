import type { SECFiling } from './types';

/**
 * Fetch latest SEC filings from EDGAR.
 * No API key required — uses the free SEC EDGAR full-text search API.
 * Requires a User-Agent header with contact info (SEC requirement).
 */
export async function fetchSECFilings(ticker: string): Promise<SECFiling[]> {
    // Look up CIK from SEC's ticker map, then fetch filings by CIK
    const tickerLower = ticker.toLowerCase();

    try {
        const tickerMapRes = await fetch(
            'https://www.sec.gov/files/company_tickers.json',
            { headers: { 'User-Agent': 'NipunAI research@nipun.ai' } }
        );

        if (!tickerMapRes.ok) return [];

        const tickerMap = (await tickerMapRes.json()) as Record<string, { cik_str: number; ticker: string; title: string }>;
        let cik: string | null = null;

        for (const entry of Object.values(tickerMap)) {
            if (entry.ticker.toLowerCase() === tickerLower) {
                cik = String(entry.cik_str).padStart(10, '0');
                break;
            }
        }

        if (!cik) return [];

        // Fetch filings from EDGAR
        const filingsRes = await fetch(
            `https://data.sec.gov/submissions/CIK${cik}.json`,
            { headers: { 'User-Agent': 'NipunAI research@nipun.ai' } }
        );

        if (!filingsRes.ok) return [];

        const filingsData = (await filingsRes.json()) as {
            filings?: {
                recent?: {
                    form?: string[];
                    filingDate?: string[];
                    primaryDocument?: string[];
                    primaryDocDescription?: string[];
                    accessionNumber?: string[];
                };
            };
        };

        const recent = filingsData.filings?.recent;
        if (!recent || !recent.form) return [];

        const filings: SECFiling[] = [];
        const targetForms = new Set(['10-K', '10-Q', '8-K', '4', '13F-HR', 'SC 13G', 'DEF 14A']);

        for (let i = 0; i < Math.min(recent.form.length, 100) && filings.length < 8; i++) {
            if (targetForms.has(recent.form[i])) {
                const accession = (recent.accessionNumber?.[i] || '').replace(/-/g, '');
                const doc = recent.primaryDocument?.[i] || '';
                filings.push({
                    type: recent.form[i],
                    dateFiled: recent.filingDate?.[i] || '',
                    description: recent.primaryDocDescription?.[i] || recent.form[i],
                    url: `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${accession}/${doc}`,
                });
            }
        }

        return filings;
    } catch {
        return [];
    }
}
