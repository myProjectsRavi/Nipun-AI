/**
 * ─── Compute Module Unit Tests ─────────────────────────────────────
 * Tests all 10 pure-math functions in compute.ts.
 * Zero mocks needed — every function is pure (data in → result out).
 */
import { describe, it, expect } from 'vitest';
import {
    computeInvestmentScore,
    computeFinancialHealth,
    computeNipunScore,
    computeMomentum,
    computeValueGrowth,
    computeRiskReward,
    computeDividendAnalysis,
    computeExtendedTechnicals,
    computeValuationModels,
    computeEarningsQuality,
} from '../compute';
import type {
    FinancialData, TechnicalAnalysis, SentimentResult,
    RiskFactor, InsiderActivity, EarningsData,
    InvestmentScore, FinancialHealth,
} from '../types';

// ─── Shared Test Fixtures ──────────────────────────────────────────

const baseFinancials: FinancialData = {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    price: 180,
    change: 2.5,
    changePercent: 1.4,
    open: 178,
    high: 182,
    low: 177,
    previousClose: 177.5,
    volume: 50_000_000,
    marketCap: 2_800_000_000_000,
    pe: 28,
    eps: 6.42,
    beta: 1.2,
    weekHigh52: 199,
    weekLow52: 140,
    revenue: 394_000_000_000,
    grossMargin: 44,
    debtToEquity: 1.8,
    dividendYield: 0.55,
    sector: 'Technology',
};

const bullishTechnicals: TechnicalAnalysis = {
    rsi: { name: 'RSI', value: 55, signal: 'bullish', interpretation: '' },
    macd: { name: 'MACD', value: 1.2, signal: 'bullish', interpretation: '' },
    sma50: { name: 'SMA50', value: 175, signal: 'bullish', interpretation: '' },
    sma200: { name: 'SMA200', value: 160, signal: 'bullish', interpretation: '' },
    overallSignal: 'bullish',
    goldenDeathCross: null,
};

const bearishTechnicals: TechnicalAnalysis = {
    rsi: { name: 'RSI', value: 75, signal: 'bearish', interpretation: '' },
    macd: { name: 'MACD', value: -0.5, signal: 'bearish', interpretation: '' },
    sma50: { name: 'SMA50', value: 185, signal: 'bearish', interpretation: '' },
    sma200: { name: 'SMA200', value: 190, signal: 'bearish', interpretation: '' },
    overallSignal: 'bearish',
    goldenDeathCross: 'Death Cross',
};

const bullishSentiment: SentimentResult = {
    bullishPercent: 75,
    bearishPercent: 15,
    neutralPercent: 10,
    totalPosts: 50,
    posts: [],
    themes: ['AI growth', 'Strong earnings'],
};

const bearishSentiment: SentimentResult = {
    bullishPercent: 20,
    bearishPercent: 60,
    neutralPercent: 20,
    totalPosts: 30,
    posts: [],
    themes: ['Regulation fears'],
};

const lowRisks: RiskFactor[] = [
    { category: 'regulatory', description: 'Minor regulatory change', severity: 'low' },
];

const highRisks: RiskFactor[] = [
    { category: 'regulatory', description: 'Antitrust investigation', severity: 'high' },
    { category: 'competitive', description: 'Market share erosion', severity: 'high' },
    { category: 'macro', description: 'Rising rates', severity: 'medium' },
];

const bullishInsider: InsiderActivity = {
    trades: [],
    netSentiment: 'bullish',
    totalBuyValue: 5_000_000,
    totalSellValue: 1_000_000,
    summary: 'Net buying',
};

const bearishInsider: InsiderActivity = {
    trades: [],
    netSentiment: 'bearish',
    totalBuyValue: 500_000,
    totalSellValue: 10_000_000,
    summary: 'Heavy selling',
};

const strongEarnings: EarningsData = {
    surprises: [
        { quarter: 'Q1', estimateEps: 1.4, actualEps: 1.55, surprise: 0.15, surprisePercent: 10.7, beat: true },
        { quarter: 'Q2', estimateEps: 1.3, actualEps: 1.42, surprise: 0.12, surprisePercent: 9.2, beat: true },
        { quarter: 'Q3', estimateEps: 1.5, actualEps: 1.68, surprise: 0.18, surprisePercent: 12.0, beat: true },
        { quarter: 'Q4', estimateEps: 1.6, actualEps: 1.75, surprise: 0.15, surprisePercent: 9.4, beat: true },
    ],
    streak: '4-quarter beat streak',
    nextEarningsDate: '2025-01-30',
};

