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

// ─── Mock Financial Data (AAPL) ────────────────────────────────────
export function getMockFinancials(ticker: string): FinancialData {
    return {
        ticker: ticker.toUpperCase(),
        companyName: ticker.toUpperCase() === 'AAPL' ? 'Apple Inc.' : `${ticker.toUpperCase()} Corp`,
        price: 178.72,
        change: 2.35,
        changePercent: 1.33,
        open: 176.15,
        high: 179.2,
        low: 175.82,
        previousClose: 176.37,
        volume: 52438100,
        marketCap: 2780000000000,
        pe: 28.52,
        eps: 6.27,
        beta: 1.24,
        weekHigh52: 199.62,
        weekLow52: 164.08,
        revenue: 383290000000,
        grossMargin: 45.96,
        debtToEquity: 1.87,
        dividendYield: 0.55,
        sector: 'Technology',
    };
}

// ─── Mock Technical Analysis ───────────────────────────────────────
export function getMockTechnicals(_ticker: string): TechnicalAnalysis {
    return {
        rsi: {
            name: 'RSI (14)',
            value: 58.3,
            signal: 'neutral',
            interpretation: 'Neutral territory (58.3) — no strong RSI signal',
        },
        macd: {
            name: 'MACD',
            value: 1.24,
            signal: 'bullish',
            interpretation: 'MACD histogram positive — bullish momentum building',
        },
        sma50: {
            name: 'SMA 50',
            value: 174.85,
            signal: 'bullish',
            interpretation: 'Price ($178.72) above 50-day SMA ($174.85) — short-term uptrend',
        },
        sma200: {
            name: 'SMA 200',
            value: 171.20,
            signal: 'bullish',
            interpretation: 'Price above 200-day SMA ($171.20) — long-term uptrend',
        },
        overallSignal: 'bullish',
        goldenDeathCross: '🟢 Golden Cross — 50-day SMA above 200-day SMA (bullish long-term signal)',
    };
}

// ─── Mock Insider Activity ─────────────────────────────────────────
export function getMockInsiderActivity(_ticker: string): InsiderActivity {
    return {
        trades: [
            { name: 'Tim Cook', role: 'CEO', transactionType: 'sell', shares: 50000, price: 177.50, value: 8875000, date: '2026-02-15' },
            { name: 'Jeff Williams', role: 'COO', transactionType: 'sell', shares: 25000, price: 176.80, value: 4420000, date: '2026-02-10' },
            { name: 'Luca Maestri', role: 'CFO', transactionType: 'exercise', shares: 100000, price: 145.00, value: 14500000, date: '2026-01-28' },
            { name: 'Deirdre O\'Brien', role: 'SVP Retail', transactionType: 'buy', shares: 5000, price: 172.30, value: 861500, date: '2026-01-20' },
            { name: 'Craig Federighi', role: 'SVP Software', transactionType: 'sell', shares: 15000, price: 175.20, value: 2628000, date: '2026-01-15' },
        ],
        netSentiment: 'bearish',
        totalBuyValue: 861500,
        totalSellValue: 15923000,
        summary: '1 buy, 3 sells, 1 exercise in recent filings — net insider selling',
    };
}

// ─── Mock Earnings Data ────────────────────────────────────────────
export function getMockEarnings(_ticker: string): EarningsData {
    return {
        surprises: [
            { quarter: '2025-Q4', estimateEps: 2.35, actualEps: 2.40, surprise: 0.05, surprisePercent: 2.13, beat: true },
            { quarter: '2025-Q3', estimateEps: 1.39, actualEps: 1.46, surprise: 0.07, surprisePercent: 5.04, beat: true },
            { quarter: '2025-Q2', estimateEps: 1.50, actualEps: 1.53, surprise: 0.03, surprisePercent: 2.00, beat: true },
            { quarter: '2025-Q1', estimateEps: 1.27, actualEps: 1.40, surprise: 0.13, surprisePercent: 10.24, beat: true },
            { quarter: '2024-Q4', estimateEps: 2.10, actualEps: 2.18, surprise: 0.08, surprisePercent: 3.81, beat: true },
            { quarter: '2024-Q3', estimateEps: 1.35, actualEps: 1.46, surprise: 0.11, surprisePercent: 8.15, beat: true },
        ],
        streak: '6-quarter beat streak 🔥',
        nextEarningsDate: '2026-04-30',
    };
}

