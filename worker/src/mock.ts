import type {
    FinancialData,
    SentimentResult,
    RiskFactor,
    Catalyst,
    AuditResult,
    TechnicalAnalysis,
    InsiderActivity,
    EarningsData,
    PeerComparison,
    SECFiling,
    AIConsensus,
    InvestmentScore,
    FinancialHealth,
    NipunScore,
    ScenarioAnalysis,
    RevenueBreakdown,
    MomentumData,
    ValueGrowthProfile,
    CompetitiveMoat,
    RiskRewardProfile,
    DividendAnalysis,
} from './types';

// ─── Ticker-Aware Company Profiles ─────────────────────────────────
interface CompanyProfile {
    name: string;
    price: number; change: number; changePercent: number;
    open: number; high: number; low: number; previousClose: number;
    volume: number; marketCap: number; pe: number; eps: number; beta: number;
    weekHigh52: number; weekLow52: number; revenue: number; grossMargin: number;
    debtToEquity: number; dividendYield: number; sector: string;
    executives: { name: string; role: string; type: 'buy' | 'sell' | 'exercise'; shares: number; price: number; value: number }[];
    peers: { ticker: string; price: number; marketCap: number; pe: number; eps: number; change: number }[];
    revenueSegments: { name: string; revenue: number; percent: number; growth: number }[];
    moatSources: { name: string; strength: string; description: string }[];
    risks: RiskFactor[];
    catalysts: Catalyst[];
    themes: string[];
    nipunGrade: string; nipunNumeric: number; nipunConfidence: number;
    investmentSignal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    investmentOverall: number;
    strengths: string[];
    weaknesses: string[];
    bullPrice: number; basePrice: number; bearPrice: number;
    moatRating: string; moatScore: number; moatDurability: string;
    classification: string; valueScore: number; growthScore: number;
    pegRatio: number; priceToBook: number; priceToSales: number; epsGrowth5Y: number; revenueGrowth5Y: number;
    dividendYieldVal: number; annualDividend: number; payoutRatio: number; divGrowth5Y: number; divYears: number; divSafety: string;
}

