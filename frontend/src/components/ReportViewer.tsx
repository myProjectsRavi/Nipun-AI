import { useStore } from '../store';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import PDFExport from './PDFExport';

const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    high: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger' },
    medium: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning' },
    low: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', dot: 'bg-success' },
};

const SENTIMENT_COLORS = ['#34D399', '#F87171', '#94A3B8'];

const SIGNAL_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    bullish: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: '🟢' },
    bearish: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: '🔴' },
    neutral: { color: 'text-muted', bg: 'bg-white/5', border: 'border-white/10', icon: '⚪' },
};

const SCORE_SIGNAL_COLORS: Record<string, string> = {
    'Strong Buy': 'text-success',
    'Buy': 'text-emerald-light',
    'Hold': 'text-warning',
    'Sell': 'text-danger',
    'Strong Sell': 'text-danger',
};

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted">{label}</span>
                <span className="font-mono text-xs font-bold text-white/70">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

export default function ReportViewer() {
    const { result, clearResult, setView } = useStore();

    if (!result) return null;

    const sentimentData = [
        { name: 'Bullish', value: result.sentiment.bullishPercent },
        { name: 'Bearish', value: result.sentiment.bearishPercent },
        { name: 'Neutral', value: result.sentiment.neutralPercent },
    ];

    const handleNewAnalysis = () => {
        clearResult();
        setView('analysis');
    };

    return (
        <div className="mx-auto max-w-6xl animate-fade-in">
            {/* Header Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={handleNewAnalysis} className="btn-secondary text-sm" id="new-analysis-btn">
                        ← New Analysis
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-2xl font-bold text-white">{result.ticker}</h1>
                            {result.financials.companyName && result.financials.companyName !== result.ticker && (
                                <span className="text-sm text-muted">{result.financials.companyName}</span>
                            )}
                            {result.isDemo && <span className="badge-accent">DEMO</span>}
                        </div>
                        <p className="text-xs text-white/25">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PDFExport />
                </div>
            </div>

            {/* ═══ HERO: Investment Score + Financial Health ═══ */}
            {(result.investmentScore || result.financialHealth) && (
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    {/* Investment Score */}
                    {result.investmentScore && (
                        <div className="glass-card p-6 animate-slide-up">
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                                <span className="text-base">💰</span> Investment Score
                            </h3>
                            <div className="flex items-center gap-6 mb-4">
                                <div className="relative flex-shrink-0">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent/20 bg-accent/5">
                                        <div className="text-center">
                                            <div className="font-mono text-3xl font-extrabold text-accent">{result.investmentScore.overall}</div>
                                            <div className="text-[9px] text-muted">/ 100</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className={`text-xl font-bold mb-1 ${SCORE_SIGNAL_COLORS[result.investmentScore.signal] || 'text-white'}`}>
                                        {result.investmentScore.signal}
                                    </div>
                                    <p className="text-[11px] text-muted leading-relaxed">{result.investmentScore.summary}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <ScoreBar label="Fundamentals" value={result.investmentScore.breakdown.fundamentalScore} color="bg-accent" />
                                <ScoreBar label="Technicals" value={result.investmentScore.breakdown.technicalScore} color="bg-cyan" />
                                <ScoreBar label="Sentiment" value={result.investmentScore.breakdown.sentimentScore} color="bg-success" />
                                <ScoreBar label="Risk (lower = riskier)" value={result.investmentScore.breakdown.riskScore} color="bg-warning" />
                                <ScoreBar label="Insider Activity" value={result.investmentScore.breakdown.insiderScore} color="bg-danger" />
                            </div>
                        </div>
                    )}

                    {/* Financial Health */}
                    {result.financialHealth && (
                        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                                <span className="text-base">🛡️</span> Financial Health
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Altman Z-Score */}
                                <div className={`rounded-xl border p-3 text-center ${result.financialHealth.altmanZone === 'safe' ? 'border-success/20 bg-success/5' :
                                        result.financialHealth.altmanZone === 'grey' ? 'border-warning/20 bg-warning/5' :
                                            'border-danger/20 bg-danger/5'
                                    }`}>
                                    <div className="text-[10px] text-muted mb-0.5">Altman Z-Score</div>
                                    <div className="font-mono text-2xl font-bold text-white">{result.financialHealth.altmanZScore.toFixed(2)}</div>
                                    <div className={`text-[10px] font-semibold uppercase ${result.financialHealth.altmanZone === 'safe' ? 'text-success' :
                                            result.financialHealth.altmanZone === 'grey' ? 'text-warning' : 'text-danger'
                                        }`}>
                                        {result.financialHealth.altmanZone === 'safe' ? '✓ Safe Zone' :
                                            result.financialHealth.altmanZone === 'grey' ? '~ Grey Zone' : '✗ Distress'}
                                    </div>
                                </div>

                                {/* Piotroski F-Score */}
                                <div className={`rounded-xl border p-3 text-center ${result.financialHealth.piotroskiRating === 'strong' ? 'border-success/20 bg-success/5' :
                                        result.financialHealth.piotroskiRating === 'moderate' ? 'border-warning/20 bg-warning/5' :
                                            'border-danger/20 bg-danger/5'
                                    }`}>
                                    <div className="text-[10px] text-muted mb-0.5">Piotroski F-Score</div>
                                    <div className="font-mono text-2xl font-bold text-white">{result.financialHealth.piotroskiFScore}<span className="text-sm text-muted">/9</span></div>
                                    <div className={`text-[10px] font-semibold uppercase ${result.financialHealth.piotroskiRating === 'strong' ? 'text-success' :
                                            result.financialHealth.piotroskiRating === 'moderate' ? 'text-warning' : 'text-danger'
                                        }`}>
                                        {result.financialHealth.piotroskiRating}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {[
                                    { label: 'Current Ratio', value: result.financialHealth.currentRatio.toFixed(2) },
                                    { label: 'Quick Ratio', value: result.financialHealth.quickRatio.toFixed(2) },
                                    { label: 'Interest Coverage', value: `${result.financialHealth.interestCoverage.toFixed(1)}x` },
                                ].map((m) => (
                                    <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-2 text-center">
                                        <div className="text-[9px] text-muted">{m.label}</div>
                                        <div className="font-mono text-sm font-bold text-white/80">{m.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Position */}
                            <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-muted">52-Week Range Position</span>
                                    <span className="font-mono text-xs text-white/70">{result.financialHealth.pricePositionPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                                    <div className="h-full rounded-full bg-gradient-to-r from-danger via-warning to-success" style={{ width: `${result.financialHealth.pricePositionPercent}%` }} />
                                </div>
                                <div className="flex justify-between mt-0.5">
                                    <span className="text-[8px] text-muted">52W Low</span>
                                    <span className="text-[8px] text-muted">52W High</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-muted leading-relaxed">{result.financialHealth.healthSummary}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Financial Overview Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {[
                    { label: 'Price', value: `$${result.financials.price.toFixed(2)}`, accent: true },
                    {
                        label: 'Change',
                        value: `${result.financials.change > 0 ? '+' : ''}${result.financials.change.toFixed(2)} (${result.financials.changePercent > 0 ? '+' : ''}${result.financials.changePercent.toFixed(2)}%)`,
                        color: result.financials.change >= 0 ? 'text-success' : 'text-danger',
                    },
                    { label: 'P/E Ratio', value: result.financials.pe.toFixed(2) },
                    { label: 'EPS', value: `$${result.financials.eps.toFixed(2)}` },
                    { label: 'Market Cap', value: formatLargeNumber(result.financials.marketCap) },
                    { label: 'Beta', value: result.financials.beta.toFixed(2) },
                ].map((item) => (
                    <div key={item.label} className="glass-card p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{item.label}</div>
                        <div className={`mt-1 font-mono text-lg font-bold ${item.color || (item.accent ? 'text-accent' : 'text-white')}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Financial Data */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                    <span className="text-base">📊</span> Financial Metrics
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                    {[
                        { label: 'Open', value: `$${result.financials.open.toFixed(2)}` },
                        { label: 'High', value: `$${result.financials.high.toFixed(2)}` },
                        { label: 'Low', value: `$${result.financials.low.toFixed(2)}` },
                        { label: 'Prev Close', value: `$${result.financials.previousClose.toFixed(2)}` },
                        { label: '52W High', value: `$${result.financials.weekHigh52.toFixed(2)}` },
                        { label: '52W Low', value: `$${result.financials.weekLow52.toFixed(2)}` },
                        { label: 'Revenue', value: formatLargeNumber(result.financials.revenue) },
                        { label: 'Gross Margin', value: `${result.financials.grossMargin.toFixed(2)}%` },
                        { label: 'Debt/Equity', value: result.financials.debtToEquity.toFixed(2) },
                        { label: 'Div Yield', value: `${result.financials.dividendYield.toFixed(2)}%` },
                        { label: 'Volume', value: formatLargeNumber(result.financials.volume) },
                        { label: 'Sector', value: result.financials.sector },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                            <span className="text-xs text-muted">{item.label}</span>
                            <span className="font-mono text-sm text-white/80">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technical Analysis */}
            {result.technicals && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <span className="text-base">📈</span> Technical Analysis
                        </h3>
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${SIGNAL_STYLES[result.technicals.overallSignal].bg} ${SIGNAL_STYLES[result.technicals.overallSignal].border} border ${SIGNAL_STYLES[result.technicals.overallSignal].color}`}>
                            {SIGNAL_STYLES[result.technicals.overallSignal].icon} {result.technicals.overallSignal.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {[result.technicals.rsi, result.technicals.macd, result.technicals.sma50, result.technicals.sma200].map((signal) => {
                            const style = SIGNAL_STYLES[signal.signal];
                            return (
                                <div key={signal.name} className={`rounded-xl border ${style.border} ${style.bg} p-3`}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-white/70">{signal.name}</span>
                                        <span className={`font-mono text-sm font-bold ${style.color}`}>{signal.value}</span>
                                    </div>
                                    <p className="text-[11px] text-muted leading-relaxed">{signal.interpretation}</p>
                                </div>
                            );
                        })}
                    </div>

                    {result.technicals.goldenDeathCross && (
                        <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                            <span className="text-xs font-medium text-accent">{result.technicals.goldenDeathCross}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Sentiment + Risk Row */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">💬</span> Social Sentiment
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="h-32 w-32 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                        {sentimentData.map((_entry, index) => (
                                            <Cell key={index} fill={SENTIMENT_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                        formatter={(value: number) => `${value}%`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            {[
                                { label: 'Bullish', value: result.sentiment.bullishPercent, color: 'bg-success', textColor: 'text-success' },
                                { label: 'Bearish', value: result.sentiment.bearishPercent, color: 'bg-danger', textColor: 'text-danger' },
                                { label: 'Neutral', value: result.sentiment.neutralPercent, color: 'bg-muted', textColor: 'text-muted' },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                                        <span className="text-sm text-white/60">{s.label}</span>
                                    </div>
                                    <span className={`font-mono text-sm font-bold ${s.textColor}`}>{s.value}%</span>
                                </div>
                            ))}
                            <div className="pt-2 text-[10px] text-white/20">{result.sentiment.totalPosts} posts analyzed</div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {result.sentiment.themes.map((theme) => (
                            <span key={theme} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-muted border border-white/[0.06]">{theme}</span>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">⚠️</span> Risk Factors
                    </h3>
                    <div className="space-y-3">
                        {result.risks.map((risk, i) => {
                            const colors = SEVERITY_COLORS[risk.severity];
                            return (
                                <div key={i} className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                        <span className={`text-xs font-semibold uppercase ${colors.text}`}>{risk.severity} — {risk.category}</span>
                                    </div>
                                    <p className="text-xs text-muted leading-relaxed">{risk.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Insider + Earnings Row */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {result.insiderActivity && (
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                                <span className="text-base">🏦</span> Insider Activity
                            </h3>
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${SIGNAL_STYLES[result.insiderActivity.netSentiment].bg} ${SIGNAL_STYLES[result.insiderActivity.netSentiment].border} border ${SIGNAL_STYLES[result.insiderActivity.netSentiment].color}`}>
                                NET: {result.insiderActivity.netSentiment.toUpperCase()}
                            </div>
                        </div>
                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-success/5 border border-success/10 p-2 text-center">
                                <div className="text-[10px] text-success/60">Total Buys</div>
                                <div className="font-mono text-sm font-bold text-success">{formatLargeNumber(result.insiderActivity.totalBuyValue)}</div>
                            </div>
                            <div className="rounded-xl bg-danger/5 border border-danger/10 p-2 text-center">
                                <div className="text-[10px] text-danger/60">Total Sells</div>
                                <div className="font-mono text-sm font-bold text-danger">{formatLargeNumber(result.insiderActivity.totalSellValue)}</div>
                            </div>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {result.insiderActivity.trades.map((trade, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs text-white/60 block truncate">{trade.name}</span>
                                        <span className="text-[10px] text-white/25">{trade.role} · {trade.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <span className={`text-xs font-semibold ${trade.transactionType === 'buy' ? 'text-success' : trade.transactionType === 'sell' ? 'text-danger' : 'text-muted'}`}>
                                            {trade.transactionType.toUpperCase()}
                                        </span>
                                        <span className="block text-[10px] text-white/30 font-mono">{formatLargeNumber(trade.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-[10px] text-white/20">{result.insiderActivity.summary}</p>
                    </div>
                )}

                {result.earnings && (
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                                <span className="text-base">📅</span> Earnings History
                            </h3>
                            {result.earnings.nextEarningsDate && (
                                <span className="text-[10px] text-accent font-medium">Next: {result.earnings.nextEarningsDate}</span>
                            )}
                        </div>
                        <div className="mb-3 text-center">
                            <span className="text-sm font-medium text-white/70">{result.earnings.streak}</span>
                        </div>
                        {result.earnings.surprises.length > 0 && (
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.earnings.surprises.slice().reverse()} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="quarter" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                        <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'estimateEps' ? 'Estimate' : 'Actual']}
                                        />
                                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                        <Bar dataKey="estimateEps" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Estimate" />
                                        <Bar dataKey="actualEps" fill="#6366F1" radius={[4, 4, 0, 0]} name="Actual" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                        <div className="mt-2 grid grid-cols-2 gap-1">
                            {result.earnings.surprises.slice(0, 4).map((s, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2 py-1">
                                    <span className="text-[10px] text-muted">{s.quarter}</span>
                                    <span className={`text-[10px] font-mono font-bold ${s.beat ? 'text-success' : 'text-danger'}`}>
                                        {s.beat ? '✓ Beat' : '✗ Miss'} {s.surprisePercent > 0 ? '+' : ''}{s.surprisePercent.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Peer Comparison */}
            {result.peerComparison && result.peerComparison.peers.length > 0 && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">🏭</span> Peer Comparison
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {['Ticker', 'Price', 'Mkt Cap', 'P/E', 'EPS', 'Change'].map((h) => (
                                        <th key={h} className={`py-2 text-[10px] font-semibold uppercase tracking-wider text-muted ${h === 'Ticker' ? 'text-left' : 'text-right'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-accent/10 bg-accent/5">
                                    <td className="py-2 font-mono font-bold text-accent">{result.ticker}</td>
                                    <td className="py-2 text-right font-mono text-white/80">${result.financials.price.toFixed(2)}</td>
                                    <td className="py-2 text-right font-mono text-white/80">{formatLargeNumber(result.financials.marketCap)}</td>
                                    <td className="py-2 text-right font-mono text-white/80">{result.financials.pe.toFixed(1)}</td>
                                    <td className="py-2 text-right font-mono text-white/80">${result.financials.eps.toFixed(2)}</td>
                                    <td className={`py-2 text-right font-mono font-semibold ${result.financials.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {result.financials.changePercent > 0 ? '+' : ''}{result.financials.changePercent.toFixed(2)}%
                                    </td>
                                </tr>
                                {result.peerComparison.peers.map((peer) => (
                                    <tr key={peer.ticker} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="py-2 font-mono text-white/60">{peer.ticker}</td>
                                        <td className="py-2 text-right font-mono text-white/50">${peer.price.toFixed(2)}</td>
                                        <td className="py-2 text-right font-mono text-white/50">{formatLargeNumber(peer.marketCap)}</td>
                                        <td className="py-2 text-right font-mono text-white/50">{peer.pe > 0 ? peer.pe.toFixed(1) : 'N/A'}</td>
                                        <td className="py-2 text-right font-mono text-white/50">${peer.eps.toFixed(2)}</td>
                                        <td className={`py-2 text-right font-mono ${peer.change >= 0 ? 'text-success/60' : 'text-danger/60'}`}>
                                            {peer.change > 0 ? '+' : ''}{peer.change.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-3 text-[10px] text-white/25">{result.peerComparison.relativeValuation}</p>
                </div>
            )}

            {/* SEC Filings */}
            {result.secFilings && result.secFilings.length > 0 && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">📄</span> SEC Filings
                    </h3>
                    <div className="space-y-2">
                        {result.secFilings.map((filing, i) => (
                            <a key={i} href={filing.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 hover:bg-white/[0.05] hover:border-accent/20 transition-all group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex-shrink-0 rounded-lg bg-accent/10 px-2 py-0.5 font-mono text-xs font-bold text-accent">{filing.type}</span>
                                    <span className="text-xs text-muted truncate">{filing.description}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <span className="text-[10px] text-white/25">{filing.dateFiled}</span>
                                    <span className="text-white/20 group-hover:text-accent transition-colors">→</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Catalysts */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.45s' }}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                    <span className="text-base">🚀</span> Catalysts
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {result.catalysts.map((catalyst, i) => (
                        <div key={i} className="rounded-xl border border-success/10 bg-success/[0.03] p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="badge-success">{catalyst.timeline}</span>
                                <span className="text-xs text-success/60 capitalize">{catalyst.impact}</span>
                            </div>
                            <p className="text-xs text-muted leading-relaxed">{catalyst.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Consensus */}
            {result.aiConsensus && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">🤖</span> Multi-AI Consensus
                    </h3>
                    <div className="mb-4 grid grid-cols-3 gap-3">
                        {[
                            { label: 'AI Model 1', verdict: result.aiConsensus.geminiVerdict },
                            null,
                            { label: 'AI Model 2', verdict: result.aiConsensus.secondaryVerdict },
                        ].map((item, i) => {
                            if (i === 1) {
                                return (
                                    <div key="score" className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-center">
                                        <div className="text-[10px] text-muted mb-1">Agreement</div>
                                        <div className="font-mono text-2xl font-bold text-accent">{result.aiConsensus!.agreementScore}%</div>
                                    </div>
                                );
                            }
                            const verdict = item!.verdict;
                            const style = SIGNAL_STYLES[verdict] || SIGNAL_STYLES.neutral;
                            return (
                                <div key={i} className={`rounded-xl border ${style.border} ${style.bg} p-3 text-center`}>
                                    <div className="text-[10px] text-muted mb-1">{item!.label}</div>
                                    <div className={`text-sm font-bold uppercase ${style.color}`}>{verdict}</div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mb-3 text-xs text-muted leading-relaxed">{result.aiConsensus.consensusSummary}</p>
                    {result.aiConsensus.divergences.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-warning/60">Key Divergences</span>
                            {result.aiConsensus.divergences.map((d, i) => (
                                <div key={i} className="rounded-lg bg-warning/5 border border-warning/10 px-3 py-2 text-[11px] text-muted">{d}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Full Report */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.55s' }}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                    <span className="text-base">📝</span> Full Analysis Report
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-muted leading-relaxed">
                    {result.report.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="font-display text-xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="font-display text-lg font-semibold text-white/90 mt-5 mb-2">{line.slice(3)}</h2>;
                        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white/70 mt-3 mb-1">{line.slice(2, -2)}</p>;
                        if (line.startsWith('---')) return <hr key={i} className="border-white/[0.06] my-4" />;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="mb-2">{line}</p>;
                    })}
                </div>
            </div>

            {/* Fact Audit */}
            {result.audit && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                        <span className="text-base">✅</span> Fact Audit
                    </h3>
                    <div className="mb-4 flex gap-3">
                        <span className="badge-success">✓ {result.audit.groundedCount} Grounded</span>
                        <span className="badge-warning">~ {result.audit.speculativeCount} Speculative</span>
                        <span className="badge-danger">✗ {result.audit.unverifiableCount} Unverifiable</span>
                    </div>
                    <div className="space-y-2">
                        {result.audit.claims.map((claim, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                                <span className={`mt-0.5 flex-shrink-0 ${claim.status === 'grounded' ? 'text-success' : claim.status === 'speculative' ? 'text-warning' : 'text-danger'}`}>
                                    {claim.status === 'grounded' ? '✓' : claim.status === 'speculative' ? '~' : '✗'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted">{claim.claim}</p>
                                    <p className="mt-0.5 text-[10px] text-white/20">Source: {claim.source}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mb-8 rounded-2xl border border-warning/10 bg-warning/[0.03] p-4 text-center">
                <p className="text-xs text-warning/60">{result.disclaimer}</p>
            </div>
        </div>
    );
}

function formatLargeNumber(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(2);
}
