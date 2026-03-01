import type {
    FinancialData,
    SentimentResult,
    RiskFactor,
    Catalyst,
    AuditResult,
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
        {
            category: 'regulatory',
            description:
                'EU Digital Markets Act enforcement could require significant changes to App Store policies, potentially impacting Services revenue which accounts for ~22% of total revenue. Compliance deadlines in H2 2026 require structural changes to payment processing and sideloading policies.',
            severity: 'medium',
        },
        {
            category: 'competitive',
            description:
                'Samsung and Google are rapidly integrating on-device AI capabilities into their smartphone ecosystems. Google Gemini Nano and Samsung Galaxy AI are narrowing the AI feature gap, particularly in markets where Apple has lower market share.',
            severity: 'medium',
        },
        {
            category: 'macro',
            description:
                'Persistent elevated interest rates and consumer credit tightening could reduce demand for premium-priced devices. Consumer discretionary spending has shown signs of softening in key markets, with smartphone replacement cycles extending to 4+ years.',
            severity: 'high',
        },
        {
            category: 'company-specific',
            description:
                'Greater China revenue (~18% of total) faces headwinds from domestic competitor Huawei\'s resurgence and potential geopolitical tensions. Any escalation in US-China trade restrictions could further impact supply chain and market access.',
            severity: 'high',
        },
    ];
}

// ─── Mock Catalysts ────────────────────────────────────────────────
export function getMockCatalysts(_ticker: string): Catalyst[] {
    return [
        {
            description:
                'WWDC 2026 expected to unveil next-generation Apple Intelligence features including advanced on-device LLM capabilities and Siri overhaul.',
            timeline: 'June 2026',
            impact: 'positive',
        },
        {
            description:
                'iPhone 17 launch cycle anticipated for Fall 2026 with significant design refresh and AI-first camera system. Analysts project a potential super-cycle driven by pent-up upgrade demand.',
            timeline: 'September 2026',
            impact: 'positive',
        },
        {
            description:
                'Services segment approaching $100B annual run rate milestone. App Store, iCloud, Apple Music, and Apple TV+ combined subscriptions showing accelerating growth trajectory.',
            timeline: 'Q3 2026',
            impact: 'positive',
        },
        {
            description:
                'India manufacturing expansion with Tata Electronics and Foxconn new facilities expected to double local production capacity, reducing China concentration risk.',
            timeline: 'H2 2026',
            impact: 'positive',
        },
    ];
}

// ─── Mock Audit Result ─────────────────────────────────────────────
export function getMockAudit(_ticker: string): AuditResult {
    return {
        claims: [
            { claim: 'Apple\'s current P/E ratio stands at 28.52', status: 'grounded', source: 'Finnhub API - Basic Financials' },
            { claim: 'Revenue reached $383.29 billion', status: 'grounded', source: 'Finnhub API - Financial Statements' },
            { claim: 'Gross margin of 45.96% demonstrates pricing power', status: 'grounded', source: 'Finnhub API - Basic Financials' },
            { claim: 'Services revenue is approaching $100B annual run rate', status: 'grounded', source: 'Apple Q1 2026 Earnings Call' },
            { claim: 'Social sentiment is predominantly bullish at 65%', status: 'grounded', source: 'Reddit RSS Analysis via Groq' },
            { claim: 'iPhone 17 could drive a super-cycle', status: 'speculative', source: 'Analyst consensus (multiple sources)' },
            { claim: 'Apple Intelligence features will significantly boost Services ARPU', status: 'speculative', source: 'Industry analysis' },
            { claim: 'India manufacturing will offset China risks within 18 months', status: 'speculative', source: 'Supply chain reports' },
        ],
        groundedCount: 5,
        speculativeCount: 3,
        unverifiableCount: 0,
    };
}

