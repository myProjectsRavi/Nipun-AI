/**
 * ─── Bottom Section ───────────────────────────────────────────────
 * AI Consensus, Full Report, Fact Audit, Research Sources, Disclaimer
 */
import type { AnalysisResponse } from '../../store';
import { SectionCard, SIGNAL, RESEARCH_CATEGORIES } from './shared';

export function BottomSection({ result }: { result: AnalysisResponse }) {
    return (
        <>
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

            {/* ══════════ Research Sources (collapsed by default) ══════════ */}
            {result.researchSources && (
                <div className="mb-5">
                    <details className="card overflow-hidden">
                        <summary className="cursor-pointer p-5 font-display text-lg font-bold text-white/90 hover:bg-white/[0.02] transition-colors select-none flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <span className="text-base">📚</span>
                                Additional Research & Primary Sources
                                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent">
                                    {Object.values(result.researchSources).reduce((sum, links) => sum + links.length, 0)} links
                                </span>
                            </span>
                            <span className="text-sm text-white/30 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="border-t border-white/[0.04] p-5 pt-4 space-y-3">
                            <p className="text-xs text-white/40 mb-3">
                                Every number in this report can be verified. Click any link below to view the primary source data.
                            </p>
                            {Object.entries(result.researchSources).map(([category, links]) => {
                                const meta = RESEARCH_CATEGORIES[category as keyof typeof RESEARCH_CATEGORIES];
                                if (!meta || !Array.isArray(links) || links.length === 0) return null;
                                return (
                                    <details key={category} className="rounded-xl border border-white/[0.05] bg-white/[0.01]">
                                        <summary className="cursor-pointer px-4 py-2.5 text-sm font-display font-semibold text-white/80 hover:bg-white/[0.02] transition-colors select-none flex items-center gap-2">
                                            <span>{meta.icon}</span>
                                            {meta.label}
                                            <span className="ml-auto text-xs font-mono text-white/30">{links.length}</span>
                                        </summary>
                                        <div className="border-t border-white/[0.03] px-4 py-2 space-y-1">
                                            {links.map((link: { label: string; url: string }, i: number) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:text-accent hover:bg-accent/5 transition-colors group"
                                                >
                                                    <span className="text-accent/40 group-hover:text-accent flex-shrink-0">→</span>
                                                    <span className="truncate">{link.label}</span>
                                                    <span className="ml-auto text-[10px] text-white/20 group-hover:text-accent/40 flex-shrink-0">↗</span>
                                                </a>
                                            ))}
                                        </div>
                                    </details>
                                );
                            })}
                            <p className="text-[10px] text-white/20 text-center pt-2">
                                Sources auto-generated by Nipun AI — verify all data independently before making investment decisions.
                            </p>
                        </div>
                    </details>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mb-8 rounded-2xl border border-gold/10 bg-gold/[0.02] p-4 text-center">
                <p className="text-xs text-gold/50">{result.disclaimer}</p>
            </div>
        </>
    );
}
