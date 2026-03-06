import { useStore } from '../store';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import PDFExport from './PDFExport';

// ─── Color Maps ─────────────────────────────────────────────────────
const SEVERITY = {
    high: { bg: 'bg-rose/10', border: 'border-rose/20', text: 'text-rose', dot: 'bg-rose' },
    medium: { bg: 'bg-gold/10', border: 'border-gold/20', text: 'text-gold', dot: 'bg-gold' },
    low: { bg: 'bg-emerald/10', border: 'border-emerald/20', text: 'text-emerald', dot: 'bg-emerald' },
};

const SIGNAL = {
    bullish: { color: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/20', icon: '🟢' },
    bearish: { color: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20', icon: '🔴' },
    neutral: { color: 'text-muted', bg: 'bg-white/5', border: 'border-white/10', icon: '⚪' },
};

const GRADE_COLORS: Record<string, string> = {
    'A+': 'text-emerald', 'A': 'text-emerald', 'A-': 'text-emerald-light',
    'B+': 'text-sky', 'B': 'text-sky', 'B-': 'text-sky-light',
    'C+': 'text-gold', 'C': 'text-gold', 'C-': 'text-gold-light',
    'D': 'text-rose-light', 'F': 'text-rose',
};

const PIE_COLORS = ['#34D399', '#FB7185', '#94A3B8'];

const REVENUE_COLORS = ['#818CF8', '#38BDF8', '#34D399', '#F59E0B', '#FB7185'];

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="stat-label">{label}</span>
                <span className="font-mono text-sm font-bold text-white">{value}</span>
            </div>
            <div className="score-bar">
                <div className={`score-bar-fill ${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function SectionCard({ title, icon, delay, children, premium }: { title: string; icon: string; delay?: string; children: React.ReactNode; premium?: boolean }) {
    return (
        <div className={`${premium ? 'card-premium' : 'card'} p-5 animate-slide-up`} style={delay ? { animationDelay: delay } : undefined}>
            <h3 className="section-heading mb-4 flex items-center gap-2">
                <span className="text-base">{icon}</span> {title}
            </h3>
            {children}
        </div>
    );
}

function formatN(n: number): string {
    if (n == null || isNaN(n)) return '$0';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return n.toString();
}

/** Safe number: returns 0 for null/undefined/NaN to prevent .toFixed() crashes */
function safe(n: number | null | undefined): number {
    if (n == null || isNaN(n) || !isFinite(n)) return 0;
    return n;
}

export default function ReportViewer() {
    const { result, clearResult, setView } = useStore();
    if (!result) return null;

    const sentimentData = [
        { name: 'Bullish', value: result.sentiment.bullishPercent },
        { name: 'Bearish', value: result.sentiment.bearishPercent },
        { name: 'Neutral', value: result.sentiment.neutralPercent },
    ];

    const goBack = () => { clearResult(); setView('analysis'); };

    return (
        <div className="mx-auto max-w-6xl animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={goBack} className="btn-secondary text-base" id="new-analysis-btn">← New</button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-2xl font-extrabold text-white">{result.ticker}</h1>
                            {result.financials.companyName !== result.ticker && (
                                <span className="text-base text-white/70">{result.financials.companyName}</span>
                            )}
                            {result.isDemo && <span className="badge-gold">DEMO</span>}
                        </div>
                        <p className="text-base text-white/80">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <PDFExport />
            </div>

            {/* ══════════ ROW 1: Nipun Score + Investment Score ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {/* Nipun Score™ */}
                {result.nipunScore && (
                    <SectionCard title="Nipun Score™" icon="🏆" premium>
                        <div className="flex items-start gap-5 mb-4">
                            <div className="flex-shrink-0 text-center">
                                <div className={`grade-display text-6xl leading-none ${GRADE_COLORS[result.nipunScore.grade] || 'text-white'}`} style={{ WebkitTextFillColor: 'unset', background: 'none' }}>
                                    {result.nipunScore.grade}
                                </div>
                                <div className="mt-1 font-mono text-base text-white/70">{safe(result.nipunScore.numericScore)}/100</div>
                                <div className="mt-0.5 text-base text-white/80">{result.nipunScore.confidence}% confident</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base text-white/80 leading-relaxed mb-3">{result.nipunScore.verdict}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <div>
                                        <div className="stat-label text-emerald mb-1">Strengths</div>
                                        {result.nipunScore.strengths.slice(0, 3).map((s, i) => (
                                            <p key={i} className="text-base text-white/70 mb-0.5 flex items-start gap-1"><span className="text-emerald flex-shrink-0">+</span> {s}</p>
                                        ))}
                                    </div>
                                    <div>
                                        <div className="stat-label text-rose mb-1">Weaknesses</div>
                                        {result.nipunScore.weaknesses.slice(0, 3).map((w, i) => (
                                            <p key={i} className="text-base text-white/70 mb-0.5 flex items-start gap-1"><span className="text-rose flex-shrink-0">−</span> {w}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-gold/5 border border-gold/10 p-3">
                            <div className="stat-label text-gold mb-1">💡 Recommendation</div>
                            <p className="text-sm text-white/80 leading-relaxed">{result.nipunScore.recommendation}</p>
                        </div>
                    </SectionCard>
                )}

                {/* Investment Score */}
                {result.investmentScore && (
                    <SectionCard title="Investment Score" icon="💰" delay="0.05s">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="relative flex-shrink-0 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-accent/25 bg-accent/5">
                                <div className="text-center">
                                    <div className="font-mono text-2xl font-extrabold text-accent">{result.investmentScore.overall}</div>
                                    <div className="text-base text-white/90">/100</div>
                                </div>
                            </div>
                            <div>
                                <div className={`font-display text-lg font-bold ${result.investmentScore.signal === 'Strong Buy' || result.investmentScore.signal === 'Buy' ? 'text-emerald' : result.investmentScore.signal === 'Hold' ? 'text-gold' : 'text-rose'}`}>
                                    {result.investmentScore.signal}
                                </div>
                                <p className="text-base text-white/70 leading-relaxed mt-1">{result.investmentScore.summary}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <ScoreBar label="Fundamentals" value={result.investmentScore.breakdown.fundamentalScore} color="bg-accent" />
                            <ScoreBar label="Technicals" value={result.investmentScore.breakdown.technicalScore} color="bg-sky" />
                            <ScoreBar label="Sentiment" value={result.investmentScore.breakdown.sentimentScore} color="bg-emerald" />
                            <ScoreBar label="Risk (higher = safer)" value={result.investmentScore.breakdown.riskScore} color="bg-gold" />
                            <ScoreBar label="Insider Signal" value={result.investmentScore.breakdown.insiderScore} color="bg-rose" />
                        </div>
                    </SectionCard>
                )}
            </div>

            {/* ══════════ ROW 2: Financial Health + Scenario Analysis ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.financialHealth && (
                    <SectionCard title="Financial Health" icon="🛡️" delay="0.1s">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className={`rounded-xl border p-3 text-center ${result.financialHealth.altmanZone === 'safe' ? 'border-emerald/20 bg-emerald/5' : result.financialHealth.altmanZone === 'grey' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                                <div className="stat-label mb-0.5">Altman Z-Score</div>
                                <div className="font-mono text-xl font-bold text-white">{safe(result.financialHealth.altmanZScore).toFixed(2)}</div>
                                <div className={`text-base font-semibold uppercase ${result.financialHealth.altmanZone === 'safe' ? 'text-emerald' : result.financialHealth.altmanZone === 'grey' ? 'text-gold' : 'text-rose'}`}>
                                    {result.financialHealth.altmanZone === 'safe' ? '✓ Safe' : result.financialHealth.altmanZone === 'grey' ? '~ Grey' : '✗ Distress'}
                                </div>
                            </div>
                            <div className={`rounded-xl border p-3 text-center ${result.financialHealth.piotroskiRating === 'strong' ? 'border-emerald/20 bg-emerald/5' : result.financialHealth.piotroskiRating === 'moderate' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                                <div className="stat-label mb-0.5">Piotroski F-Score</div>
                                <div className="font-mono text-xl font-bold text-white">{result.financialHealth.piotroskiFScore}<span className="text-base text-white/90">/9</span></div>
                                <div className={`text-base font-semibold uppercase ${result.financialHealth.piotroskiRating === 'strong' ? 'text-emerald' : result.financialHealth.piotroskiRating === 'moderate' ? 'text-gold' : 'text-rose'}`}>
                                    {result.financialHealth.piotroskiRating}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                                { l: 'Current Ratio', v: safe(result.financialHealth.currentRatio).toFixed(2) },
                                { l: 'Quick Ratio', v: safe(result.financialHealth.quickRatio).toFixed(2) },
                                { l: 'Interest Cov.', v: `${safe(result.financialHealth.interestCoverage).toFixed(1)}x` },
                            ].map(m => (
                                <div key={m.l} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                    <div className="stat-label">{m.l}</div>
                                    <div className="stat-value">{m.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mb-2">
                            <div className="flex justify-between mb-1">
                                <span className="stat-label">52-Week Position</span>
                                <span className="font-mono text-base text-white/80">{safe(result.financialHealth.pricePositionPercent).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                <div className="h-full rounded-full bg-gradient-to-r from-rose via-gold to-emerald" style={{ width: `${safe(result.financialHealth.pricePositionPercent)}%` }} />
                            </div>
                        </div>
                        <p className="text-base text-white/90 leading-relaxed">{result.financialHealth.healthSummary}</p>
                    </SectionCard>
                )}

                {result.scenarioAnalysis && (
                    <SectionCard title="Scenario Analysis" icon="🎯" delay="0.15s" premium>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {[result.scenarioAnalysis.bull, result.scenarioAnalysis.base, result.scenarioAnalysis.bear].map((sc) => {
                                const isUp = sc.upside >= 0;
                                return (
                                    <div key={sc.label} className={`rounded-xl border p-3 text-center ${sc.label === 'Bull Case' ? 'border-emerald/15 bg-emerald/5' : sc.label === 'Bear Case' ? 'border-rose/15 bg-rose/5' : 'border-white/10 bg-white/[0.03]'}`}>
                                        <div className="stat-label mb-1">{sc.label}</div>
                                        <div className="font-mono text-lg font-bold text-white">${safe(sc.price).toFixed(0)}</div>
                                        <div className={`text-base font-mono font-bold ${isUp ? 'text-emerald' : 'text-rose'}`}>
                                            {isUp ? '+' : ''}{safe(sc.upside).toFixed(1)}%
                                        </div>
                                        <div className="mt-1 text-base text-white/80">{sc.probability}% probability</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-2">
                            {[result.scenarioAnalysis.bull, result.scenarioAnalysis.base, result.scenarioAnalysis.bear].map((sc) => (
                                <div key={sc.label} className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <span className="text-base font-display font-semibold text-white/80">{sc.label}:</span>
                                    <span className="ml-1 text-base text-white/70">{sc.rationale}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-base text-white/80">Horizon: {result.scenarioAnalysis.timeHorizon} · {result.scenarioAnalysis.methodology}</p>
                    </SectionCard>
                )}
            </div>

            {/* ══════════ ROW 3: Revenue Breakdown + Momentum ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.revenueBreakdown && (
                    <SectionCard title="Revenue Breakdown" icon="📊" delay="0.2s">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="h-24 w-24 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={result.revenueBreakdown.segments} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="percent" strokeWidth={0}>
                                            {result.revenueBreakdown.segments.map((_e, i) => <Cell key={i} fill={REVENUE_COLORS[i % REVENUE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                {result.revenueBreakdown.segments.map((seg, i) => (
                                    <div key={seg.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: REVENUE_COLORS[i % REVENUE_COLORS.length] }} />
                                            <span className="text-base text-white/80">{seg.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-base text-white/70">{seg.percent}%</span>
                                            <span className={`font-mono text-base font-semibold ${seg.growth >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                                {seg.growth > 0 ? '+' : ''}{seg.growth}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="stat-label">Total Revenue</span>
                                <span className="stat-value">{formatN(result.revenueBreakdown.totalRevenue)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="stat-label">Revenue Growth</span>
                                <span className={`font-mono text-base font-bold ${safe(result.revenueBreakdown.revenueGrowth) >= 0 ? 'text-emerald' : 'text-rose'}`}>{safe(result.revenueBreakdown.revenueGrowth) > 0 ? '+' : ''}{safe(result.revenueBreakdown.revenueGrowth)}%</span>
                            </div>
                        </div>
                        <p className="mt-2 text-base text-white/90 leading-relaxed">{result.revenueBreakdown.summary}</p>
                    </SectionCard>
                )}

                {result.momentum && (
                    <SectionCard title="Momentum Score" icon="⚡" delay="0.25s">
                        <div className="flex items-center gap-5 mb-4">
                            <div className="flex-shrink-0 flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-sky/25 bg-sky/5">
                                <div className="text-center">
                                    <div className="font-mono text-2xl font-extrabold text-sky">{result.momentum.score}</div>
                                    <div className="text-base text-white/90">/100</div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className={`font-display text-base font-bold uppercase ${result.momentum.trend.includes('up') ? 'text-emerald' : result.momentum.trend.includes('down') ? 'text-rose' : 'text-gold'}`}>
                                    {result.momentum.trend.replace('-', ' ')} trend
                                </div>
                                <div className="mt-1 text-base text-white/90">Relative Strength vs S&P 500: <span className={`font-mono font-semibold ${safe(result.momentum.relativeStrength) > 1 ? 'text-emerald' : 'text-rose'}`}>{safe(result.momentum.relativeStrength).toFixed(2)}x</span></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[result.momentum.shortTerm, result.momentum.mediumTerm, result.momentum.longTerm].map(t => (
                                <div key={t.period} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                    <div className="stat-label">{t.period}</div>
                                    <div className={`font-mono text-base font-bold ${t.performance >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                        {t.performance > 0 ? '+' : ''}{t.performance}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-base text-white/90 leading-relaxed">{result.momentum.interpretation}</p>
                    </SectionCard>
                )}
            </div>

            {/* ══════════ ROW 4: Competitive Moat + Risk-Reward ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.competitiveMoat && (
                    <SectionCard title="Competitive Moat" icon="🏰" delay="0.3s" premium>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`rounded-xl border px-4 py-2 text-center ${result.competitiveMoat.rating === 'Wide' ? 'border-emerald/20 bg-emerald/5' : result.competitiveMoat.rating === 'Narrow' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                                <div className="font-display text-lg font-bold text-white">{result.competitiveMoat.rating}</div>
                                <div className="stat-label">moat</div>
                            </div>
                            <div className="flex-1">
                                <ScoreBar label="Moat Strength" value={result.competitiveMoat.score} color="bg-emerald" />
                                <div className="mt-1 text-base text-white/80">Durability: <span className="font-semibold text-white/70">{result.competitiveMoat.durability}</span></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {result.competitiveMoat.sources.map((src) => (
                                <div key={src.name} className="flex items-start gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <span className={`mt-0.5 text-base font-bold flex-shrink-0 ${src.strength === 'strong' ? 'text-emerald' : src.strength === 'moderate' ? 'text-gold' : 'text-rose'}`}>●</span>
                                    <div>
                                        <span className="text-base font-display font-semibold text-white/90">{src.name}</span>
                                        <p className="text-base text-white/90">{src.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {result.riskReward && (
                    <SectionCard title="Risk-Reward Profile" icon="⚖️" delay="0.35s">
                        <div className="flex items-center gap-5 mb-4">
                            <div className={`rounded-xl border px-5 py-3 text-center ${result.riskReward.rating === 'Excellent' ? 'border-emerald/20 bg-emerald/5' : result.riskReward.rating === 'Good' ? 'border-sky/20 bg-sky/5' : result.riskReward.rating === 'Fair' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                                <div className="font-mono text-2xl font-bold text-white">{safe(result.riskReward.ratio).toFixed(1)}</div>
                                <div className="stat-label">ratio</div>
                                <div className={`text-base font-semibold ${result.riskReward.rating === 'Excellent' || result.riskReward.rating === 'Good' ? 'text-emerald' : 'text-gold'}`}>{result.riskReward.rating}</div>
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="stat-label">Max Downside</span>
                                    <span className="font-mono text-base font-bold text-rose">−{result.riskReward.maxDrawdownEstimate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="stat-label">Upside Potential</span>
                                    <span className="font-mono text-base font-bold text-emerald">+{result.riskReward.upsidePotential}%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                                        <div className="stat-label">Risk Level</div>
                                        <div className="font-mono text-sm font-bold text-white/80">{result.riskReward.riskLevel}/10</div>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 text-center">
                                        <div className="stat-label">Reward</div>
                                        <div className="font-mono text-sm font-bold text-white/80">{result.riskReward.rewardPotential}/10</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-base text-white/90 leading-relaxed">{result.riskReward.interpretation}</p>
                    </SectionCard>
                )}
            </div>

            {/* ══════════ ROW 5: Value/Growth + Dividend ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.valueGrowth && (
                    <SectionCard title="Value vs Growth" icon="💎" delay="0.4s">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-2 text-center">
                                <div className="font-display text-base font-bold text-accent">{result.valueGrowth.classification}</div>
                                <div className="stat-label">profile</div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <ScoreBar label="Value Score" value={result.valueGrowth.valueScore} color="bg-gold" />
                                <ScoreBar label="Growth Score" value={result.valueGrowth.growthScore} color="bg-accent" />
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                            {[
                                { l: 'PEG', v: safe(result.valueGrowth?.metrics?.pegRatio).toFixed(1) },
                                { l: 'P/B', v: safe(result.valueGrowth?.metrics?.priceToBook).toFixed(1) },
                                { l: 'P/S', v: safe(result.valueGrowth?.metrics?.priceToSales).toFixed(1) },
                                { l: 'EPS 5Y', v: `${safe(result.valueGrowth?.metrics?.epsGrowth5Y)}%` },
                                { l: 'Rev 5Y', v: `${safe(result.valueGrowth?.metrics?.revenueGrowth5Y)}%` },
                            ].map(m => (
                                <div key={m.l} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-1.5 text-center">
                                    <div className="text-base text-white/80 uppercase">{m.l}</div>
                                    <div className="font-mono text-sm font-bold text-white">{m.v}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-base text-white/90 leading-relaxed">{result.valueGrowth.interpretation}</p>
                    </SectionCard>
                )}

                {result.dividendAnalysis && (
                    <SectionCard title="Dividend Analysis" icon="💰" delay="0.45s">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                                { l: 'Yield', v: `${result.dividendAnalysis.yield}%` },
                                { l: 'Annual', v: `$${result.dividendAnalysis.annualDividend}` },
                                { l: 'Payout Ratio', v: `${result.dividendAnalysis.payoutRatio}%` },
                            ].map(m => (
                                <div key={m.l} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                    <div className="stat-label">{m.l}</div>
                                    <div className="stat-value">{m.v}</div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                <div className="stat-label">Growth 5Y CAGR</div>
                                <div className="font-mono text-base font-bold text-emerald">+{result.dividendAnalysis.growthRate5Y}%</div>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                <div className="stat-label">Consecutive Growth</div>
                                <div className="font-mono text-sm font-bold text-white/80">{result.dividendAnalysis.yearsOfGrowth} years</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2 mb-2">
                            <span className="stat-label">Dividend Safety</span>
                            <span className={`badge ${result.dividendAnalysis.safety === 'very-safe' || result.dividendAnalysis.safety === 'safe' ? 'badge-success' : result.dividendAnalysis.safety === 'moderate' ? 'badge-warning' : 'badge-danger'}`}>
                                {result.dividendAnalysis.safety.replace('-', ' ')}
                            </span>
                        </div>
                        {result.dividendAnalysis.exDividendDate && (
                            <p className="text-base text-white/80">Ex-dividend: {result.dividendAnalysis.exDividendDate} · {result.dividendAnalysis.frequency}</p>
                        )}
                        <p className="mt-1 text-base text-white/90 leading-relaxed">{result.dividendAnalysis.interpretation}</p>
                    </SectionCard>
                )}
            </div>

            {/* ══════════ Financial Metrics Row ══════════ */}
            <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {[
                    { l: 'Price', v: `$${safe(result.financials.price).toFixed(2)}`, accent: true },
                    { l: 'Change', v: `${safe(result.financials.change) > 0 ? '+' : ''}${safe(result.financials.change).toFixed(2)} (${safe(result.financials.changePercent) > 0 ? '+' : ''}${safe(result.financials.changePercent).toFixed(2)}%)`, color: safe(result.financials.change) >= 0 ? 'text-emerald' : 'text-rose' },
                    { l: 'P/E', v: safe(result.financials.pe).toFixed(2) },
                    { l: 'EPS', v: `$${safe(result.financials.eps).toFixed(2)}` },
                    { l: 'Mkt Cap', v: formatN(safe(result.financials.marketCap)) },
                    { l: 'Beta', v: safe(result.financials.beta).toFixed(2) },
                ].map(item => (
                    <div key={item.l} className="card p-3">
                        <div className="stat-label">{item.l}</div>
                        <div className={`mt-1 font-mono text-base font-bold ${item.color || (item.accent ? 'text-accent' : 'text-white/80')}`}>{item.v}</div>
                    </div>
                ))}
            </div>

            {/* ══════════ Technical Analysis ══════════ */}
            {result.technicals && (
                <div className="mb-5">
                    <SectionCard title="Technical Analysis" icon="📈" delay="0.5s">
                        <div className="mb-3 flex items-center justify-end">
                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${SIGNAL[result.technicals.overallSignal].bg} ${SIGNAL[result.technicals.overallSignal].border} border ${SIGNAL[result.technicals.overallSignal].color}`}>
                                {SIGNAL[result.technicals.overallSignal].icon} {result.technicals.overallSignal.toUpperCase()}
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[result.technicals.rsi, result.technicals.macd, result.technicals.sma50, result.technicals.sma200].map((sig) => {
                                const s = SIGNAL[sig.signal];
                                return (
                                    <div key={sig.name} className={`rounded-xl border ${s.border} ${s.bg} p-3`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-base font-display font-semibold text-white/90">{sig.name}</span>
                                            <span className={`font-mono text-base font-bold ${s.color}`}>{sig.value}</span>
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{sig.interpretation}</p>
                                    </div>
                                );
                            })}
                        </div>
                        {result.technicals.goldenDeathCross && (
                            <div className="mt-3 rounded-xl border border-accent/15 bg-accent/5 p-2.5 text-center text-base text-accent font-medium">{result.technicals.goldenDeathCross}</div>
                        )}
                    </SectionCard>
                </div>
            )}

            {/* ══════════ Sentiment + Risks ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                <SectionCard title="Social Sentiment" icon="💬" delay="0.55s">
                    <div className="flex items-center gap-5">
                        <div className="h-28 w-28 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {sentimentData.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} formatter={(v: number) => `${v}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            {[
                                { l: 'Bullish', v: result.sentiment.bullishPercent, c: 'bg-emerald', tc: 'text-emerald' },
                                { l: 'Bearish', v: result.sentiment.bearishPercent, c: 'bg-rose', tc: 'text-rose' },
                                { l: 'Neutral', v: result.sentiment.neutralPercent, c: 'bg-muted', tc: 'text-muted' },
                            ].map(s => (
                                <div key={s.l} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${s.c}`} /><span className="text-base text-white/80">{s.l}</span></div>
                                    <span className={`font-mono text-base font-bold ${s.tc}`}>{s.v}%</span>
                                </div>
                            ))}
                            <div className="text-base text-white/80 pt-1">{result.sentiment.totalPosts} posts analyzed</div>
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.sentiment.themes.map(t => <span key={t} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-base text-white/90 border border-white/[0.05]">{t}</span>)}
                    </div>
                </SectionCard>

                <SectionCard title="Risk Factors" icon="⚠️" delay="0.6s">
                    <div className="space-y-2">
                        {result.risks.map((risk, i) => {
                            const c = SEVERITY[risk.severity];
                            return (
                                <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
                                    <div className="flex items-center gap-2 mb-1"><div className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /><span className={`text-base font-semibold uppercase ${c.text}`}>{risk.severity} — {risk.category}</span></div>
                                    <p className="text-sm text-white/70 leading-relaxed">{risk.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            </div>

            {/* ══════════ Insider + Earnings ══════════ */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.insiderActivity && (
                    <SectionCard title="Insider Activity" icon="🏦" delay="0.65s">
                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-emerald/5 border border-emerald/10 p-2 text-center">
                                <div className="stat-label text-emerald/60">Buys</div>
                                <div className="font-mono text-base font-bold text-emerald">{formatN(result.insiderActivity.totalBuyValue)}</div>
                            </div>
                            <div className="rounded-xl bg-rose/5 border border-rose/10 p-2 text-center">
                                <div className="stat-label text-rose/60">Sells</div>
                                <div className="font-mono text-base font-bold text-rose">{formatN(result.insiderActivity.totalSellValue)}</div>
                            </div>
                        </div>
                        <div className="space-y-1 max-h-44 overflow-y-auto">
                            {result.insiderActivity.trades.map((t, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.03] px-3 py-1.5">
                                    <div><span className="text-base text-white/80">{t.name}</span><span className="ml-1 text-base text-white/80">{t.role}</span></div>
                                    <div className="text-right">
                                        <span className={`text-base font-semibold ${t.transactionType === 'buy' ? 'text-emerald' : t.transactionType === 'sell' ? 'text-rose' : 'text-muted'}`}>{t.transactionType.toUpperCase()}</span>
                                        <span className="ml-2 font-mono text-base text-white/80">{formatN(t.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                )}

                {result.earnings && (
                    <SectionCard title="Earnings History" icon="📅" delay="0.7s">
                        <div className="mb-3 text-center font-display text-base font-semibold text-white/90">{result.earnings.streak}</div>
                        {result.earnings.surprises.length > 0 && (
                            <div className="h-36 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.earnings.surprises.slice().reverse()} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="quarter" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                                        <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === 'estimateEps' ? 'Est' : 'Actual']} />
                                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                                        <Bar dataKey="estimateEps" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Est" />
                                        <Bar dataKey="actualEps" fill="#818CF8" radius={[4, 4, 0, 0]} name="Actual" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>

            {/* ══════════ Peers + SEC ══════════ */}
            {result.peerComparison && (
                <div className="mb-5">
                    <SectionCard title="Peer Comparison" icon="🏭" delay="0.75s">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-white/[0.06]">
                                    {['Ticker', 'Price', 'Mkt Cap', 'P/E', 'EPS', 'Change'].map(h => <th key={h} className={`py-2 stat-label ${h === 'Ticker' ? 'text-left' : 'text-right'}`}>{h}</th>)}
                                </tr></thead>
                                <tbody>
                                    <tr className="border-b border-accent/10 bg-accent/5">
                                        <td className="py-2 text-sm font-mono font-bold text-accent">{result.ticker}</td>
                                        <td className="py-2 text-right text-sm font-mono text-white/70">${safe(result.financials.price).toFixed(2)}</td>
                                        <td className="py-2 text-right text-sm font-mono text-white/70">{formatN(safe(result.financials.marketCap))}</td>
                                        <td className="py-2 text-right text-sm font-mono text-white/70">{safe(result.financials.pe).toFixed(1)}</td>
                                        <td className="py-2 text-right text-sm font-mono text-white/70">${safe(result.financials.eps).toFixed(2)}</td>
                                        <td className={`py-2 text-right font-mono font-semibold ${safe(result.financials.changePercent) >= 0 ? 'text-emerald' : 'text-rose'}`}>{safe(result.financials.changePercent) > 0 ? '+' : ''}{safe(result.financials.changePercent).toFixed(2)}%</td>
                                    </tr>
                                    {result.peerComparison.peers.map(p => (
                                        <tr key={p.ticker} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                            <td className="py-2 text-sm font-mono text-white/80">{p.ticker}</td>
                                            <td className="py-2 text-right text-sm font-mono text-white/70">${safe(p.price).toFixed(2)}</td>
                                            <td className="py-2 text-right text-sm font-mono text-white/70">{formatN(safe(p.marketCap))}</td>
                                            <td className="py-2 text-right text-sm font-mono text-white/70">{p.pe > 0 ? safe(p.pe).toFixed(1) : 'N/A'}</td>
                                            <td className="py-2 text-right text-sm font-mono text-white/70">${safe(p.eps).toFixed(2)}</td>
                                            <td className={`py-2 text-right font-mono ${safe(p.change) >= 0 ? 'text-emerald/50' : 'text-rose/50'}`}>{safe(p.change) > 0 ? '+' : ''}{safe(p.change).toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-base text-white/80">{result.peerComparison.relativeValuation}</p>
                    </SectionCard>
                </div>
            )}

            {/* SEC Filings + Catalysts row */}
            <div className="mb-5 grid gap-4 lg:grid-cols-2">
                {result.secFilings && result.secFilings.length > 0 && (
                    <SectionCard title="SEC Filings" icon="📄" delay="0.8s">
                        <div className="space-y-1.5">
                            {result.secFilings.map((f, i) => (
                                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2 hover:bg-white/[0.04] transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-xs font-bold text-accent">{f.type}</span>
                                        <span className="text-xs text-white/70 truncate max-w-[200px]">{f.description}</span>
                                    </div>
                                    <span className="text-xs text-white/50 group-hover:text-accent transition-colors whitespace-nowrap">{f.dateFiled} →</span>
                                </a>
                            ))}
                        </div>
                    </SectionCard>
                )}

                <SectionCard title="Catalysts" icon="🚀" delay="0.85s">
                    <div className="space-y-2">
                        {result.catalysts.map((cat, i) => (
                            <div key={i} className="rounded-xl border border-emerald/10 bg-emerald/[0.03] p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="badge-success">{cat.timeline}</span>
                                    <span className="text-xs text-emerald/50 capitalize">{cat.impact}</span>
                                </div>
                                <p className="text-sm text-white/70 leading-relaxed">{cat.description}</p>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ══════════ NEW ROW: Analyst Consensus + Price Targets ══════════ */}
            {(result.analystConsensus || result.priceTarget) && (
                <div className="mb-5 grid gap-4 lg:grid-cols-2">
                    {result.analystConsensus && (
                        <SectionCard title="Analyst Consensus" icon="📊" delay="0.87s" premium>
                            <div className="mb-3">
                                <div className={`text-center rounded-xl border px-4 py-2 mb-3 ${result.analystConsensus.consensusRating.includes('Buy') ? 'border-emerald/20 bg-emerald/5' :
                                    result.analystConsensus.consensusRating.includes('Sell') ? 'border-rose/20 bg-rose/5' :
                                        'border-gold/20 bg-gold/5'
                                    }`}>
                                    <div className="stat-label mb-0.5">Wall Street Consensus</div>
                                    <div className={`font-display text-lg font-bold ${result.analystConsensus.consensusRating.includes('Buy') ? 'text-emerald' :
                                        result.analystConsensus.consensusRating.includes('Sell') ? 'text-rose' : 'text-gold'
                                        }`}>{result.analystConsensus.consensusRating}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 mb-2">
                                {[
                                    { l: 'Strong Buy', v: result.analystConsensus.strongBuy, c: 'bg-emerald' },
                                    { l: 'Buy', v: result.analystConsensus.buy, c: 'bg-emerald/60' },
                                    { l: 'Hold', v: result.analystConsensus.hold, c: 'bg-gold' },
                                    { l: 'Sell', v: result.analystConsensus.sell, c: 'bg-rose/60' },
                                    { l: 'Strong Sell', v: result.analystConsensus.strongSell, c: 'bg-rose' },
                                ].map(a => (
                                    <div key={a.l} className="text-center">
                                        <div className="font-mono text-sm font-bold text-white">{a.v}</div>
                                        <div className={`mt-1 h-1.5 rounded-full ${a.c}`} style={{ opacity: Math.max(0.2, a.v / 10) }} />
                                        <div className="mt-1 text-[9px] text-white/50 leading-tight">{a.l}</div>
                                    </div>
                                ))}
                            </div>
                            {result.analystConsensus.period && (
                                <p className="text-xs text-white/40 mt-2">Period: {result.analystConsensus.period}</p>
                            )}
                        </SectionCard>
                    )}

                    {result.priceTarget && (
                        <SectionCard title="Analyst Price Targets" icon="🎯" delay="0.89s" premium>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {[
                                    { l: 'Low', v: result.priceTarget.targetLow, c: 'border-rose/15 bg-rose/5' },
                                    { l: 'Median', v: result.priceTarget.targetMedian, c: 'border-sky/15 bg-sky/5' },
                                    { l: 'High', v: result.priceTarget.targetHigh, c: 'border-emerald/15 bg-emerald/5' },
                                ].map(t => (
                                    <div key={t.l} className={`rounded-xl border ${t.c} p-3 text-center`}>
                                        <div className="stat-label mb-0.5">{t.l}</div>
                                        <div className="font-mono text-lg font-bold text-white">${safe(t.v).toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <span className="stat-label">Current: ${safe(result.priceTarget.currentPrice).toFixed(2)}</span>
                                    <span className={`font-mono text-sm font-bold ${safe(result.priceTarget.upsidePercent) >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                        {safe(result.priceTarget.upsidePercent) > 0 ? '+' : ''}{safe(result.priceTarget.upsidePercent).toFixed(1)}% to mean
                                    </span>
                                </div>
                                <div className="relative h-2 rounded-full bg-white/[0.06]">
                                    {(() => {
                                        const range = result.priceTarget!.targetHigh - result.priceTarget!.targetLow;
                                        const pos = range > 0 ? ((result.priceTarget!.currentPrice - result.priceTarget!.targetLow) / range) * 100 : 50;
                                        return <div className="absolute top-0 h-full w-1 rounded-full bg-accent" style={{ left: `${Math.max(0, Math.min(100, pos))}%` }} />;
                                    })()}
                                    <div className="h-full rounded-full bg-gradient-to-r from-rose via-gold to-emerald opacity-30" />
                                </div>
                            </div>
                        </SectionCard>
                    )}
                </div>
            )}

            {/* ══════════ NEW ROW: Valuation Models + Institutional Ownership ══════════ */}
            {(result.valuationModels || result.institutionalOwnership) && (
                <div className="mb-5 grid gap-4 lg:grid-cols-2">
                    {result.valuationModels && (
                        <SectionCard title="Valuation Models" icon="🧮" delay="0.88s" premium>
                            <div className="space-y-2 mb-3">
                                {[
                                    { l: 'DCF (10-Year)', v: result.valuationModels.dcf, icon: '📈' },
                                    { l: 'Graham Number', v: result.valuationModels.graham, icon: '📐' },
                                    { l: 'Peter Lynch', v: result.valuationModels.lynch, icon: '🎓' },
                                ].map(m => (
                                    <div key={m.l} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-1.5">
                                                <span>{m.icon}</span>
                                                <span className="text-sm font-display font-semibold text-white/90">{m.l}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-bold text-white">${safe(m.v.value).toFixed(0)}</span>
                                                <span className={`font-mono text-xs font-bold ${safe(m.v.upside) >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                                    {safe(m.v.upside) > 0 ? '+' : ''}{safe(m.v.upside).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white/50">{m.v.methodology}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                                <div className="stat-label mb-0.5">Consensus Fair Value</div>
                                <div className="font-mono text-xl font-bold text-accent">${safe(result.valuationModels.consensus.value).toFixed(0)}</div>
                                <div className={`font-mono text-sm font-bold ${safe(result.valuationModels.consensus.upside) >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                    {safe(result.valuationModels.consensus.upside) > 0 ? '+' : ''}{safe(result.valuationModels.consensus.upside).toFixed(1)}% from current
                                </div>
                            </div>
                        </SectionCard>
                    )}

                    {result.institutionalOwnership && (
                        <SectionCard title="Institutional Ownership" icon="🏛️" delay="0.9s">
                            <div className="rounded-xl border border-sky/15 bg-sky/5 p-3 text-center mb-3">
                                <div className="stat-label mb-0.5">Total Institutional Holders</div>
                                <div className="font-mono text-xl font-bold text-sky">{result.institutionalOwnership.totalHolders}</div>
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {result.institutionalOwnership.holders.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                        <span className="text-sm text-white/80 truncate max-w-[60%]">{h.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-white/60">{formatN(h.value)}</span>
                                            {h.changePercent !== 0 && (
                                                <span className={`font-mono text-xs font-semibold ${h.changePercent > 0 ? 'text-emerald' : 'text-rose'}`}>
                                                    {h.changePercent > 0 ? '+' : ''}{h.changePercent.toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>
            )}

            {/* ══════════ NEW ROW: SWOT Analysis + Investment Thesis ══════════ */}
            {(result.swotAnalysis || result.investmentThesis) && (
                <div className="mb-5 grid gap-4 lg:grid-cols-2">
                    {result.swotAnalysis && (
                        <SectionCard title="SWOT Analysis" icon="🔍" delay="0.88s" premium>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { l: 'Strengths', items: result.swotAnalysis.strengths, bg: 'bg-emerald/5', border: 'border-emerald/15', tc: 'text-emerald', icon: '💪' },
                                    { l: 'Weaknesses', items: result.swotAnalysis.weaknesses, bg: 'bg-rose/5', border: 'border-rose/15', tc: 'text-rose', icon: '⚠️' },
                                    { l: 'Opportunities', items: result.swotAnalysis.opportunities, bg: 'bg-sky/5', border: 'border-sky/15', tc: 'text-sky', icon: '🌟' },
                                    { l: 'Threats', items: result.swotAnalysis.threats, bg: 'bg-gold/5', border: 'border-gold/15', tc: 'text-gold', icon: '⛈️' },
                                ].map(q => (
                                    <div key={q.l} className={`rounded-xl border ${q.border} ${q.bg} p-3`}>
                                        <div className={`text-sm font-display font-bold ${q.tc} mb-2 flex items-center gap-1`}>{q.icon} {q.l}</div>
                                        <ul className="space-y-1">
                                            {q.items.slice(0, 3).map((item, i) => (
                                                <li key={i} className="text-xs text-white/70 leading-relaxed flex items-start gap-1">
                                                    <span className={`flex-shrink-0 mt-0.5 ${q.tc}`}>•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {result.investmentThesis && (
                        <SectionCard title="Investment Thesis" icon="📋" delay="0.9s" premium>
                            <div className="rounded-xl bg-accent/5 border border-accent/15 p-3 mb-3">
                                <div className="stat-label text-accent mb-1">Summary</div>
                                <p className="text-sm text-white/80 leading-relaxed">{result.investmentThesis.summary}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-xl bg-emerald/5 border border-emerald/15 p-3">
                                    <div className="stat-label text-emerald mb-1">🐂 Bull Case</div>
                                    <p className="text-xs text-white/70 leading-relaxed">{result.investmentThesis.bullCase}</p>
                                </div>
                                <div className="rounded-xl bg-rose/5 border border-rose/15 p-3">
                                    <div className="stat-label text-rose mb-1">🐻 Bear Case</div>
                                    <p className="text-xs text-white/70 leading-relaxed">{result.investmentThesis.bearCase}</p>
                                </div>
                            </div>
                        </SectionCard>
                    )}
                </div>
            )}

            {/* ══════════ NEW ROW: Extended Technicals ══════════ */}
            {result.extendedTechnicals && (
                <div className="mb-5">
                    <SectionCard title="Advanced Technical Indicators" icon="📐" delay="0.88s" premium>
                        <div className="grid gap-3 sm:grid-cols-3 mb-3">
                            {/* Bollinger Bands */}
                            <div className={`rounded-xl border p-3 ${result.extendedTechnicals.bollingerBands.signal === 'overbought' ? 'border-rose/15 bg-rose/5' :
                                result.extendedTechnicals.bollingerBands.signal === 'oversold' ? 'border-emerald/15 bg-emerald/5' :
                                    'border-white/10 bg-white/[0.03]'
                                }`}>
                                <div className="stat-label mb-1">Bollinger Bands</div>
                                <div className="space-y-0.5 font-mono text-xs text-white/70">
                                    <div className="flex justify-between"><span>Upper</span><span className="text-white/90">${result.extendedTechnicals.bollingerBands.upper.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Middle</span><span className="text-white/90">${result.extendedTechnicals.bollingerBands.middle.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Lower</span><span className="text-white/90">${result.extendedTechnicals.bollingerBands.lower.toFixed(2)}</span></div>
                                </div>
                                <div className={`mt-1 text-xs font-semibold uppercase ${result.extendedTechnicals.bollingerBands.signal === 'overbought' ? 'text-rose' :
                                    result.extendedTechnicals.bollingerBands.signal === 'oversold' ? 'text-emerald' : 'text-white/50'
                                    }`}>{result.extendedTechnicals.bollingerBands.signal}</div>
                            </div>

                            {/* Stochastic */}
                            <div className={`rounded-xl border p-3 ${result.extendedTechnicals.stochastic.signal === 'overbought' ? 'border-rose/15 bg-rose/5' :
                                result.extendedTechnicals.stochastic.signal === 'oversold' ? 'border-emerald/15 bg-emerald/5' :
                                    'border-white/10 bg-white/[0.03]'
                                }`}>
                                <div className="stat-label mb-1">Stochastic Oscillator</div>
                                <div className="font-mono text-xl font-bold text-white text-center mb-1">{result.extendedTechnicals.stochastic.k.toFixed(1)}</div>
                                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div className="h-full rounded-full bg-sky" style={{ width: `${result.extendedTechnicals.stochastic.k}%` }} />
                                </div>
                                <div className={`mt-1 text-xs font-semibold uppercase text-center ${result.extendedTechnicals.stochastic.signal === 'overbought' ? 'text-rose' :
                                    result.extendedTechnicals.stochastic.signal === 'oversold' ? 'text-emerald' : 'text-white/50'
                                    }`}>{result.extendedTechnicals.stochastic.signal}</div>
                            </div>

                            {/* ATR + Volatility */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="stat-label mb-1">Volatility</div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between font-mono text-xs"><span className="text-white/60">ATR</span><span className="text-white/90 font-bold">${result.extendedTechnicals.atr.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-mono text-xs"><span className="text-white/60">Hist. Vol</span><span className="text-white/90 font-bold">{result.extendedTechnicals.historicalVolatility.toFixed(1)}%</span></div>
                                    <div className="flex justify-between font-mono text-xs"><span className="text-white/60">VWAP</span><span className="text-white/90 font-bold">${result.extendedTechnicals.vwap.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {/* Support/Resistance */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="stat-label mb-2">Support & Resistance</div>
                                <div className="space-y-1 font-mono text-xs">
                                    {[
                                        { l: 'R2', v: result.extendedTechnicals.supportResistance.resistance2, c: 'text-rose' },
                                        { l: 'R1', v: result.extendedTechnicals.supportResistance.resistance1, c: 'text-rose/60' },
                                        { l: 'Pivot', v: result.extendedTechnicals.supportResistance.pivot, c: 'text-accent' },
                                        { l: 'S1', v: result.extendedTechnicals.supportResistance.support1, c: 'text-emerald/60' },
                                        { l: 'S2', v: result.extendedTechnicals.supportResistance.support2, c: 'text-emerald' },
                                    ].map(lv => (
                                        <div key={lv.l} className="flex justify-between">
                                            <span className={`font-semibold ${lv.c}`}>{lv.l}</span>
                                            <span className="text-white/80">${lv.v.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fibonacci */}
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <div className="stat-label mb-2">Fibonacci Retracements</div>
                                <div className="space-y-1 font-mono text-xs">
                                    {[
                                        { l: '23.6%', v: result.extendedTechnicals.fibonacci.level236 },
                                        { l: '38.2%', v: result.extendedTechnicals.fibonacci.level382 },
                                        { l: '50.0%', v: result.extendedTechnicals.fibonacci.level500 },
                                        { l: '61.8%', v: result.extendedTechnicals.fibonacci.level618 },
                                        { l: '78.6%', v: result.extendedTechnicals.fibonacci.level786 },
                                    ].map(fib => (
                                        <div key={fib.l} className="flex justify-between">
                                            <span className="text-accent/70">{fib.l}</span>
                                            <span className="text-white/80">${fib.v.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* ══════════ NEW ROW: News Headlines + Earnings Quality ══════════ */}
            {(result.newsHeadlines && result.newsHeadlines.length > 0) && (
                <div className="mb-5">
                    <SectionCard title="Latest News" icon="📰" delay="0.88s">
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {result.newsHeadlines.map((n, i) => (
                                <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <span className="text-xs text-accent flex-shrink-0 mt-0.5">●</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/80 leading-relaxed">{n.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-white/40">{n.source}</span>
                                            {n.date && <span className="text-xs text-white/30">{n.date.split(' ').slice(0, 4).join(' ')}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* AI Consensus */}
            {result.aiConsensus && (
                <div className="mb-5">
                    <SectionCard title="Multi-AI Consensus" icon="🤖" delay="0.9s">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                                { l: 'AI Model 1', v: result.aiConsensus.geminiVerdict },
                                null,
                                { l: 'AI Model 2', v: result.aiConsensus.secondaryVerdict },
                            ].map((item, i) => {
                                if (i === 1) return (
                                    <div key="ag" className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                                        <div className="stat-label mb-1">Agreement</div>
                                        <div className="font-mono text-xl font-bold text-accent">{result.aiConsensus!.agreementScore}%</div>
                                    </div>
                                );
                                const s = SIGNAL[item!.v as keyof typeof SIGNAL] || SIGNAL.neutral;
                                return (
                                    <div key={i} className={`rounded-xl border ${s.border} ${s.bg} p-3 text-center`}>
                                        <div className="stat-label mb-1">{item!.l}</div>
                                        <div className={`font-display text-base font-bold uppercase ${s.color}`}>{item!.v}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-base text-white/70 leading-relaxed mb-2">{result.aiConsensus.consensusSummary}</p>
                        {result.aiConsensus.divergences.length > 0 && (
                            <div className="space-y-1">
                                <span className="stat-label text-gold/60">Divergences</span>
                                {result.aiConsensus.divergences.map((d, i) => <div key={i} className="rounded-lg bg-gold/5 border border-gold/10 px-3 py-1.5 text-base text-white/70">{d}</div>)}
                            </div>
                        )}
                    </SectionCard>
                </div>
            )}

            {/* Full Report */}
            <div className="mb-5">
                <SectionCard title="Full Analysis Report" icon="📝" delay="0.95s">
                    <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed">
                        {result.report.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="font-display text-xl font-bold text-white mt-6 mb-2">{line.slice(2)}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="font-display text-base font-semibold text-white/80 mt-4 mb-1.5">{line.slice(3)}</h2>;
                            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white/90 mt-3 mb-1">{line.slice(2, -2)}</p>;
                            if (line.startsWith('---')) return <hr key={i} className="border-white/[0.06] my-4" />;
                            if (line.trim() === '') return <br key={i} />;
                            return <p key={i} className="mb-2">{line}</p>;
                        })}
                    </div>
                </SectionCard>
            </div>

            {/* Audit */}
            {result.audit && (
                <div className="mb-5">
                    <SectionCard title="Fact Audit" icon="✅" delay="1s">
                        <div className="mb-3 flex gap-2">
                            <span className="badge-success">✓ {result.audit.groundedCount} Grounded</span>
                            <span className="badge-warning">~ {result.audit.speculativeCount} Speculative</span>
                            <span className="badge-danger">✗ {result.audit.unverifiableCount} Unverifiable</span>
                        </div>
                        <div className="space-y-1.5">
                            {result.audit.claims.map((c, i) => (
                                <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <span className={`mt-0.5 flex-shrink-0 text-base ${c.status === 'grounded' ? 'text-emerald' : c.status === 'speculative' ? 'text-gold' : 'text-rose'}`}>
                                        {c.status === 'grounded' ? '✓' : c.status === 'speculative' ? '~' : '✗'}
                                    </span>
                                    <div>
                                        <p className="text-base text-white/70">{c.claim}</p>
                                        <p className="text-base text-white/15">Source: {c.source}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mb-8 rounded-2xl border border-gold/10 bg-gold/[0.02] p-4 text-center">
                <p className="text-xs text-gold/50">{result.disclaimer}</p>
            </div>
        </div>
    );
}