const PROFILES: Record<string, CompanyProfile> = {
    AAPL: {
        name: 'Apple Inc.', price: 178.72, change: 2.35, changePercent: 1.33,
        open: 176.15, high: 179.2, low: 175.82, previousClose: 176.37,
        volume: 52438100, marketCap: 2780000000000, pe: 28.52, eps: 6.27, beta: 1.24,
        weekHigh52: 199.62, weekLow52: 164.08, revenue: 383290000000, grossMargin: 45.96,
        debtToEquity: 1.87, dividendYield: 0.55, sector: 'Technology',
        executives: [
            { name: 'Tim Cook', role: 'CEO', type: 'sell', shares: 50000, price: 177.50, value: 8875000 },
            { name: 'Jeff Williams', role: 'COO', type: 'sell', shares: 25000, price: 176.80, value: 4420000 },
            { name: 'Luca Maestri', role: 'CFO', type: 'exercise', shares: 100000, price: 145.00, value: 14500000 },
            { name: 'Deirdre O\'Brien', role: 'SVP Retail', type: 'buy', shares: 5000, price: 172.30, value: 861500 },
        ],
        peers: [
            { ticker: 'MSFT', price: 415.80, marketCap: 3090000000000, pe: 34.2, eps: 12.15, change: 0.85 },
            { ticker: 'GOOGL', price: 172.50, marketCap: 2130000000000, pe: 24.8, eps: 6.96, change: -0.42 },
            { ticker: 'AMZN', price: 198.30, marketCap: 2050000000000, pe: 42.1, eps: 4.71, change: 1.20 },
            { ticker: 'META', price: 585.40, marketCap: 1480000000000, pe: 26.3, eps: 22.26, change: 0.67 },
            { ticker: 'NVDA', price: 875.20, marketCap: 2150000000000, pe: 58.7, eps: 14.91, change: 2.15 },
        ],
        revenueSegments: [
            { name: 'iPhone', revenue: 200770000000, percent: 52.4, growth: 3.8 },
            { name: 'Services', revenue: 85200000000, percent: 22.2, growth: 16.3 },
            { name: 'Mac', revenue: 29360000000, percent: 7.7, growth: 8.1 },
            { name: 'iPad', revenue: 28300000000, percent: 7.4, growth: -3.2 },
            { name: 'Wearables & Home', revenue: 39660000000, percent: 10.3, growth: 2.5 },
        ],
        moatSources: [
            { name: 'Ecosystem Lock-in', strength: 'strong', description: '2B+ active devices create massive switching costs. iMessage, AirDrop, Handoff chain users.' },
            { name: 'Brand Premium', strength: 'strong', description: 'Commands 30-40% price premium. Brand value ~$880B — world\'s most valuable.' },
            { name: 'Services Network Effect', strength: 'moderate', description: 'App Store, Apple Music, iCloud — 1B+ paid subscriptions creating recurring revenue.' },
            { name: 'Custom Silicon', strength: 'strong', description: 'M-series/A-series chips provide 2-3 year performance lead. Vertical integration cuts costs.' },
        ],
        risks: [
            { category: 'regulatory', description: 'EU Digital Markets Act could force App Store policy changes, impacting ~22% Services revenue.', severity: 'medium' },
            { category: 'competitive', description: 'Samsung and Google rapidly integrating on-device AI, narrowing the AI feature gap.', severity: 'medium' as const },
            { category: 'macro', description: 'Elevated interest rates and consumer credit tightening reduce premium device demand. Replacement cycles extending to 4+ years.', severity: 'high' },
            { category: 'company-specific', description: 'Greater China revenue (~18%) faces headwinds from Huawei resurgence and US-China trade restrictions.', severity: 'high' },
        ],
        catalysts: [
            { description: 'WWDC 2026: Next-gen Apple Intelligence with advanced on-device LLM and Siri overhaul.', timeline: 'June 2026', impact: 'positive' },
            { description: 'iPhone 17 launch with significant design refresh and AI-first camera. Analysts project super-cycle.', timeline: 'Sep 2026', impact: 'positive' },
            { description: 'Services approaching $100B ARR milestone with accelerating subscription growth.', timeline: 'Q3 2026', impact: 'positive' },
        ],
        themes: ['iPhone sales growth', 'Services expansion', 'Apple Intelligence AI', 'Vision Pro adoption', 'China risk', 'Valuation'],
        nipunGrade: 'A-', nipunNumeric: 82, nipunConfidence: 78,
        investmentSignal: 'Buy', investmentOverall: 72,
        strengths: [
            'Industry-leading gross margins (45.96%) demonstrating pricing power',
            '6-quarter consecutive earnings beat streak',
            'Golden Cross pattern — bullish long-term technical signal',
            'Services revenue approaching $100B ARR — recurring income moat',
            'Trading at 23% P/E discount vs mega-cap tech peers',
        ],
        weaknesses: [
            'Net insider selling ($15.9M sells vs $861K buys) signals caution',
            'Greater China revenue (18%) exposed to geopolitical risk',
            'Smartphone replacement cycles extending to 4+ years',
            'EU regulatory headwinds could impact App Store economics',
        ],
        bullPrice: 225, basePrice: 195, bearPrice: 150,
        moatRating: 'Wide' as const, moatScore: 88, moatDurability: 'high',
        classification: 'Growth', valueScore: 42, growthScore: 71,
        pegRatio: 2.1, priceToBook: 48.5, priceToSales: 7.3, epsGrowth5Y: 13.8, revenueGrowth5Y: 8.2,
        dividendYieldVal: 0.55, annualDividend: 0.96, payoutRatio: 15.3, divGrowth5Y: 5.8, divYears: 12, divSafety: 'very-safe' as const,
    },
    MSFT: {
        name: 'Microsoft Corporation', price: 392.74, change: -8.98, changePercent: -2.24,
        open: 400.15, high: 401.80, low: 391.50, previousClose: 401.72,
        volume: 28934200, marketCap: 2920000000000, pe: 24.5, eps: 15.98, beta: 0.89,
        weekHigh52: 468.35, weekLow52: 362.90, revenue: 245122000000, grossMargin: 69.35,
        debtToEquity: 0.42, dividendYield: 0.76, sector: 'Technology',
        executives: [
            { name: 'Satya Nadella', role: 'CEO', type: 'sell', shares: 30000, price: 410.00, value: 12300000 },
            { name: 'Amy Hood', role: 'CFO', type: 'sell', shares: 18000, price: 405.50, value: 7299000 },
            { name: 'Brad Smith', role: 'Vice Chair', type: 'exercise', shares: 50000, price: 350.00, value: 17500000 },
            { name: 'Judson Althoff', role: 'EVP & CCO', type: 'buy', shares: 3000, price: 395.00, value: 1185000 },
        ],
        peers: [
            { ticker: 'ORCL', price: 145.40, marketCap: 418000000000, pe: 27.1, eps: 5.32, change: -3.27 },
            { ticker: 'PANW', price: 148.92, marketCap: 122000000000, pe: 94.8, eps: 1.81, change: -0.32 },
            { ticker: 'NOW', price: 108.01, marketCap: 113000000000, pe: 64.6, eps: 1.67, change: -1.18 },
            { ticker: 'CRWD', price: 371.98, marketCap: 94000000000, pe: -1, eps: -1.26, change: -2.39 },
            { ticker: 'FTNT', price: 79.03, marketCap: 58000000000, pe: 31.6, eps: 2.43, change: -0.21 },
        ],
        revenueSegments: [
            { name: 'Intelligent Cloud (Azure)', revenue: 96800000000, percent: 39.5, growth: 29.2 },
            { name: 'Productivity & Business (Office 365)', revenue: 77100000000, percent: 31.4, growth: 12.8 },
            { name: 'More Personal Computing (Windows)', revenue: 58200000000, percent: 23.8, growth: 4.1 },
            { name: 'LinkedIn', revenue: 16500000000, percent: 6.7, growth: 8.5 },
            { name: 'Gaming (Xbox)', revenue: 21800000000, percent: 8.9, growth: -2.3 },
        ],
        moatSources: [
            { name: 'Enterprise Lock-in', strength: 'strong', description: 'Office 365 + Azure + Teams bundle creates deep enterprise dependency. 95% Fortune 500 customers.' },
            { name: 'Cloud Infrastructure', strength: 'strong', description: 'Azure is #2 cloud (25% share). $13B OpenAI investment gives AI distribution moat.' },
            { name: 'Developer Ecosystem', strength: 'strong', description: 'GitHub (100M+ devs) + VS Code + Copilot creates developer platform lock-in.' },
            { name: 'Switching Costs', strength: 'strong', description: 'Enterprise migration costs are prohibitive. Active Directory, Exchange, SharePoint deeply embedded.' },
        ],
        risks: [
            { category: 'company-specific', description: 'Massive AI infrastructure capex ($80B+ committed) with uncertain ROI timeline. Azure AI margins may compress near-term.', severity: 'high' },
            { category: 'regulatory', description: 'EU and FTC scrutiny on Activision integration and cloud bundling practices. Potential forced unbundling of Teams from Office.', severity: 'medium' },
            { category: 'competitive', description: 'AWS maintains cloud lead. Google Cloud gaining enterprise share. OpenAI could build competing distribution.', severity: 'medium' as const },
            { category: 'macro', description: 'Enterprise IT budget cuts could slow Azure growth. PC market remains soft, affecting Windows/Surface revenue.', severity: 'medium' },
        ],
        catalysts: [
            { description: 'Copilot monetization acceleration — $30/user/month across 400M+ Office users represents massive upsell opportunity.', timeline: 'H1 2026', impact: 'positive' },
            { description: 'Azure AI revenue growing 150%+ YoY. Becoming primary cloud growth engine as traditional compute matures.', timeline: 'FY2026', impact: 'positive' },
            { description: 'Windows 12 launch with native AI features driving enterprise PC refresh cycle.', timeline: 'Late 2026', impact: 'positive' },
        ],
        themes: ['Azure cloud growth', 'Copilot AI monetization', 'OpenAI partnership', 'Enterprise dominance', 'Gaming (Activision)', 'Antitrust risk'],
        nipunGrade: 'A', nipunNumeric: 85, nipunConfidence: 82,
        investmentSignal: 'Buy', investmentOverall: 78,
        strengths: [
            'Industry-best gross margins (69.35%) across diversified revenue streams',
            'Azure growing 29%+ YoY — fastest-growing major cloud platform',
            'Copilot AI creating new $30/user/month revenue layer across 400M+ users',
            '$13B OpenAI partnership provides exclusive AI distribution advantage',
            'Consistent dividend growth with ultra-low 28% payout ratio',
        ],
        weaknesses: [
            'Massive AI capex ($80B+) with uncertain ROI timeline',
            'Gaming segment declining (-2.3%) despite $69B Activision acquisition',
            'Antitrust pressure on Teams/Office bundling in EU',
            'PC market softness impacting Windows licensing revenue',
        ],
        bullPrice: 500, basePrice: 440, bearPrice: 350,
        moatRating: 'Wide' as const, moatScore: 92, moatDurability: 'high',
        classification: 'Blend', valueScore: 55, growthScore: 78,
        pegRatio: 1.6, priceToBook: 11.2, priceToSales: 11.9, epsGrowth5Y: 18.5, revenueGrowth5Y: 14.2,
        dividendYieldVal: 0.76, annualDividend: 3.00, payoutRatio: 28.1, divGrowth5Y: 10.2, divYears: 20, divSafety: 'very-safe' as const,
    },
    GOOGL: {
        name: 'Alphabet Inc.', price: 172.50, change: -0.72, changePercent: -0.42,
        open: 173.80, high: 174.20, low: 171.90, previousClose: 173.22,
        volume: 21543800, marketCap: 2130000000000, pe: 24.8, eps: 6.96, beta: 1.06,
        weekHigh52: 191.75, weekLow52: 130.67, revenue: 339860000000, grossMargin: 57.47,
        debtToEquity: 0.05, dividendYield: 0.46, sector: 'Technology',
        executives: [
            { name: 'Sundar Pichai', role: 'CEO', type: 'sell', shares: 22000, price: 175.00, value: 3850000 },
            { name: 'Ruth Porat', role: 'CFO', type: 'sell', shares: 15000, price: 170.00, value: 2550000 },
            { name: 'Prabhakar Raghavan', role: 'SVP', type: 'exercise', shares: 40000, price: 140.00, value: 5600000 },
        ],
        peers: [
            { ticker: 'META', price: 585.40, marketCap: 1480000000000, pe: 26.3, eps: 22.26, change: 0.67 },
            { ticker: 'AMZN', price: 198.30, marketCap: 2050000000000, pe: 42.1, eps: 4.71, change: 1.20 },
            { ticker: 'SNAP', price: 11.50, marketCap: 18700000000, pe: -1, eps: -0.22, change: -1.80 },
            { ticker: 'TTD', price: 88.50, marketCap: 43200000000, pe: 78.3, eps: 1.13, change: -0.95 },
        ],
        revenueSegments: [
            { name: 'Google Search & Ads', revenue: 191000000000, percent: 56.2, growth: 11.4 },
            { name: 'YouTube Ads', revenue: 36800000000, percent: 10.8, growth: 15.7 },
            { name: 'Google Cloud', revenue: 41200000000, percent: 12.1, growth: 28.5 },
            { name: 'Network/Other', revenue: 34100000000, percent: 10.0, growth: -1.2 },
            { name: 'Other Bets', revenue: 1580000000, percent: 0.5, growth: 42.0 },
        ],
        moatSources: [
            { name: 'Search Monopoly', strength: 'strong', description: '92% global search share. AI Overviews reinforcing dominance despite competition.' },
            { name: 'Data Advantage', strength: 'strong', description: 'Billions of daily queries create unmatched training data flywheel for AI models.' },
            { name: 'YouTube Dominance', strength: 'strong', description: '2.7B monthly users. No viable competitor for long-form video monetization.' },
            { name: 'Cloud + AI', strength: 'moderate', description: 'GCP growing 28%+. Gemini models competitive with GPT. Vertex AI gaining enterprise traction.' },
        ],
        risks: [
            { category: 'regulatory', description: 'DOJ monopoly ruling could force search distribution changes. Potential Chrome divestiture being discussed.', severity: 'high' },
            { category: 'competitive', description: 'ChatGPT and Perplexity threaten search ad revenue model. AI answer boxes reduce click-through rates.', severity: 'high' },
            { category: 'regulatory', description: 'EU Digital Services Act and potential ad targeting restrictions could impact ad revenue growth.', severity: 'medium' },
            { category: 'competitive', description: 'TikTok captures younger demographics. Amazon growing share in product search advertising.', severity: 'medium' },
        ],
        catalysts: [
            { description: 'Gemini 2.0 launch across Search, Workspace, and Cloud — driving AI revenue monetization.', timeline: 'H1 2026', impact: 'positive' },
            { description: 'Google Cloud turning profitable with 28%+ growth. AI workloads accelerating enterprise adoption.', timeline: 'FY2026', impact: 'positive' },
            { description: 'Waymo autonomous ride-hailing expanding to 10+ US cities with licensing model.', timeline: '2026-2027', impact: 'positive' },
        ],
        themes: ['Search AI evolution', 'Cloud profitability', 'YouTube growth', 'Antitrust risk', 'Gemini AI', 'Waymo autonomy'],
        nipunGrade: 'A-', nipunNumeric: 80, nipunConfidence: 75,
        investmentSignal: 'Buy', investmentOverall: 74,
        strengths: [
            'Dominant 92% search market share with AI Overviews reinforcing moat',
            'Google Cloud profitable and growing 28%+ — fastest margin expansion',
            'YouTube generates $36.8B in ads — irreplaceable content platform',
            'Near-zero debt (0.05 D/E) with $110B+ cash reserves',
            'Trading at 24.8x P/E — discount to peer average for this growth profile',
        ],
        weaknesses: [
            'DOJ monopoly ruling creates existential regulatory uncertainty',
            'AI-generated answers reduce search ad click-through rates',
            'Other Bets segment still unprofitable despite years of investment',
            'Advertising business cyclically exposed to macro downturns',
        ],
        bullPrice: 220, basePrice: 195, bearPrice: 145,
        moatRating: 'Wide' as const, moatScore: 85, moatDurability: 'high',
        classification: 'Blend', valueScore: 58, growthScore: 68,
        pegRatio: 1.4, priceToBook: 6.8, priceToSales: 6.3, epsGrowth5Y: 20.5, revenueGrowth5Y: 12.8,
        dividendYieldVal: 0.46, annualDividend: 0.80, payoutRatio: 11.5, divGrowth5Y: 0, divYears: 1, divSafety: 'very-safe' as const,
    },
};