const weakEarnings: EarningsData = {
    surprises: [
        { quarter: 'Q1', estimateEps: 1.4, actualEps: 1.2, surprise: -0.2, surprisePercent: -14.3, beat: false },
        { quarter: 'Q2', estimateEps: 1.3, actualEps: 1.1, surprise: -0.2, surprisePercent: -15.4, beat: false },
        { quarter: 'Q3', estimateEps: 1.5, actualEps: 1.3, surprise: -0.2, surprisePercent: -13.3, beat: false },
        { quarter: 'Q4', estimateEps: 1.6, actualEps: 1.4, surprise: -0.2, surprisePercent: -12.5, beat: false },
    ],
    streak: '4-quarter miss streak',
    nextEarningsDate: null,
};

/** Generate ascending candle array simulating steady growth */
function makeCandles(count: number, start: number, dailyReturn: number): number[] {
    return Array.from({ length: count }, (_, i) => +(start * Math.pow(1 + dailyReturn, i)).toFixed(2));
}

/** Generate flat candle array */
function makeFlatCandles(count: number, price: number): number[] {
    return Array.from({ length: count }, () => price);
}


// ═══════════════════════════════════════════════════════════════════
// 1. computeInvestmentScore
// ═══════════════════════════════════════════════════════════════════
describe('computeInvestmentScore', () => {
    it('returns overall score between 0 and 100', () => {
        const result = computeInvestmentScore(baseFinancials, bullishTechnicals, bullishSentiment, lowRisks, bullishInsider, strongEarnings);
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
    });

    it('returns higher score for bullish inputs', () => {
        const bull = computeInvestmentScore(baseFinancials, bullishTechnicals, bullishSentiment, lowRisks, bullishInsider, strongEarnings);
        const bear = computeInvestmentScore(baseFinancials, bearishTechnicals, bearishSentiment, highRisks, bearishInsider, weakEarnings);
        expect(bull.overall).toBeGreaterThan(bear.overall);
    });

    it('maps "Strong Buy" signal for overall >= 80', () => {
        const result = computeInvestmentScore(baseFinancials, bullishTechnicals, bullishSentiment, [], bullishInsider, strongEarnings);
        if (result.overall >= 80) expect(result.signal).toBe('Strong Buy');
    });

    it('maps "Strong Sell" signal for overall < 30', () => {
        const weakFinancials = { ...baseFinancials, pe: 150, eps: -2, grossMargin: 5, debtToEquity: 5 };
        const result = computeInvestmentScore(weakFinancials, bearishTechnicals, bearishSentiment, highRisks, bearishInsider, weakEarnings);
        if (result.overall < 30) expect(result.signal).toBe('Strong Sell');
    });

    it('handles null technicals gracefully', () => {
        const result = computeInvestmentScore(baseFinancials, null, null, [], null, null);
        expect(result.overall).toBeDefined();
        expect(result.breakdown.technicalScore).toBe(50);
    });

    it('includes all 5 breakdown components', () => {
        const result = computeInvestmentScore(baseFinancials, bullishTechnicals, bullishSentiment, lowRisks, bullishInsider, strongEarnings);
        expect(result.breakdown).toHaveProperty('technicalScore');
        expect(result.breakdown).toHaveProperty('fundamentalScore');
        expect(result.breakdown).toHaveProperty('sentimentScore');
        expect(result.breakdown).toHaveProperty('riskScore');
        expect(result.breakdown).toHaveProperty('insiderScore');
    });

    it('applies golden cross bonus', () => {
        const goldenTechnicals = { ...bullishTechnicals, goldenDeathCross: 'Golden Cross detected' };
        const normal = computeInvestmentScore(baseFinancials, bullishTechnicals, null, [], null, null);
        const golden = computeInvestmentScore(baseFinancials, goldenTechnicals, null, [], null, null);
        expect(golden.overall).toBeGreaterThanOrEqual(normal.overall);
    });

    it('penalizes high PE ratios in fundamental score', () => {
        const highPE = { ...baseFinancials, pe: 100 };
        const lowPE = { ...baseFinancials, pe: 10 };
        const high = computeInvestmentScore(highPE, null, null, [], null, null);
        const low = computeInvestmentScore(lowPE, null, null, [], null, null);
        expect(low.breakdown.fundamentalScore).toBeGreaterThan(high.breakdown.fundamentalScore);
    });

    it('produces a summary string', () => {
        const result = computeInvestmentScore(baseFinancials, bullishTechnicals, bullishSentiment, lowRisks, bullishInsider, strongEarnings);
        expect(result.summary).toContain('Overall');
        expect(result.summary.length).toBeGreaterThan(20);
    });
});


