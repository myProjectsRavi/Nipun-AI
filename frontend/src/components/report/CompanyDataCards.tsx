/**
 * ─── Company Data Cards ───────────────────────────────────────────
 * Peers, SEC Filings, Catalysts, Analyst Consensus, Price Targets,
 * Valuation Models, Institutional Ownership, SWOT, Investment Thesis,
 * News Headlines, Extended Technicals
 */
import type { AnalysisResponse } from '../../store';
import { SectionCard, formatN, safe } from './shared';

export function CompanyDataCards({ result }: { result: AnalysisResponse }) {
    return (
        <>
            {/* ══════════ Peers ══════════ */}
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

            {/* SEC Filings + Catalysts */}
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

                {result.catalysts.length > 0 && (
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
                )}
            </div>

            {/* ══════════ Analyst Consensus + Price Targets ══════════ */}
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

            {/* ══════════ Valuation Models + Institutional Ownership ══════════ */}
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

            {/* ══════════ SWOT + Investment Thesis ══════════ */}
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

            {/* ══════════ Extended Technicals ══════════ */}
            {result.extendedTechnicals && (
                <div className="mb-5">
                    <SectionCard title="Advanced Technical Indicators" icon="📐" delay="0.88s" premium>
                        <div className="grid gap-3 sm:grid-cols-3 mb-3">
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

            {/* ══════════ News Headlines ══════════ */}
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
        </>
    );
}