// ─── Mock Peer Comparison ──────────────────────────────────────────
export function getMockPeers(_ticker: string): PeerComparison {
    return {
        peers: [
            { ticker: 'MSFT', price: 415.80, marketCap: 3090000000000, pe: 34.2, eps: 12.15, change: 0.85 },
            { ticker: 'GOOGL', price: 172.50, marketCap: 2130000000000, pe: 24.8, eps: 6.96, change: -0.42 },
            { ticker: 'AMZN', price: 198.30, marketCap: 2050000000000, pe: 42.1, eps: 4.71, change: 1.20 },
            { ticker: 'META', price: 585.40, marketCap: 1480000000000, pe: 26.3, eps: 22.26, change: 0.67 },
            { ticker: 'NVDA', price: 875.20, marketCap: 2150000000000, pe: 58.7, eps: 14.91, change: 2.15 },
        ],
        relativeValuation: 'AAPL P/E (28.5) vs avg peer P/E (37.2) — trading at a 23% discount to mega-cap tech peers, suggesting relative value',
    };
}

// ─── Mock SEC Filings ──────────────────────────────────────────────
export function getMockSECFilings(_ticker: string): SECFiling[] {
    return [
        { type: '10-Q', dateFiled: '2026-02-01', description: 'Quarterly Report - Q1 FY2026', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=10-Q' },
        { type: '8-K', dateFiled: '2026-01-30', description: 'Current Report - Q1 FY2026 Earnings', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=8-K' },
        { type: '4', dateFiled: '2026-01-28', description: 'Statement of Changes in Beneficial Ownership (Luca Maestri)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=4' },
        { type: '10-K', dateFiled: '2025-11-01', description: 'Annual Report - FY2025', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=10-K' },
        { type: 'DEF 14A', dateFiled: '2025-12-15', description: 'Definitive Proxy Statement - Annual Meeting', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=AAPL&type=DEF+14A' },
    ];
}

// ─── Mock AI Consensus ─────────────────────────────────────────────
export function getMockAIConsensus(_ticker: string): AIConsensus {
    return {
        geminiVerdict: 'bullish',
        secondaryVerdict: 'neutral',
        secondaryModel: 'Cerebras Llama 3.3 70B',
        agreementScore: 68,
        divergences: [
            'Gemini sees bullish outlook vs Cerebras sees neutral outlook',
            'Cerebras weights China exposure risk higher than Gemini',
            'Disagreement on whether current P/E premium is justified by AI integration upside',
        ],
        consensusSummary: 'AI models partially diverge: Gemini is bullish while Cerebras (Llama 3.3 70B) is neutral. Key disagreement centers on whether Apple\'s AI integration strategy justifies the current premium valuation given macro headwinds.',
    };
}

// ─── Mock Sentiment Data (~65% Bullish) ────────────────────────────
export function getMockSentiment(ticker: string): SentimentResult {
    const posts = [
        { title: `${ticker} is going to $250 by year end 🚀`, sentiment: 'Bullish' as const, theme: 'Price target optimism' },
        { title: `Just loaded up on more ${ticker} calls`, sentiment: 'Bullish' as const, theme: 'Options activity' },
        { title: `${ticker} AI integration is game-changing`, sentiment: 'Bullish' as const, theme: 'AI product integration' },
        { title: `Services revenue for ${ticker} is unstoppable`, sentiment: 'Bullish' as const, theme: 'Services growth' },
        { title: `${ticker} India manufacturing expansion is huge`, sentiment: 'Bullish' as const, theme: 'Geographic diversification' },
        { title: `Bought the dip on ${ticker}, holding long`, sentiment: 'Bullish' as const, theme: 'Buy-the-dip sentiment' },
        { title: `${ticker} iPhone sales beating expectations`, sentiment: 'Bullish' as const, theme: 'iPhone sales growth' },
        { title: `${ticker} wearables segment is undervalued`, sentiment: 'Bullish' as const, theme: 'Wearables potential' },
        { title: `${ticker} PE ratio is getting stretched`, sentiment: 'Bearish' as const, theme: 'Valuation concern' },
        { title: `China risk for ${ticker} is underestimated`, sentiment: 'Bearish' as const, theme: 'China market risk' },
        { title: `Competition heating up against ${ticker}`, sentiment: 'Bearish' as const, theme: 'Competitive pressure' },
        { title: `${ticker} innovation has stalled`, sentiment: 'Bearish' as const, theme: 'Innovation plateau' },
        { title: `Waiting for ${ticker} earnings before deciding`, sentiment: 'Neutral' as const, theme: 'Earnings anticipation' },
        { title: `${ticker} chart looks interesting here`, sentiment: 'Neutral' as const, theme: 'Technical analysis' },
        { title: `${ticker} dividend is steady but nothing exciting`, sentiment: 'Neutral' as const, theme: 'Dividend stability' },
    ];

    return {
        bullishPercent: 65,
        bearishPercent: 22,
        neutralPercent: 13,
        totalPosts: 50,
        posts,
        themes: [
            'iPhone sales growth',
            'Services revenue expansion',
            'AI integration in products',
            'Vision Pro adoption',
            'China market concerns',
            'Valuation debate',
        ],
    };
}

// ─── Mock Risk Factors ─────────────────────────────────────────────
export function getMockRisks(_ticker: string): RiskFactor[] {
    return [
        { category: 'regulatory', description: 'EU Digital Markets Act enforcement could require significant changes to App Store policies, potentially impacting Services revenue which accounts for ~22% of total revenue.', severity: 'medium' },
        { category: 'competitive', description: 'Samsung and Google are rapidly integrating on-device AI capabilities into their smartphone ecosystems, narrowing the AI feature gap.', severity: 'medium' },
        { category: 'macro', description: 'Persistent elevated interest rates and consumer credit tightening could reduce demand for premium-priced devices. Smartphone replacement cycles extending to 4+ years.', severity: 'high' },
        { category: 'company-specific', description: 'Greater China revenue (~18% of total) faces headwinds from Huawei\'s resurgence and potential US-China trade restrictions.', severity: 'high' },
    ];
}

// ─── Mock Catalysts ────────────────────────────────────────────────
export function getMockCatalysts(_ticker: string): Catalyst[] {
    return [
        { description: 'WWDC 2026 expected to unveil next-generation Apple Intelligence features including advanced on-device LLM capabilities and Siri overhaul.', timeline: 'June 2026', impact: 'positive' },
        { description: 'iPhone 17 launch with significant design refresh and AI-first camera system. Analysts project potential super-cycle.', timeline: 'Sep 2026', impact: 'positive' },
        { description: 'Services segment approaching $100B annual run rate milestone with accelerating subscription growth.', timeline: 'Q3 2026', impact: 'positive' },
        { description: 'India manufacturing expansion with Tata Electronics and Foxconn doubling local production capacity.', timeline: 'H2 2026', impact: 'positive' },
    ];
}

// ─── Mock Audit Result ─────────────────────────────────────────────
export function getMockAudit(_ticker: string): AuditResult {
    return {
        claims: [
            { claim: 'Current P/E ratio stands at 28.52', status: 'grounded', source: 'Finnhub API' },
            { claim: 'Revenue reached $383.29 billion', status: 'grounded', source: 'Finnhub API' },
            { claim: 'Gross margin of 45.96% demonstrates pricing power', status: 'grounded', source: 'Finnhub API' },
            { claim: 'Services revenue approaching $100B annual run rate', status: 'grounded', source: 'Q1 2026 Earnings Call' },
            { claim: 'Social sentiment is predominantly bullish at 65%', status: 'grounded', source: 'Reddit RSS Analysis' },
            { claim: 'iPhone 17 could drive a super-cycle', status: 'speculative', source: 'Analyst consensus' },
            { claim: 'AI features will significantly boost Services ARPU', status: 'speculative', source: 'Industry analysis' },
            { claim: 'India manufacturing will offset China risks', status: 'speculative', source: 'Supply chain reports' },
        ],
        groundedCount: 5,
        speculativeCount: 3,
        unverifiableCount: 0,
    };
}

// ─── Mock Synthesis Report ─────────────────────────────────────────
export function getMockReport(ticker: string): string {
    return `# ${ticker.toUpperCase()} — Institutional-Grade Analysis Report

## Executive Summary

Apple Inc. (${ticker.toUpperCase()}) continues to demonstrate resilient financial performance amid a complex macroeconomic environment. Trading at $178.72 with a market capitalization of $2.78 trillion, the company maintains its position as the world's most valuable public company.

## Financial Health Assessment

Apple's fundamentals remain robust. Revenue of $383.29 billion with a gross margin of 45.96%, reflecting continued pricing power. P/E ratio of 28.52 with EPS of $6.27 suggests the stock trades at a premium, within its historical range for a mega-cap tech company.

Debt-to-equity ratio of 1.87 is strategic — Apple uses debt for buybacks and dividends. The 0.55% dividend yield is complemented by the industry's largest share repurchase program. Beta of 1.24 indicates slightly higher volatility than market. Stock trades 10.5% below its 52-week high of $199.62.

## Social Sentiment Analysis

Analysis of 50 posts from r/wallstreetbets, r/stocks, and r/investing reveals 65% bullish, 22% bearish, 13% neutral. Key bullish themes: iPhone sales momentum, Services revenue expansion, Apple Intelligence AI features. Bearish: valuation concerns and China dependency.

## Risk Factor Analysis

**High Severity:** Macro headwinds from elevated interest rates and consumer credit tightening. Greater China revenue (~18%) faces Huawei competition and geopolitical risks.

**Medium Severity:** EU Digital Markets Act could impact App Store policies. Samsung/Google AI features narrowing competitive gap.

## Catalyst Outlook

WWDC 2026 (June): Next-gen Apple Intelligence and Siri overhaul. iPhone 17 (September): Design refresh with potential super-cycle. Services approaching $100B run rate. India manufacturing expansion reducing China concentration.

## Conclusion

Balanced risk-reward profile. Strong fundamentals, supportive sentiment, multiple catalysts. Macro headwinds and China risks warrant careful positioning. P/E premium justified by ecosystem moat and Services growth.

*This report was generated by Nipun AI using verified financial data and multi-AI analysis.*

---

**⚠️ DISCLAIMER: This is not financial advice. This report is for educational and informational purposes only. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.**`;
}

// ─── Mock Investment Score ─────────────────────────────────────────
export function getMockInvestmentScore(_ticker: string): InvestmentScore {
    return {
        overall: 72,
        signal: 'Buy',
        breakdown: {
            technicalScore: 75,
            fundamentalScore: 80,
            sentimentScore: 65,
            riskScore: 58,
            insiderScore: 40,
        },
        summary: 'Strong fundamentals (P/E discount vs peers, 45.96% margin) and bullish technicals offset by net insider selling and macro risk headwinds.',
    };
}

// ─── Mock Financial Health ─────────────────────────────────────────
export function getMockFinancialHealth(_ticker: string): FinancialHealth {
    return {
        altmanZScore: 5.82,
        altmanZone: 'safe',
        piotroskiFScore: 7,
        piotroskiRating: 'strong',
        currentRatio: 1.07,
        quickRatio: 1.01,
        interestCoverage: 29.3,
        pricePositionPercent: 41.2,
        volatilityCategory: 'moderate',
        healthSummary: 'Excellent financial health — strong Altman Z (5.82, safe zone) and Piotroski F-Score (7/9, strong). High interest coverage (29.3x) indicates minimal debt risk. Stock trades at 41% of its 52-week range.',
    };
}

// ─── Mock Nipun Score™ ─────────────────────────────────────────────
export function getMockNipunScore(_ticker: string): NipunScore {
    return {
        grade: 'A-',
        numericScore: 82,
        confidence: 78,
        verdict: 'Strong conviction buy with moderate risk — premium fundamentals, bullish technicals, and solid institutional sentiment offset by elevated valuation and China exposure.',
        strengths: [
            'Industry-leading gross margins (45.96%) demonstrating pricing power',
            '6-quarter consecutive earnings beat streak with upside surprises',
            'Golden Cross pattern — bullish long-term technical signal',
            'Services revenue approaching $100B ARR provides recurring income moat',
            'Trading at 23% P/E discount vs mega-cap tech peers',
        ],
        weaknesses: [
            'Net insider selling ($15.9M sells vs $861K buys) signals caution',
            'Greater China revenue (18%) exposed to geopolitical risk',
            'Smartphone replacement cycles extending to 4+ years',
            'EU regulatory headwinds could impact App Store economics',
        ],
        recommendation: 'Accumulate on pullbacks to $170-175 range. Set stop-loss at $160 (52W low support). Target $210-220 within 12 months based on iPhone 17 cycle catalyst.',
    };
}

// ─── Mock Scenario Analysis ────────────────────────────────────────
export function getMockScenarioAnalysis(_ticker: string): ScenarioAnalysis {
    return {
        bull: {
            label: 'Bull Case',
            price: 225.00,
            upside: 25.9,
            probability: 30,
            rationale: 'iPhone 17 super-cycle drives 15% revenue growth, Services hits $100B run rate, AI monetization begins with premium Siri+ subscription ($4.99/mo).',
        },
        base: {
            label: 'Base Case',
            price: 195.00,
            upside: 9.1,
            probability: 50,
            rationale: 'Steady iPhone replacement demand, Services grows 15% YoY, Apple Intelligence drives modest ASP uplift. P/E expands slightly to 30x.',
        },
        bear: {
            label: 'Bear Case',
            price: 150.00,
            upside: -16.1,
            probability: 20,
            rationale: 'China revenue drops 25% from Huawei competition, EU forces App Store fee reduction, global recession reduces consumer electronics spend.',
        },
        timeHorizon: '12 months',
        methodology: 'Weighted DCF + comparable company analysis + scenario probability weighting. Uses forward EPS estimates with sector-adjusted multiples.',
    };
}

// ─── Mock Revenue Breakdown ────────────────────────────────────────
export function getMockRevenueBreakdown(_ticker: string): RevenueBreakdown {
    return {
        segments: [
            { name: 'iPhone', revenue: 200770000000, percent: 52.4, growth: 3.8 },
            { name: 'Services', revenue: 85200000000, percent: 22.2, growth: 16.3 },
            { name: 'Mac', revenue: 29360000000, percent: 7.7, growth: 8.1 },
            { name: 'iPad', revenue: 28300000000, percent: 7.4, growth: -3.2 },
            { name: 'Wearables & Home', revenue: 39660000000, percent: 10.3, growth: 2.5 },
        ],
        totalRevenue: 383290000000,
        revenueGrowth: 6.1,
        summary: 'Services is the growth engine (+16.3% YoY) and highest-margin segment, now 22% of revenue. iPhone remains dominant at 52% but growing modestly. iPad is the only declining segment.',
    };
}

// ─── Mock Momentum Score ───────────────────────────────────────────
export function getMockMomentum(_ticker: string): MomentumData {
    return {
        score: 68,
        trend: 'up',
        shortTerm: { period: '1 Month', performance: 3.2 },
        mediumTerm: { period: '3 Months', performance: 7.8 },
        longTerm: { period: '12 Months', performance: 12.5 },
        relativeStrength: 1.15,
        interpretation: 'Positive momentum across all timeframes. Stock outperforming S&P 500 by 15% on a relative basis. Short-term acceleration suggests sustained buying pressure.',
    };
}

// ─── Mock Value vs Growth ──────────────────────────────────────────
export function getMockValueGrowth(_ticker: string): ValueGrowthProfile {
    return {
        classification: 'Growth',
        valueScore: 42,
        growthScore: 71,
        metrics: {
            pegRatio: 2.1,
            priceToBook: 48.5,
            priceToSales: 7.3,
            epsGrowth5Y: 13.8,
            revenueGrowth5Y: 8.2,
        },
        interpretation: 'Classified as Growth — premium valuation (48.5x P/B, 7.3x P/S) justified by consistent EPS growth (13.8% 5Y CAGR). PEG ratio of 2.1 suggests slight overvaluation relative to growth rate, but ecosystem lock-in provides margin of safety.',
    };
}

// ─── Mock Competitive Moat ─────────────────────────────────────────
export function getMockCompetitiveMoat(_ticker: string): CompetitiveMoat {
    return {
        rating: 'Wide',
        score: 88,
        sources: [
            { name: 'Ecosystem Lock-in', strength: 'strong', description: '2B+ active devices create massive switching costs. iMessage, AirDrop, and Handoff chain users to Apple ecosystem.' },
            { name: 'Brand Premium', strength: 'strong', description: 'Commands 30-40% price premium over Android competitors. Brand value estimated at $880B — world\'s most valuable brand.' },
            { name: 'Services Network Effect', strength: 'moderate', description: 'App Store, Apple Music, iCloud create recurring revenue streams with 1B+ paid subscriptions.' },
            { name: 'Supply Chain Mastery', strength: 'strong', description: 'Custom silicon (M-series, A-series chips) provide 2-3 year performance lead over competitors. Vertical integration reduces costs.' },
        ],
        durability: 'high',
        interpretation: 'Wide moat with high durability — Apple\'s competitive advantages are structural and self-reinforcing. The ecosystem flywheel strengthens as each new product category (Vision Pro, Apple Car) adds switching cost layers.',
    };
}

// ─── Mock Risk-Reward ──────────────────────────────────────────────
export function getMockRiskReward(_ticker: string): RiskRewardProfile {
    return {
        riskLevel: 4,
        rewardPotential: 7,
        ratio: 2.9,
        rating: 'Good',
        maxDrawdownEstimate: 16.1,
        upsidePotential: 25.9,
        interpretation: 'Favorable risk-reward with 2.9:1 ratio. Maximum estimated downside of 16.1% (bear case $150) vs 25.9% upside (bull case $225). Suitable for moderate-risk portfolios seeking large-cap tech exposure.',
    };
}

// ─── Mock Dividend Analysis ────────────────────────────────────────
export function getMockDividendAnalysis(_ticker: string): DividendAnalysis {
    return {
        yield: 0.55,
        annualDividend: 0.96,
        payoutRatio: 15.3,
        growthRate5Y: 5.8,
        yearsOfGrowth: 12,
        exDividendDate: '2026-05-09',
        frequency: 'quarterly',
        safety: 'very-safe',
        interpretation: 'Ultra-safe dividend with only 15.3% payout ratio — Apple retains 85% of earnings for buybacks and R&D. 12 consecutive years of dividend growth at 5.8% CAGR. The $0.96/share annual dividend is well-covered with significant room for increases.',
    };
}
