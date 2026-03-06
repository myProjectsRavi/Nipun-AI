/**
 * ─── Research Sources Builder ──────────────────────────────────────
 * Generates 50+ categorized hyperlinks to primary data sources
 * for every analysis. ZERO API calls — all URLs are deterministic.
 *
 * This transforms Nipun AI from "AI opinion" to "verifiable research
 * document" — every number can be traced to its source.
 */
import type { ResearchSources, SECFiling } from './types';

/** Build a complete research sources object for a given ticker */
export function buildResearchSources(
    ticker: string,
    cik: string | null,
    secFilings: SECFiling[] | null,
): ResearchSources {
    const t = ticker.toUpperCase();
    const tLower = ticker.toLowerCase();

    // CIK formatting for SEC URLs
    const cikNum = cik ? cik.replace(/^0+/, '') : null;
    const cikPadded = cik ?? null;

    return {
        financialData: [
            { label: `Finnhub Quote — ${t}`, url: `https://finnhub.io/api/v1/quote?symbol=${t}` },
            { label: `Finnhub Key Metrics — ${t}`, url: `https://finnhub.io/api/v1/stock/metric?symbol=${t}&metric=all` },
            { label: `Finnhub Company Profile — ${t}`, url: `https://finnhub.io/api/v1/stock/profile2?symbol=${t}` },
            { label: `Finnhub Historical Candles — ${t}`, url: `https://finnhub.io/api/v1/stock/candle?symbol=${t}&resolution=D&count=200` },
        ],

        technicalAnalysis: [
            { label: `TradingView Chart — ${t}`, url: `https://www.tradingview.com/chart/?symbol=${t}` },
            { label: `StockCharts — ${t}`, url: `https://stockcharts.com/h-sc/ui?s=${t}` },
            { label: 'Investopedia — RSI Guide', url: 'https://www.investopedia.com/terms/r/rsi.asp' },
            { label: 'Investopedia — MACD Guide', url: 'https://www.investopedia.com/terms/m/macd.asp' },
            { label: 'Investopedia — Bollinger Bands', url: 'https://www.investopedia.com/terms/b/bollingerbands.asp' },
            { label: 'Investopedia — Fibonacci Retracement', url: 'https://www.investopedia.com/terms/f/fibonacciretracement.asp' },
        ],

        secFilings: [
            ...(cikNum
                ? [{ label: `EDGAR Company Page — ${t}`, url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNum}&type=&dateb=&owner=include&count=40` }]
                : [{ label: `EDGAR Search — ${t}`, url: `https://efts.sec.gov/LATEST/search-index?q=${t}&dateRange=custom&startdt=2023-01-01` }]
            ),
            ...(cikPadded
                ? [{ label: `SEC XBRL Financial Data`, url: `https://data.sec.gov/api/xbrl/companyfacts/CIK${cikPadded}.json` }]
                : []
            ),
            { label: `SEC Full-Text Search — ${t}`, url: `https://efts.sec.gov/LATEST/search-index?q=%22${t}%22` },
            // Include direct filing links from the analysis
            ...(secFilings ?? []).slice(0, 4).map(f => ({
                label: `${f.type} — ${f.dateFiled}`,
                url: f.url,
            })),
        ],

        financialStatements: [
            { label: `Yahoo Finance — Financials`, url: `https://finance.yahoo.com/quote/${t}/financials` },
            { label: `Yahoo Finance — Balance Sheet`, url: `https://finance.yahoo.com/quote/${t}/balance-sheet` },
            { label: `Yahoo Finance — Cash Flow`, url: `https://finance.yahoo.com/quote/${t}/cash-flow` },
            { label: `Macrotrends — Revenue`, url: `https://www.macrotrends.net/stocks/charts/${t}/${tLower}/revenue` },
            { label: `Macrotrends — Income Statement`, url: `https://www.macrotrends.net/stocks/charts/${t}/${tLower}/income-statement` },
            { label: `Macrotrends — Balance Sheet`, url: `https://www.macrotrends.net/stocks/charts/${t}/${tLower}/balance-sheet` },
        ],

        companyResearch: [
            { label: `Google Finance — ${t}`, url: `https://www.google.com/finance/quote/${t}:NASDAQ` },
            { label: `Yahoo Finance — ${t}`, url: `https://finance.yahoo.com/quote/${t}` },
            { label: `MarketWatch — ${t}`, url: `https://www.marketwatch.com/investing/stock/${tLower}` },
            { label: `Wikipedia — ${t}`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${t}+company` },
        ],

        newsSentiment: [
            { label: `Reddit Search — ${t}`, url: `https://www.reddit.com/search/?q=${t}+stock&sort=new` },
            { label: `Yahoo Finance News — ${t}`, url: `https://finance.yahoo.com/quote/${t}/news` },
            { label: `Google News — ${t}`, url: `https://news.google.com/search?q=${t}+stock` },
            { label: `Seeking Alpha — ${t}`, url: `https://seekingalpha.com/symbol/${t}` },
            { label: `Benzinga — ${t}`, url: `https://www.benzinga.com/quote/${tLower}` },
        ],

        analystData: [
            { label: `Finnhub Analyst Recommendations`, url: `https://finnhub.io/api/v1/stock/recommendation?symbol=${t}` },
            { label: `Finnhub Price Targets`, url: `https://finnhub.io/api/v1/stock/price-target?symbol=${t}` },
            { label: `Finnhub Institutional Ownership`, url: `https://finnhub.io/api/v1/institutional-ownership?symbol=${t}` },
            { label: `TipRanks — ${t}`, url: `https://www.tipranks.com/stocks/${tLower}` },
            { label: `Simply Wall St — ${t}`, url: `https://simplywall.st/stocks/us/tech/nasdaq-${tLower}` },
        ],

        valuationReferences: [
            { label: 'Investopedia — DCF Guide', url: 'https://www.investopedia.com/terms/d/dcf.asp' },
            { label: 'Investopedia — Graham Number', url: 'https://www.investopedia.com/terms/g/graham-number.asp' },
            { label: 'Investopedia — PEG Ratio (Peter Lynch)', url: 'https://www.investopedia.com/terms/p/pegratio.asp' },
            { label: 'Investopedia — Altman Z-Score', url: 'https://www.investopedia.com/terms/a/altman.asp' },
            { label: 'Investopedia — Piotroski F-Score', url: 'https://www.investopedia.com/terms/p/piotroski-score.asp' },
        ],

        earningsDividends: [
            { label: `Yahoo Finance — Earnings Calendar`, url: `https://finance.yahoo.com/calendar/earnings?symbol=${t}` },
            { label: `Yahoo Finance — Dividend History`, url: `https://finance.yahoo.com/quote/${t}/history?filter=div` },
            { label: `NASDAQ — Earnings`, url: `https://www.nasdaq.com/market-activity/stocks/${tLower}/earnings` },
            { label: `Finnhub — Earnings Surprises`, url: `https://finnhub.io/api/v1/stock/earnings?symbol=${t}` },
        ],

        riskCompliance: [
            { label: `Options Chain — ${t}`, url: `https://finance.yahoo.com/quote/${t}/options` },
            { label: `Short Interest — ${t}`, url: `https://www.nasdaq.com/market-activity/stocks/${tLower}/short-interest` },
            { label: 'SEC Enforcement Actions', url: 'https://www.sec.gov/divisions/enforce/enforcea.htm' },
            { label: 'FINRA BrokerCheck', url: 'https://brokercheck.finra.org/' },
        ],
    };
}

/**
 * Category display names for UI rendering.
 * Order matches the interface field order.
 */
export const RESEARCH_CATEGORIES: Record<keyof ResearchSources, { icon: string; label: string }> = {
    financialData:       { icon: '📈', label: 'Financial Data (Finnhub)' },
    technicalAnalysis:   { icon: '📊', label: 'Technical Analysis Sources' },
    secFilings:          { icon: '📋', label: 'SEC Filings & Regulatory' },
    financialStatements: { icon: '💰', label: 'Financial Statements' },
    companyResearch:     { icon: '🏢', label: 'Company Research' },
    newsSentiment:       { icon: '📰', label: 'News & Sentiment Sources' },
    analystData:         { icon: '🎯', label: 'Analyst & Institutional Data' },
    valuationReferences: { icon: '🧮', label: 'Valuation Model References' },
    earningsDividends:   { icon: '🔬', label: 'Earnings & Dividends' },
    riskCompliance:      { icon: '🛡️', label: 'Risk & Compliance' },
};
