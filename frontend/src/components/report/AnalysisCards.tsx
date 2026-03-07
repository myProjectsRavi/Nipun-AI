/**
 * ─── Analysis Cards ───────────────────────────────────────────────
 * Technical Analysis (basic + extended), Sentiment, Risk Factors,
 * Insider Activity, Earnings History
 */
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import type { AnalysisResponse } from '../../store';
import { SectionCard, SIGNAL, SEVERITY, PIE_COLORS, formatN } from './shared';

export function AnalysisCards({ result }: { result: AnalysisResponse }) {
    const sentimentData = [
        { name: 'Bullish', value: result.sentiment.bullishPercent },
        { name: 'Bearish', value: result.sentiment.bearishPercent },
        { name: 'Neutral', value: result.sentiment.neutralPercent },
    ];
    const hasSentimentData = sentimentData.some(d => d.value > 0);

    return (
        <>
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
                        {hasSentimentData ? (
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
                        ) : (
                            <div className="h-28 w-28 flex-shrink-0 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
                                <span className="text-xs text-white/30 text-center">No data</span>
                            </div>
                        )}
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
        </>
    );
}