// ─── Mock Synthesis Report (~800 words) ────────────────────────────
export function getMockReport(ticker: string): string {
    return `# ${ticker.toUpperCase()} — Institutional-Grade Analysis Report

## Executive Summary

Apple Inc. (${ticker.toUpperCase()}) continues to demonstrate resilient financial performance amid a complex macroeconomic environment. Trading at $178.72 with a market capitalization of $2.78 trillion, the company maintains its position as the world's most valuable public company. This analysis synthesizes hard financial data from verified market sources, social sentiment from retail investor communities, and risk factors extracted from current news coverage to provide a comprehensive investment outlook.

## Financial Health Assessment

Apple's fundamentals remain robust. The company reported trailing twelve-month revenue of $383.29 billion with a gross margin of 45.96%, reflecting its continued pricing power and operational efficiency. The current P/E ratio of 28.52 with EPS of $6.27 suggests the stock is trading at a premium relative to the broader market, though within its historical range for a mega-cap technology company.

The debt-to-equity ratio of 1.87 warrants attention. While elevated, Apple's leverage is strategic — the company has consistently used debt financing for share buybacks and dividends due to favorable interest rates relative to its massive overseas cash reserves. The 0.55% dividend yield, while modest, represents a reliable income component complemented by the industry's largest share repurchase program.

Beta of 1.24 indicates slightly higher volatility than the market, consistent with Apple's sensitivity to consumer spending trends and technology sector sentiment. The stock is currently trading 10.5% below its 52-week high of $199.62, suggesting potential upside if near-term catalysts materialize.

## Social Sentiment Analysis

Analysis of 50 recent posts from r/wallstreetbets, r/stocks, and r/investing reveals a predominantly bullish retail sentiment at 65%, with 22% bearish and 13% neutral positions. Key bullish themes center on iPhone sales momentum, Services revenue expansion, and enthusiasm around Apple Intelligence AI features. Bearish sentiment is driven primarily by valuation concerns and China market dependency.

Notably, the "AI integration" theme appears across multiple bullish posts, suggesting retail investors are beginning to price in Apple's artificial intelligence strategy as a material growth driver. This aligns with institutional research from Morgan Stanley and Goldman Sachs, both of which have highlighted Apple Intelligence as a potential catalyst for an upgrade super-cycle.

## Risk Factor Analysis

**High Severity Risks:**

The macroeconomic environment presents the most significant near-term headwind. Persistent elevated interest rates and tightening consumer credit conditions could suppress demand for premium-priced devices, particularly as smartphone replacement cycles extend beyond four years. Additionally, Greater China — representing approximately 18% of total revenue — faces dual risks from Huawei's competitive resurgence and potential geopolitical escalation in US-China trade relations.

**Medium Severity Risks:**

Regulatory pressure from the EU Digital Markets Act could require structural changes to App Store policies, potentially impacting the high-margin Services segment. Simultaneously, competitive threats from Samsung's Galaxy AI and Google's Gemini Nano are narrowing Apple's AI feature differentiation, particularly in markets where Apple holds lower market share.

## Catalyst Outlook

Several potential positive catalysts exist on a 6-12 month horizon. WWDC 2026 (June) is expected to unveil next-generation Apple Intelligence capabilities including advanced on-device LLM features and a comprehensive Siri overhaul. The iPhone 17 launch cycle (September 2026) is anticipated to feature a significant design refresh that could trigger a super-cycle, driven by the convergence of pent-up upgrade demand and compelling new AI-driven camera capabilities.

The Services segment is approaching a significant milestone with approximately $100 billion in annual run rate revenue. Combined with accelerating subscription growth across Apple Music, Apple TV+, and iCloud, this positions Services as Apple's most resilient and highest-margin revenue stream.

## Fact Audit Summary

Of 8 key claims in this report, 5 are grounded in verified data sources (Finnhub API, company earnings calls, Reddit sentiment analysis), while 3 are classified as speculative (analyst projections, supply chain reports). Zero claims were flagged as unverifiable. All financial figures cited are sourced directly from Finnhub API data and have not been interpolated or estimated by any language model.

## Conclusion

Apple Inc. presents a balanced risk-reward profile at current levels. The company's financial fundamentals are strong, social sentiment is supportive, and multiple catalysts exist on a near-term horizon. However, macroeconomic headwinds and China-specific risks warrant careful position sizing. The premium valuation (P/E 28.52) is justified by the company's ecosystem moat and Services growth trajectory, though any deterioration in consumer spending could compress multiples.

*This report was generated by Nipun AI using verified financial data from Finnhub, sentiment analysis via Groq, risk extraction via Gemini, and fact auditing via Cohere. All financial figures are sourced from structured API data and have not passed through any language model for calculation or estimation.*

---

**⚠️ DISCLAIMER: This is not financial advice. This report is for educational and informational purposes only. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.**`;
}
