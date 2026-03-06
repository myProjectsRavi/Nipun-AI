/**
 * ─── Market Data Cards ────────────────────────────────────────────
 * Revenue Breakdown, Momentum, Competitive Moat, Risk-Reward,
 * Value/Growth, Dividend Analysis, Financial Metrics Row
 */
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import type { AnalysisResponse } from '../../store';
import { SectionCard, ScoreBar, formatN, safe, REVENUE_COLORS } from './shared';

export function MarketDataCards({ result }: { result: AnalysisResponse }) {
    return (
        <>
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
        </>
    );
}