function getProfile(ticker: string): CompanyProfile {
    const t = ticker.toUpperCase();
    if (PROFILES[t]) return PROFILES[t];
    // Generate sensible defaults for unknown tickers
    const seed = t.charCodeAt(0) * 7 + (t.charCodeAt(1) || 0) * 3;
    const price = 50 + (seed % 400);
    const pe = 15 + (seed % 35);
    const eps = +(price / pe).toFixed(2);
    return {
        name: `${t} Corp`, price, change: +(price * 0.008 * (seed % 2 === 0 ? 1 : -1)).toFixed(2),
        changePercent: +(0.8 * (seed % 2 === 0 ? 1 : -1)).toFixed(2),
        open: +(price * 0.995).toFixed(2), high: +(price * 1.01).toFixed(2),
        low: +(price * 0.99).toFixed(2), previousClose: +(price * 0.992).toFixed(2),
        volume: 5000000 + seed * 100000, marketCap: price * 1000000000 * (1 + seed % 5),
        pe, eps, beta: +(0.8 + (seed % 10) * 0.1).toFixed(2),
        weekHigh52: +(price * 1.25).toFixed(2), weekLow52: +(price * 0.75).toFixed(2),
        revenue: price * 500000000, grossMargin: 30 + seed % 30,
        debtToEquity: +(0.3 + (seed % 20) * 0.1).toFixed(2), dividendYield: +((seed % 5) * 0.3).toFixed(2),
        sector: 'Technology',
        executives: [
            { name: 'CEO', role: 'CEO', type: 'sell', shares: 10000, price, value: price * 10000 },
            { name: 'CFO', role: 'CFO', type: 'buy', shares: 5000, price, value: price * 5000 },
        ],
        peers: [
            { ticker: 'AAPL', price: 178.72, marketCap: 2780000000000, pe: 28.5, eps: 6.27, change: 1.33 },
            { ticker: 'MSFT', price: 392.74, marketCap: 2920000000000, pe: 24.5, eps: 15.98, change: -2.24 },
            { ticker: 'GOOGL', price: 172.50, marketCap: 2130000000000, pe: 24.8, eps: 6.96, change: -0.42 },
        ],
        revenueSegments: [
            { name: 'Core Business', revenue: price * 300000000, percent: 60, growth: 8.5 },
            { name: 'Services', revenue: price * 100000000, percent: 20, growth: 15.2 },
            { name: 'New Initiatives', revenue: price * 50000000, percent: 10, growth: 22.1 },
            { name: 'Other', revenue: price * 50000000, percent: 10, growth: 3.4 },
        ],
        moatSources: [
            { name: 'Market Position', strength: 'moderate', description: 'Established market presence with brand recognition in core segments.' },
            { name: 'Switching Costs', strength: 'moderate', description: 'Customer integration creates meaningful switching costs for enterprise clients.' },
        ],
        risks: [
            { category: 'competitive', description: 'Intensifying competition from both established players and emerging disruptors in core markets.', severity: 'medium' as const },
            { category: 'macro', description: 'Economic slowdown could impact demand and compress margins across business segments.', severity: 'medium' as const },
            { category: 'company-specific', description: 'Strategic investments in growth areas require successful execution to deliver shareholder value.', severity: 'low' as const },
        ],
        catalysts: [
            { description: 'New product launches and market expansion initiatives expected to drive revenue growth.', timeline: 'H2 2026', impact: 'positive' as const },
            { description: 'Cost optimization programs targeting improved operating margins.', timeline: 'FY2026', impact: 'positive' },
        ],
        themes: ['Industry trends', 'Market expansion', 'Innovation pipeline', 'Margin improvement'],
        nipunGrade: 'B+' as const, nipunNumeric: 72, nipunConfidence: 65,
        investmentSignal: 'Hold', investmentOverall: 62,
        strengths: [
            `Solid market position in core ${t} business segments`,
            'Consistent revenue growth trajectory over trailing twelve months',
            'Management executing on operational efficiency improvements',
        ],
        weaknesses: [
            'Limited competitive moat relative to industry leaders',
            'Execution risk on growth investments with uncertain returns',
        ],
        bullPrice: +(price * 1.30).toFixed(0), basePrice: +(price * 1.12).toFixed(0), bearPrice: +(price * 0.82).toFixed(0),
        moatRating: 'Narrow' as const, moatScore: 55, moatDurability: 'medium' as const,
        classification: 'Blend' as const, valueScore: 50, growthScore: 50,
        pegRatio: +(pe / 12).toFixed(1), priceToBook: +(pe * 0.8).toFixed(1), priceToSales: +(pe * 0.3).toFixed(1),
        epsGrowth5Y: 8 + seed % 10, revenueGrowth5Y: 5 + seed % 8,
        dividendYieldVal: +((seed % 5) * 0.3).toFixed(2), annualDividend: +(price * 0.01).toFixed(2),
        payoutRatio: 25 + seed % 30, divGrowth5Y: 3 + seed % 5, divYears: 3 + seed % 10, divSafety: 'safe' as const,
    };
}

