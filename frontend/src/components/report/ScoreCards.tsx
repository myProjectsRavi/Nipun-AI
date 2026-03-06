/**
 * ─── Score Cards: Nipun Score™ + Investment Score ──────────────────
 */
import type { AnalysisResponse } from '../../store';
import { SectionCard, ScoreBar, GRADE_COLORS, safe } from './shared';

export function ScoreCards({ result }: { result: AnalysisResponse }) {
    return (
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
    );
}
