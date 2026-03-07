import type { SECFiling } from './types';

/** Cache the ~3 MB SEC ticker map for 24 hours at the edge. */
const TICKER_MAP_URL = 'https://www.sec.gov/files/company_tickers.json';
const TICKER_MAP_CACHE_TTL = 86_400; // 24 h in seconds

/**
 * Build SEC-compliant User-Agent header.
 * SEC EDGAR fair-access policy requires a contact email or URL.
 * Self-hosters: set the SEC_API_EMAIL secret via `wrangler secret put SEC_API_EMAIL`.
 */
function buildSecUA(secEmail?: string): { 'User-Agent': string } {
    return {
        'User-Agent': secEmail
            ? `NipunAI ${secEmail}`
            : 'NipunAI/1.0 (https://github.com/myProjectsRavi/Nipun-AI)',
    };
}

/**
 * Fetch the SEC company_tickers.json with Cloudflare Cache API.
 * First request per PoP fetches from SEC; subsequent requests are instant.
 */
async function fetchTickerMap(secUA: { 'User-Agent': string }): Promise<Record<string, { cik_str: number; ticker: string; title: string }> | null> {
    const cache = caches.default;
    const cacheKey = new Request(TICKER_MAP_URL);

    // 1. Try cache
    const cached = await cache.match(cacheKey);
    if (cached) return cached.json();

    // 2. Origin fetch
    const res = await fetch(TICKER_MAP_URL, { headers: secUA });
    if (!res.ok) return null;

    // 3. Clone + cache with TTL
    const toCache = new Response(res.clone().body, {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${TICKER_MAP_CACHE_TTL}` },
    });
    await cache.put(cacheKey, toCache);

    return res.json();
}

/**
 * Fetch latest SEC filings from EDGAR.
 * No API key required — uses the free SEC EDGAR full-text search API.
 * Requires a User-Agent header with contact info (SEC requirement).
 * Returns both filings and the CIK (Central Index Key) for source links.
 */
export async function fetchSECFilings(ticker: string, secEmail?: string): Promise<{ filings: SECFiling[]; cik: string | null }> {
    // Look up CIK from SEC's ticker map, then fetch filings by CIK
    const tickerLower = ticker.toLowerCase();
    const secUA = buildSecUA(secEmail);

    try {
        const tickerMap = await fetchTickerMap(secUA);
        if (!tickerMap) return { filings: [], cik: null };
        let cik: string | null = null;

        for (const entry of Object.values(tickerMap)) {
            if (entry.ticker.toLowerCase() === tickerLower) {
                cik = String(entry.cik_str).padStart(10, '0');
                break;
            }
        }

        if (!cik) return { filings: [], cik: null };

        // Fetch filings from EDGAR
        const filingsRes = await fetch(
            `https://data.sec.gov/submissions/CIK${cik}.json`,
            { headers: secUA }
        );

        if (!filingsRes.ok) return { filings: [], cik };

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
        if (!recent || !recent.form) return { filings: [], cik };

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

        return { filings, cik };
    } catch {
        return { filings: [], cik: null };
    }
}