// ─── Mock Financial Data ───────────────────────────────────────────
export function getMockFinancials(ticker: string): FinancialData {
    const p = getProfile(ticker);
    return {
        ticker: ticker.toUpperCase(), companyName: p.name,
        price: p.price, change: p.change, changePercent: p.changePercent,
        open: p.open, high: p.high, low: p.low, previousClose: p.previousClose,
        volume: p.volume, marketCap: p.marketCap, pe: p.pe, eps: p.eps, beta: p.beta,
        weekHigh52: p.weekHigh52, weekLow52: p.weekLow52, revenue: p.revenue,
        grossMargin: p.grossMargin, debtToEquity: p.debtToEquity, dividendYield: p.dividendYield,
        sector: p.sector,
    };
}

// ─── Mock Technical Analysis ───────────────────────────────────────
export function getMockTechnicals(ticker: string): TechnicalAnalysis {
    const p = getProfile(ticker);
    return {
        rsi: { name: 'RSI (14)', value: 55 + (p.pe % 15), signal: p.changePercent > 0 ? 'bullish' : 'neutral', interpretation: `RSI at ${55 + (p.pe % 15)} — ${p.changePercent > 0 ? 'approaching overbought' : 'neutral territory'}` },
        macd: { name: 'MACD', value: +(p.change * 0.5).toFixed(2), signal: p.change > 0 ? 'bullish' : 'bearish', interpretation: `MACD ${p.change > 0 ? 'positive — bullish momentum' : 'negative — bearish pressure'}` },
        sma50: { name: 'SMA 50', value: +(p.price * 0.97).toFixed(2), signal: 'bullish', interpretation: `Price ($${p.price}) above 50-day SMA ($${(p.price * 0.97).toFixed(2)}) — short-term uptrend` },
        sma200: { name: 'SMA 200', value: +(p.price * 0.93).toFixed(2), signal: 'bullish', interpretation: `Price above 200-day SMA ($${(p.price * 0.93).toFixed(2)}) — long-term uptrend` },
        overallSignal: p.change > 0 ? 'bullish' : 'neutral',
        goldenDeathCross: p.change > 0 ? '🟢 Golden Cross — 50-day SMA above 200-day SMA (bullish long-term signal)' : null,
    };
}