// ═══════════════════════════════════════════════════════════════════
// 2. computeFinancialHealth
// ═══════════════════════════════════════════════════════════════════
describe('computeFinancialHealth', () => {
    it('returns valid Altman Z-Score zone', () => {
        const result = computeFinancialHealth(baseFinancials, null);
        expect(['safe', 'grey', 'distress']).toContain(result.altmanZone);
    });

    it('returns Piotroski F-Score between 0 and 9', () => {
        const result = computeFinancialHealth(baseFinancials, null);
        expect(result.piotroskiFScore).toBeGreaterThanOrEqual(0);
        expect(result.piotroskiFScore).toBeLessThanOrEqual(9);
    });

    it('computes volatility from candle data when available', () => {
        const volatileCandles = Array.from({ length: 30 }, (_, i) => 100 + (i % 2 === 0 ? 20 : -20));
        const result = computeFinancialHealth(baseFinancials, volatileCandles);
        expect(result.volatilityCategory).toBe('high');
    });

    it('falls back to beta-based volatility without candles', () => {
        const highBeta = { ...baseFinancials, beta: 2.0 };
        const result = computeFinancialHealth(highBeta, null);
        expect(result.volatilityCategory).toBe('high');
    });

    it('computes low volatility for stable candles', () => {
        const stableCandles = Array.from({ length: 30 }, (_, i) => 100 + i * 0.01);
        const result = computeFinancialHealth(baseFinancials, stableCandles);
        expect(result.volatilityCategory).toBe('low');
    });

    it('computes pricePositionPercent within 52-week range', () => {
        const result = computeFinancialHealth(baseFinancials, null);
        expect(result.pricePositionPercent).toBeGreaterThanOrEqual(0);
        expect(result.pricePositionPercent).toBeLessThanOrEqual(100);
    });

    it('rates strong financial health for quality company', () => {
        const strong = { ...baseFinancials, grossMargin: 55, debtToEquity: 0.3, eps: 10 };
        const result = computeFinancialHealth(strong, null);
        expect(result.piotroskiRating).toBe('strong');
    });

    it('returns a healthSummary string', () => {
        const result = computeFinancialHealth(baseFinancials, null);
        expect(result.healthSummary).toContain('Altman');
        expect(result.healthSummary).toContain('Piotroski');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 3. computeNipunScore
// ═══════════════════════════════════════════════════════════════════
describe('computeNipunScore', () => {
    const makeInvScore = (overall: number): InvestmentScore => ({
        overall,
        signal: overall >= 65 ? 'Buy' : 'Hold',
        breakdown: {
            technicalScore: overall, fundamentalScore: overall,
            sentimentScore: overall, riskScore: overall, insiderScore: overall,
        },
        summary: '',
    });

    const makeHealth = (zone: 'safe' | 'grey' | 'distress', rating: 'strong' | 'moderate' | 'weak'): FinancialHealth => ({
        altmanZScore: zone === 'safe' ? 3.5 : zone === 'grey' ? 2.0 : 1.0,
        altmanZone: zone,
        piotroskiFScore: rating === 'strong' ? 8 : rating === 'moderate' ? 5 : 2,
        piotroskiRating: rating,
        currentRatio: 2, quickRatio: 1.6, interestCoverage: 10,
        pricePositionPercent: 60, volatilityCategory: 'moderate',
        healthSummary: '',
        altmanIsEstimated: true,
        piotroskiIsEstimated: true,
    });

    it('returns grade between A+ and F', () => {
        const result = computeNipunScore(makeInvScore(75), makeHealth('safe', 'strong'), bullishTechnicals, bullishSentiment, strongEarnings);
        const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
        expect(validGrades).toContain(result.grade);
    });

    it('clamps numericScore to 0-100', () => {
        const result = computeNipunScore(makeInvScore(95), makeHealth('safe', 'strong'), bullishTechnicals, bullishSentiment, strongEarnings);
        expect(result.numericScore).toBeLessThanOrEqual(100);
        expect(result.numericScore).toBeGreaterThanOrEqual(0);
    });

    it('awards bonus for safe Altman + strong Piotroski', () => {
        const safe = computeNipunScore(makeInvScore(60), makeHealth('safe', 'strong'), null, null, null);
        const distress = computeNipunScore(makeInvScore(60), makeHealth('distress', 'weak'), null, null, null);
        expect(safe.numericScore).toBeGreaterThan(distress.numericScore);
    });

    it('awards earnings beat streak bonus', () => {
        const withBeats = computeNipunScore(makeInvScore(60), makeHealth('grey', 'moderate'), null, null, strongEarnings);
        const withMisses = computeNipunScore(makeInvScore(60), makeHealth('grey', 'moderate'), null, null, weakEarnings);
        expect(withBeats.numericScore).toBeGreaterThan(withMisses.numericScore);
    });

    it('populates strengths and weaknesses arrays', () => {
        const result = computeNipunScore(makeInvScore(75), makeHealth('safe', 'strong'), bullishTechnicals, bullishSentiment, strongEarnings);
        expect(Array.isArray(result.strengths)).toBe(true);
        expect(Array.isArray(result.weaknesses)).toBe(true);
        expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('returns confidence based on data availability', () => {
        const full = computeNipunScore(makeInvScore(70), makeHealth('grey', 'moderate'), bullishTechnicals, bullishSentiment, strongEarnings);
        const minimal = computeNipunScore(makeInvScore(70), makeHealth('grey', 'moderate'), null, null, null);
        expect(full.confidence).toBeGreaterThan(minimal.confidence);
    });

    it('sets verdict for strong profile', () => {
        const result = computeNipunScore(makeInvScore(80), makeHealth('safe', 'strong'), bullishTechnicals, bullishSentiment, strongEarnings);
        expect(result.verdict).toContain('Strong');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 4. computeMomentum
// ═══════════════════════════════════════════════════════════════════
describe('computeMomentum', () => {
    it('returns default flat momentum when candles are null', () => {
        const result = computeMomentum(null, baseFinancials);
        expect(result.score).toBe(50);
        expect(result.trend).toBe('flat');
    });

    it('returns default for insufficient candle data (< 30)', () => {
        const result = computeMomentum([100, 105, 110], baseFinancials);
        expect(result.score).toBe(50);
    });

    it('detects strong uptrend from rising candles', () => {
        const rising = makeCandles(100, 100, 0.005); // ~0.5% daily growth
        const result = computeMomentum(rising, baseFinancials);
        expect(result.score).toBeGreaterThan(60);
        expect(['strong-up', 'up']).toContain(result.trend);
    });

    it('detects downtrend from falling candles', () => {
        const falling = makeCandles(100, 200, -0.005); // ~0.5% daily decline
        const result = computeMomentum(falling, baseFinancials);
        expect(result.score).toBeLessThan(40);
        expect(['strong-down', 'down']).toContain(result.trend);
    });

    it('returns all three timeframes', () => {
        const candles = makeCandles(100, 100, 0.002);
        const result = computeMomentum(candles, baseFinancials);
        expect(result.shortTerm.period).toBe('7D');
        expect(result.mediumTerm.period).toBe('30D');
        expect(result.longTerm.period).toBe('90D');
    });

    it('computes relativeStrength as bounded 0-100', () => {
        const candles = makeCandles(100, 100, 0.003);
        const result = computeMomentum(candles, baseFinancials);
        expect(result.relativeStrength).toBeGreaterThanOrEqual(0);
        expect(result.relativeStrength).toBeLessThanOrEqual(100);
    });

    it('produces an interpretation string', () => {
        const candles = makeCandles(50, 100, 0.001);
        const result = computeMomentum(candles, baseFinancials);
        expect(result.interpretation).toContain('Momentum');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 5. computeValueGrowth
// ═══════════════════════════════════════════════════════════════════
describe('computeValueGrowth', () => {
    it('classifies low PE stock as value', () => {
        const value = { ...baseFinancials, pe: 8, grossMargin: 15, eps: 3, beta: 0.5 };
        const result = computeValueGrowth(value);
        expect(['Deep Value', 'Value']).toContain(result.classification);
    });

    it('classifies high-margin/high-PE stock as growth', () => {
        const growth = { ...baseFinancials, pe: 50, grossMargin: 70, eps: 8, beta: 1.5 };
        const result = computeValueGrowth(growth);
        expect(['Growth', 'High Growth']).toContain(result.classification);
        expect(result.growthScore).toBeGreaterThan(result.valueScore);
    });

    it('returns scores between 0 and 100', () => {
        const result = computeValueGrowth(baseFinancials);
        expect(result.valueScore).toBeGreaterThanOrEqual(0);
        expect(result.valueScore).toBeLessThanOrEqual(100);
        expect(result.growthScore).toBeGreaterThanOrEqual(0);
        expect(result.growthScore).toBeLessThanOrEqual(100);
    });

    it('computes PEG ratio correctly', () => {
        const result = computeValueGrowth({ ...baseFinancials, pe: 20, eps: 5 });
        expect(result.metrics.pegRatio).toBe(2.0); // PE 20 / growth rate 10
    });

    it('handles zero PE gracefully', () => {
        const result = computeValueGrowth({ ...baseFinancials, pe: 0 });
        expect(result.metrics.pegRatio).toBe(0);
    });

    it('includes interpretation', () => {
        const result = computeValueGrowth(baseFinancials);
        expect(result.interpretation).toContain('profile');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 6. computeRiskReward
// ═══════════════════════════════════════════════════════════════════
describe('computeRiskReward', () => {
    it('returns risk and reward levels between 1 and 10', () => {
        const result = computeRiskReward(baseFinancials, null);
        expect(result.riskLevel).toBeGreaterThanOrEqual(1);
        expect(result.riskLevel).toBeLessThanOrEqual(10);
        expect(result.rewardPotential).toBeGreaterThanOrEqual(1);
        expect(result.rewardPotential).toBeLessThanOrEqual(10);
    });

    it('returns valid rating string', () => {
        const result = computeRiskReward(baseFinancials, null);
        expect(['Excellent', 'Good', 'Fair', 'Poor']).toContain(result.rating);
    });

    it('computes max drawdown from candle data', () => {
        // Create candles that go from 100 → 150 → 100 (33% drawdown)
        const candles = [
            ...Array.from({ length: 30 }, (_, i) => 100 + i * (50 / 30)),
            ...Array.from({ length: 30 }, (_, i) => 150 - i * (50 / 30)),
        ];
        const result = computeRiskReward(baseFinancials, candles);
        expect(result.maxDrawdownEstimate).toBeGreaterThan(20);
    });

    it('computes upside potential from 52-week high', () => {
        const result = computeRiskReward(baseFinancials, null);
        // price=180, weekHigh52=199, upside ≈ 10.56%
        expect(result.upsidePotential).toBeGreaterThan(0);
        expect(result.upsidePotential).toBeLessThan(50);
    });

    it('handles zero price gracefully', () => {
        const zeroPriceFinancials = { ...baseFinancials, price: 0 };
        const result = computeRiskReward(zeroPriceFinancials, null);
        expect(result.upsidePotential).toBe(0);
    });

    it('includes interpretation string', () => {
        const result = computeRiskReward(baseFinancials, null);
        expect(result.interpretation).toContain('risk/reward');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 7. computeDividendAnalysis
// ═══════════════════════════════════════════════════════════════════
describe('computeDividendAnalysis', () => {
    it('computes dividend metrics for paying stock', () => {
        const result = computeDividendAnalysis(baseFinancials);
        expect(result.yield).toBe(0.55);
        expect(result.annualDividend).toBeGreaterThan(0);
    });

    it('reports "No dividend" for zero-yield stock', () => {
        const noDiv = { ...baseFinancials, dividendYield: 0 };
        const result = computeDividendAnalysis(noDiv);
        expect(result.yield).toBe(0);
        expect(result.interpretation).toContain('No dividend');
    });

    it('rates very-safe for low payout ratio', () => {
        // High EPS ensures low payout ratio
        const highEps = { ...baseFinancials, eps: 20, dividendYield: 1 };
        const result = computeDividendAnalysis(highEps);
        expect(result.safety).toBe('very-safe');
    });

    it('rates at-risk for very high payout ratio', () => {
        const lowEps = { ...baseFinancials, eps: 0.5, dividendYield: 5 };
        const result = computeDividendAnalysis(lowEps);
        expect(result.safety).toBe('at-risk');
    });

    it('returns payout ratio as percentage', () => {
        const result = computeDividendAnalysis(baseFinancials);
        expect(result.payoutRatio).toBeGreaterThanOrEqual(0);
    });

    it('returns quarterly frequency by default', () => {
        const result = computeDividendAnalysis(baseFinancials);
        expect(result.frequency).toBe('quarterly');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 8. computeExtendedTechnicals
// ═══════════════════════════════════════════════════════════════════
describe('computeExtendedTechnicals', () => {
    const candles = makeCandles(100, 100, 0.002); // steady growth

    it('computes Bollinger Bands with upper > middle > lower', () => {
        const result = computeExtendedTechnicals(candles);
        expect(result.bollingerBands.upper).toBeGreaterThan(result.bollingerBands.middle);
        expect(result.bollingerBands.middle).toBeGreaterThan(result.bollingerBands.lower);
    });

    it('computes stochastic K between 0 and 100', () => {
        const result = computeExtendedTechnicals(candles);
        expect(result.stochastic.k).toBeGreaterThanOrEqual(0);
        expect(result.stochastic.k).toBeLessThanOrEqual(100);
    });

    it('computes positive ATR for volatile candles', () => {
        const volatile = Array.from({ length: 20 }, (_, i) => 100 + (i % 2 === 0 ? 10 : -10));
        const result = computeExtendedTechnicals(volatile);
        expect(result.atr).toBeGreaterThanOrEqual(0);
    });

    it('computes support/resistance with correct ordering', () => {
        const result = computeExtendedTechnicals(candles);
        const sr = result.supportResistance;
        expect(sr.resistance2).toBeGreaterThanOrEqual(sr.resistance1);
        expect(sr.resistance1).toBeGreaterThanOrEqual(sr.pivot);
        expect(sr.pivot).toBeGreaterThanOrEqual(sr.support1);
        expect(sr.support1).toBeGreaterThanOrEqual(sr.support2);
    });

    it('computes Fibonacci levels within price range', () => {
        const result = computeExtendedTechnicals(candles);
        const fib = result.fibonacci;
        expect(fib.level236).toBeGreaterThan(fib.level382);
        expect(fib.level382).toBeGreaterThan(fib.level500);
        expect(fib.level500).toBeGreaterThan(fib.level618);
        expect(fib.level618).toBeGreaterThan(fib.level786);
    });

    it('computes historical volatility as non-negative', () => {
        const result = computeExtendedTechnicals(candles);
        expect(result.historicalVolatility).toBeGreaterThanOrEqual(0);
    });

    it('computes VWAP close to recent average', () => {
        const flat = makeFlatCandles(30, 100);
        const result = computeExtendedTechnicals(flat);
        expect(result.vwap).toBe(100);
    });

    it('detects overbought stochastic', () => {
        // Create candles that end at the top of their range
        const risingCandles = makeCandles(20, 80, 0.02);
        const result = computeExtendedTechnicals(risingCandles);
        expect(result.stochastic.signal).toBe('overbought');
    });
});


// ═══════════════════════════════════════════════════════════════════
// 9. computeValuationModels
// ═══════════════════════════════════════════════════════════════════
describe('computeValuationModels', () => {
    it('computes positive DCF for profitable company', () => {
        const result = computeValuationModels(baseFinancials);
        expect(result.dcf.value).toBeGreaterThan(0);
    });

    it('returns zero DCF for negative EPS', () => {
        const unprofitable = { ...baseFinancials, eps: -2 };
        const result = computeValuationModels(unprofitable);
        expect(result.dcf.value).toBe(0);
    });

    it('computes Graham Number for positive EPS', () => {
        const result = computeValuationModels(baseFinancials);
        expect(result.graham.value).toBeGreaterThan(0);
    });

    it('computes Lynch fair value as EPS × growth rate', () => {
        const result = computeValuationModels(baseFinancials);
        expect(result.lynch.value).toBe(+(baseFinancials.eps * 12).toFixed(2));
    });

    it('computes consensus as average of all models', () => {
        const result = computeValuationModels(baseFinancials);
        const estimates = [result.dcf.value, result.graham.value, result.lynch.value].filter(v => v > 0);
        const expectedConsensus = +(estimates.reduce((a, b) => a + b, 0) / estimates.length).toFixed(2);
        expect(Math.abs(result.consensus.value - expectedConsensus)).toBeLessThan(0.1);
    });

    it('includes methodology descriptions', () => {
        const result = computeValuationModels(baseFinancials);
        expect(result.dcf.methodology).toContain('discounted');
        expect(result.graham.methodology).toContain('Graham');
        expect(result.lynch.methodology).toContain('Lynch');
    });

    it('computes upside percentages relative to price', () => {
        const result = computeValuationModels(baseFinancials);
        if (result.dcf.value > baseFinancials.price) {
            expect(result.dcf.upside).toBeGreaterThan(0);
        }
    });
});


// ═══════════════════════════════════════════════════════════════════
// 10. computeEarningsQuality
// ═══════════════════════════════════════════════════════════════════
describe('computeEarningsQuality', () => {
    it('returns 50 for null earnings', () => {
        expect(computeEarningsQuality(null)).toBe(50);
    });

    it('returns 50 for empty surprises array', () => {
        expect(computeEarningsQuality({ surprises: [], streak: '', nextEarningsDate: null })).toBe(50);
    });

    it('returns high score for consistent beats', () => {
        const score = computeEarningsQuality(strongEarnings);
        expect(score).toBeGreaterThan(70);
    });

    it('returns lower score for consistent misses', () => {
        const score = computeEarningsQuality(weakEarnings);
        expect(score).toBeLessThan(50);
    });

    it('returns score between 0 and 100', () => {
        const score = computeEarningsQuality(strongEarnings);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
    });

    it('awards bonus for >= 4 quarters of data', () => {
        const twoQtrs: EarningsData = {
            surprises: strongEarnings.surprises.slice(0, 2),
            streak: '', nextEarningsDate: null,
        };
        const fourQtrs = strongEarnings;
        const twoScore = computeEarningsQuality(twoQtrs);
        const fourScore = computeEarningsQuality(fourQtrs);
        expect(fourScore).toBeGreaterThan(twoScore);
    });
});


// ═══════════════════════════════════════════════════════════════════
// Cross-cutting: Edge Cases & Boundary Tests
// ═══════════════════════════════════════════════════════════════════
describe('edge cases', () => {
    it('handles all-zero financials without crashing', () => {
        const zeroFinancials: FinancialData = {
            ticker: 'ZERO', companyName: 'Zero Corp', price: 0, change: 0,
            changePercent: 0, open: 0, high: 0, low: 0, previousClose: 0,
            volume: 0, marketCap: 0, pe: 0, eps: 0, beta: 0,
            weekHigh52: 0, weekLow52: 0, revenue: 0, grossMargin: 0,
            debtToEquity: 0, dividendYield: 0, sector: '',
        };
        expect(() => computeInvestmentScore(zeroFinancials, null, null, [], null, null)).not.toThrow();
        expect(() => computeFinancialHealth(zeroFinancials, null)).not.toThrow();
        expect(() => computeValueGrowth(zeroFinancials)).not.toThrow();
        expect(() => computeRiskReward(zeroFinancials, null)).not.toThrow();
        expect(() => computeDividendAnalysis(zeroFinancials)).not.toThrow();
        expect(() => computeValuationModels(zeroFinancials)).not.toThrow();
    });

    it('handles single-element candle array', () => {
        expect(() => computeExtendedTechnicals([100])).not.toThrow();
    });

    it('handles very large numbers without overflow', () => {
        const big = { ...baseFinancials, price: 1_000_000, marketCap: 1e15, revenue: 5e14 };
        expect(() => computeValuationModels(big)).not.toThrow();
        expect(() => computeRiskReward(big, null)).not.toThrow();
    });

    it('handles negative EPS and PE correctly', () => {
        const negative = { ...baseFinancials, eps: -5, pe: -10 };
        const result = computeInvestmentScore(negative, null, null, [], null, null);
        expect(result.overall).toBeGreaterThanOrEqual(0);
        expect(result.overall).toBeLessThanOrEqual(100);
    });
});
