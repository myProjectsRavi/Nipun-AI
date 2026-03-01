import type { SECFiling } from './types';

/**
 * Fetch latest SEC filings from EDGAR.
 * No API key required — uses the free SEC EDGAR full-text search API.
 * Requires a User-Agent header with contact info (SEC requirement).
 */
export async function fetchSECFilings(ticker: string): Promise<SECFiling[]> {
    // Step 1: Look up CIK from ticker
    const tickerLower = ticker.toLowerCase();
    const lookupRes = await fetch(
        `https://efts.sec.gov/LATEST/search-index?q="${encodeURIComponent(ticker)}"&dateRange=custom&startdt=${getDateMonthsAgo(6)}&enddt=${getToday()}&forms=10-K,10-Q,8-K,4&from=0&size=10`,
        {
            headers: {
                'User-Agent': 'NipunAI research@nipun.ai',
                'Accept': 'application/json',
            },
        }
    );

    // Fallback: try the EDGAR full-text search
    const searchRes = await fetch(
        `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker)}%22&forms=10-K,10-Q,8-K,4&dateRange=custom&startdt=${getDateMonthsAgo(6)}&enddt=${getToday()}&from=0&size=10`,
        {
            headers: {
                'User-Agent': 'NipunAI research@nipun.ai',
                'Accept': 'application/json',
            },
        }
    );

    // Try the simpler EDGAR company search
    const companyRes = await fetch(
        `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker.toUpperCase())}%22&forms=10-K,10-Q,8-K&from=0&size=8`,
        {
            headers: {
                'User-Agent': 'NipunAI research@nipun.ai',
                'Accept': 'application/json',
            },
        }
    );

    // Try EDGAR full-text search API
    const ftRes = await fetch(
        `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(ticker)}&from=0&size=10`,
        {
            headers: {
                'User-Agent': 'NipunAI research@nipun.ai',
                'Accept': 'application/json',
            },
        }
    );

    // Use the ticker lookup to get CIK, then fetch filings  
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

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

function getDateMonthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
}