// ─── Mock Insider Activity ─────────────────────────────────────────
export function getMockInsiderActivity(ticker: string): InsiderActivity {
    const p = getProfile(ticker);
    const trades = p.executives.map(e => ({ name: e.name, role: e.role, transactionType: e.type, shares: e.shares, price: e.price, value: e.value, date: '2026-02-15' }));
    const buyVal = p.executives.filter(e => e.type === 'buy').reduce((s, e) => s + e.value, 0);
    const sellVal = p.executives.filter(e => e.type === 'sell').reduce((s, e) => s + e.value, 0);
    return { trades, netSentiment: buyVal > sellVal ? 'bullish' : 'bearish', totalBuyValue: buyVal, totalSellValue: sellVal, summary: `${p.executives.filter(e => e.type === 'buy').length} buys, ${p.executives.filter(e => e.type === 'sell').length} sells in recent filings` };
}

// ─── Mock Earnings Data ────────────────────────────────────────────
export function getMockEarnings(ticker: string): EarningsData {
    const p = getProfile(ticker);
    const base = p.eps / 4;
    return {
        surprises: [
            { quarter: '2025-Q4', estimateEps: +(base * 1.15).toFixed(2), actualEps: +(base * 1.20).toFixed(2), surprise: +(base * 0.05).toFixed(2), surprisePercent: 4.3, beat: true },
            { quarter: '2025-Q3', estimateEps: +(base * 0.95).toFixed(2), actualEps: +(base * 1.00).toFixed(2), surprise: +(base * 0.05).toFixed(2), surprisePercent: 5.3, beat: true },
            { quarter: '2025-Q2', estimateEps: +(base * 0.90).toFixed(2), actualEps: +(base * 0.93).toFixed(2), surprise: +(base * 0.03).toFixed(2), surprisePercent: 3.3, beat: true },
            { quarter: '2025-Q1', estimateEps: +(base * 0.85).toFixed(2), actualEps: +(base * 0.92).toFixed(2), surprise: +(base * 0.07).toFixed(2), surprisePercent: 8.2, beat: true },
        ],
        streak: '4-quarter beat streak 🔥',
        nextEarningsDate: '2026-04-30',
    };
}

