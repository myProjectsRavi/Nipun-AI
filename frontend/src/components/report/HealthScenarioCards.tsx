/**
 * ─── Financial Health + Scenario Analysis Cards ───────────────────
 */
import type { AnalysisResponse } from '../../store';
import { SectionCard, safe } from './shared';

export function HealthScenarioCards({ result }: { result: AnalysisResponse }) {
    return (
        <div className="mb-5 grid gap-4 lg:grid-cols-2">
            {result.financialHealth && (
                <SectionCard title="Financial Health" icon="🛡️" delay="0.1s">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className={`rounded-xl border p-3 text-center ${result.financialHealth.altmanZone === 'safe' ? 'border-emerald/20 bg-emerald/5' : result.financialHealth.altmanZone === 'grey' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                            <div className="stat-label mb-0.5">{result.financialHealth.altmanIsEstimated ? 'Est. Altman Z-Score (simplified)' : 'Altman Z-Score'}</div>
                            <div className="font-mono text-xl font-bold text-white">{safe(result.financialHealth.altmanZScore).toFixed(2)}</div>
                            <div className={`text-base font-semibold uppercase ${result.financialHealth.altmanZone === 'safe' ? 'text-emerald' : result.financialHealth.altmanZone === 'grey' ? 'text-gold' : 'text-rose'}`}>
                                {result.financialHealth.altmanZone === 'safe' ? '✓ Safe' : result.financialHealth.altmanZone === 'grey' ? '~ Grey' : '✗ Distress'}
                            </div>
                        </div>
                        <div className={`rounded-xl border p-3 text-center ${result.financialHealth.piotroskiRating === 'strong' ? 'border-emerald/20 bg-emerald/5' : result.financialHealth.piotroskiRating === 'moderate' ? 'border-gold/20 bg-gold/5' : 'border-rose/20 bg-rose/5'}`}>
                            <div className="stat-label mb-0.5">{result.financialHealth.piotroskiIsEstimated ? 'Est. Piotroski Score (proxy)' : 'Piotroski F-Score'}</div>
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
    );
}