// ─── Mock Peer Comparison ──────────────────────────────────────────
export function getMockPeers(ticker: string): PeerComparison {
    const p = getProfile(ticker);
    const avgPe = p.peers.filter(x => x.pe > 0).reduce((s, x) => s + x.pe, 0) / p.peers.filter(x => x.pe > 0).length;
    return {
        peers: p.peers,
        relativeValuation: `Avg peer P/E: ${avgPe.toFixed(1)} — check if this ticker trades at a premium or discount to peers`,
    };
}

// ─── Mock SEC Filings ──────────────────────────────────────────────
export function getMockSECFilings(ticker: string): SECFiling[] {
    const t = ticker.toUpperCase();
    return [
        { type: '10-Q', dateFiled: '2026-02-01', description: `Quarterly Report - Q1 FY2026`, url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${t}&type=10-Q` },
        { type: '8-K', dateFiled: '2026-01-30', description: `Current Report - Earnings`, url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${t}&type=8-K` },
        { type: '10-K', dateFiled: '2025-11-01', description: `Annual Report - FY2025`, url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${t}&type=10-K` },
        { type: 'DEF 14A', dateFiled: '2025-12-15', description: `Proxy Statement - Annual Meeting`, url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${t}&type=DEF+14A` },
    ];
}

// ─── Mock AI Consensus ─────────────────────────────────────────────
export function getMockAIConsensus(ticker: string): AIConsensus {
    const p = getProfile(ticker);
    const sig = p.investmentOverall >= 70 ? 'bullish' : p.investmentOverall >= 55 ? 'neutral' : 'bearish';
    return {
        geminiVerdict: sig,
        secondaryVerdict: sig === 'bullish' ? 'neutral' : sig,
        secondaryModel: 'Cerebras Llama 3.3 70B',
        agreementScore: sig === 'bullish' ? 68 : 78,
        divergences: [
            `Models ${sig === 'bullish' ? 'partially' : 'largely'} agree on ${p.name}'s outlook`,
            `Key debate: valuation justification given current growth trajectory`,
            `Risk assessment differs on macro impact severity`,
        ],
        consensusSummary: `AI models ${sig === 'bullish' ? 'lean bullish' : 'are cautious'} on ${p.name}. ${p.strengths[0]} is a key positive. ${p.weaknesses[0]} remains a concern.`,
    };
}

// ─── Mock Sentiment Data ───────────────────────────────────────────
export function getMockSentiment(ticker: string): SentimentResult {
    const p = getProfile(ticker);
    const bull = p.investmentOverall >= 70 ? 65 : p.investmentOverall >= 55 ? 50 : 35;
    const bear = p.investmentOverall >= 70 ? 22 : p.investmentOverall >= 55 ? 30 : 40;
    return {
        bullishPercent: bull, bearishPercent: bear, neutralPercent: 100 - bull - bear,
        totalPosts: 50,
        posts: [
            { title: `${ticker} is looking strong here 🚀`, sentiment: 'Bullish', theme: 'Price momentum' },
            { title: `Loaded up on ${ticker} calls`, sentiment: 'Bullish', theme: 'Options activity' },
            { title: `${ticker} AI strategy is impressive`, sentiment: 'Bullish', theme: 'AI integration' },
            { title: `${ticker} valuation getting stretched`, sentiment: 'Bearish', theme: 'Valuation concern' },
            { title: `Waiting for ${ticker} earnings`, sentiment: 'Neutral', theme: 'Earnings anticipation' },
        ],
        themes: p.themes,
    };
}

// ─── Mock Risk Factors ─────────────────────────────────────────────
export function getMockRisks(ticker: string): RiskFactor[] { return getProfile(ticker).risks; }

// ─── Mock Catalysts ────────────────────────────────────────────────
export function getMockCatalysts(ticker: string): Catalyst[] { return getProfile(ticker).catalysts; }

// ─── Mock Audit Result ─────────────────────────────────────────────
export function getMockAudit(ticker: string): AuditResult {
    const p = getProfile(ticker);
    return {
        claims: [
            { claim: `Current P/E ratio stands at ${p.pe.toFixed(2)}`, status: 'grounded', source: 'Finnhub API' },
            { claim: `Revenue reached $${(p.revenue / 1e9).toFixed(1)}B`, status: 'grounded', source: 'Finnhub API' },
            { claim: `Gross margin of ${p.grossMargin.toFixed(2)}% demonstrates operational efficiency`, status: 'grounded', source: 'Finnhub API' },
            { claim: `${p.revenueSegments[0].name} segment is the largest revenue contributor at ${p.revenueSegments[0].percent}%`, status: 'grounded', source: 'Company filings' },
            { claim: `Social sentiment is predominantly ${p.investmentOverall >= 65 ? 'bullish' : 'mixed'}`, status: 'grounded', source: 'Reddit RSS Analysis' },
            { claim: `Growth catalysts could drive significant upside in 12-month horizon`, status: 'speculative', source: 'Analyst consensus' },
        ],
        groundedCount: 5, speculativeCount: 1, unverifiableCount: 0,
    };
}

// ─── Mock Report ───────────────────────────────────────────────────
export function getMockReport(ticker: string): string {
    const p = getProfile(ticker);
    const t = ticker.toUpperCase();
    return `# ${t} — Institutional-Grade Analysis Report

## Executive Summary

${p.name} (${t}) demonstrates ${p.investmentOverall >= 70 ? 'strong' : 'solid'} financial performance. Trading at $${p.price.toFixed(2)} with a market cap of $${(p.marketCap / 1e12).toFixed(2)}T, the company ${p.investmentOverall >= 70 ? 'is well-positioned for growth' : 'faces a balanced risk-reward profile'}.

## Financial Health

Revenue of $${(p.revenue / 1e9).toFixed(1)}B with gross margin of ${p.grossMargin.toFixed(1)}%. P/E of ${p.pe.toFixed(1)} with EPS of $${p.eps.toFixed(2)}. D/E ratio of ${p.debtToEquity}. Beta of ${p.beta.toFixed(2)}.

## Key Strengths

${p.strengths.map(s => `- ${s}`).join('\n')}

## Key Risks

${p.weaknesses.map(w => `- ${w}`).join('\n')}

## Conclusion

${p.investmentSignal} rating with ${p.nipunGrade} Nipun Score. ${p.strengths[0]}. Monitor ${p.weaknesses[0]}.

---

**⚠️ DISCLAIMER: This is not financial advice. This report is for educational and informational purposes only.**`;
}

// ─── Mock Investment Score ─────────────────────────────────────────
export function getMockInvestmentScore(ticker: string): InvestmentScore {
    const p = getProfile(ticker);
    return {
        overall: p.investmentOverall, signal: p.investmentSignal,
        breakdown: { technicalScore: p.investmentOverall + 3, fundamentalScore: p.investmentOverall + 8, sentimentScore: p.investmentOverall - 7, riskScore: p.investmentOverall - 14, insiderScore: p.investmentOverall - 32 },
        summary: `${p.strengths[0]}. ${p.weaknesses[0]}.`,
    };
}

// ─── Mock Financial Health ─────────────────────────────────────────
export function getMockFinancialHealth(ticker: string): FinancialHealth {
    const p = getProfile(ticker);
    const z = p.debtToEquity < 1 ? 6.5 : p.debtToEquity < 2 ? 5.8 : 3.2;
    const f = p.grossMargin > 50 ? 8 : p.grossMargin > 30 ? 7 : 5;
    return {
        altmanZScore: z, altmanZone: z > 2.99 ? 'safe' : z > 1.81 ? 'grey' : 'distress',
        piotroskiFScore: f, piotroskiRating: f >= 7 ? 'strong' : f >= 4 ? 'moderate' : 'weak',
        currentRatio: +(1.0 + p.debtToEquity * 0.1).toFixed(2),
        quickRatio: +(0.9 + p.debtToEquity * 0.05).toFixed(2),
        interestCoverage: +(30 / (p.debtToEquity + 0.1)).toFixed(1),
        pricePositionPercent: +((p.price - p.weekLow52) / (p.weekHigh52 - p.weekLow52) * 100).toFixed(1),
        volatilityCategory: p.beta > 1.3 ? 'high' : p.beta > 0.9 ? 'moderate' : 'low',
        healthSummary: `${z > 3 ? 'Excellent' : 'Adequate'} financial health — Altman Z ${z.toFixed(2)} (${z > 2.99 ? 'safe' : 'grey'} zone), Piotroski ${f}/9 (${f >= 7 ? 'strong' : 'moderate'}).`,
    };
}

// ─── Mock Nipun Score™ ─────────────────────────────────────────────
export function getMockNipunScore(ticker: string): NipunScore {
    const p = getProfile(ticker);
    return {
        grade: p.nipunGrade as NipunScore['grade'], numericScore: p.nipunNumeric, confidence: p.nipunConfidence,
        verdict: `${p.investmentSignal} conviction — ${p.strengths[0].toLowerCase()}, offset by ${p.weaknesses[0].toLowerCase()}.`,
        strengths: p.strengths, weaknesses: p.weaknesses,
        recommendation: `${p.investmentSignal === 'Buy' || p.investmentSignal === 'Strong Buy' ? 'Accumulate on pullbacks' : 'Hold position'}. Target $${p.bullPrice} (bull case) within 12 months.`,
    };
}

// ─── Mock Scenario Analysis ────────────────────────────────────────
export function getMockScenarioAnalysis(ticker: string): ScenarioAnalysis {
    const p = getProfile(ticker);
    return {
        bull: { label: 'Bull Case', price: p.bullPrice, upside: +((p.bullPrice / p.price - 1) * 100).toFixed(1), probability: 30, rationale: p.catalysts[0]?.description || 'Strong execution on growth initiatives drives upside.' },
        base: { label: 'Base Case', price: p.basePrice, upside: +((p.basePrice / p.price - 1) * 100).toFixed(1), probability: 50, rationale: 'Steady execution with moderate growth. P/E maintains current levels.' },
        bear: { label: 'Bear Case', price: p.bearPrice, upside: +((p.bearPrice / p.price - 1) * 100).toFixed(1), probability: 20, rationale: p.risks[0]?.description || 'Macro headwinds and competitive pressure compress multiples.' },
        timeHorizon: '12 months',
        methodology: 'Weighted DCF + comparable company analysis + scenario probability weighting.',
    };
}

// ─── Mock Revenue Breakdown ────────────────────────────────────────
export function getMockRevenueBreakdown(ticker: string): RevenueBreakdown {
    const p = getProfile(ticker);
    const totalGrowth = p.revenueSegments.reduce((s, seg) => s + seg.growth * seg.percent, 0) / 100;
    return {
        segments: p.revenueSegments,
        totalRevenue: p.revenue,
        revenueGrowth: +totalGrowth.toFixed(1),
        summary: `${p.revenueSegments[0].name} is the largest segment at ${p.revenueSegments[0].percent}%. ${p.revenueSegments.find(s => s.growth > 15)?.name || p.revenueSegments[1].name} is the fastest-growing segment.`,
    };
}

// ─── Mock Momentum Score ───────────────────────────────────────────
export function getMockMomentum(ticker: string): MomentumData {
    const p = getProfile(ticker);
    const score = p.changePercent > 0 ? 68 : 45;
    return {
        score, trend: (p.changePercent > 0 ? 'up' : 'flat') as MomentumData['trend'],
        shortTerm: { period: '1 Month', performance: +(p.changePercent * 2.5).toFixed(1) },
        mediumTerm: { period: '3 Months', performance: +(p.changePercent * 6).toFixed(1) },
        longTerm: { period: '12 Months', performance: +(p.changePercent * 10).toFixed(1) },
        relativeStrength: +(p.changePercent > 0 ? 1.15 : 0.92).toFixed(2),
        interpretation: `${score >= 60 ? 'Positive' : 'Mixed'} momentum. ${p.changePercent > 0 ? 'Stock outperforming broader market' : 'Stock underperforming — watch for reversal signals'}.`,
    };
}

// ─── Mock Value vs Growth ──────────────────────────────────────────
export function getMockValueGrowth(ticker: string): ValueGrowthProfile {
    const p = getProfile(ticker);
    return {
        classification: p.classification as ValueGrowthProfile['classification'], valueScore: p.valueScore, growthScore: p.growthScore,
        metrics: { pegRatio: p.pegRatio, priceToBook: p.priceToBook, priceToSales: p.priceToSales, epsGrowth5Y: p.epsGrowth5Y, revenueGrowth5Y: p.revenueGrowth5Y },
        interpretation: `Classified as ${p.classification} — ${p.classification === 'Growth' ? 'premium valuation justified by consistent growth' : p.classification === 'Blend' ? 'growth at a reasonable price with balanced metrics' : 'balanced value and growth characteristics'}.`,
    };
}

// ─── Mock Competitive Moat ─────────────────────────────────────────
export function getMockCompetitiveMoat(ticker: string): CompetitiveMoat {
    const p = getProfile(ticker);
    return {
        rating: p.moatRating as CompetitiveMoat['rating'], score: p.moatScore, sources: p.moatSources as CompetitiveMoat['sources'],
        durability: p.moatDurability as CompetitiveMoat['durability'],
        interpretation: `${p.moatRating} moat with ${p.moatDurability.toLowerCase()} durability. ${p.moatSources[0].name} is the primary competitive advantage.`,
    };
}

// ─── Mock Risk-Reward ──────────────────────────────────────────────
export function getMockRiskReward(ticker: string): RiskRewardProfile {
    const p = getProfile(ticker);
    const downside = +((1 - p.bearPrice / p.price) * 100).toFixed(1);
    const upside = +((p.bullPrice / p.price - 1) * 100).toFixed(1);
    const ratio = +(upside / Math.max(downside, 1)).toFixed(1);
    return {
        riskLevel: downside > 25 ? 6 : downside > 15 ? 4 : 3,
        rewardPotential: upside > 30 ? 8 : upside > 20 ? 7 : 5,
        ratio, rating: ratio >= 3 ? 'Excellent' : ratio >= 2 ? 'Good' : ratio >= 1 ? 'Fair' : 'Poor',
        maxDrawdownEstimate: downside, upsidePotential: upside,
        interpretation: `${ratio >= 2 ? 'Favorable' : 'Balanced'} risk-reward with ${ratio}:1 ratio. Max downside ~${downside}% vs ~${upside}% upside.`,
    };
}

// ─── Mock Dividend Analysis ────────────────────────────────────────
export function getMockDividendAnalysis(ticker: string): DividendAnalysis {
    const p = getProfile(ticker);
    return {
        yield: p.dividendYieldVal, annualDividend: p.annualDividend,
        payoutRatio: p.payoutRatio, growthRate5Y: p.divGrowth5Y, yearsOfGrowth: p.divYears,
        exDividendDate: '2026-05-09', frequency: 'quarterly', safety: p.divSafety as DividendAnalysis['safety'],
        interpretation: `${p.divSafety === 'very-safe' ? 'Ultra-safe' : 'Solid'} dividend with ${p.payoutRatio.toFixed(1)}% payout ratio. ${p.divYears} consecutive years of growth at ${p.divGrowth5Y}% CAGR.`,
    };
}
