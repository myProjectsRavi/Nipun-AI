import { useStore } from '../store';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import PDFExport from './PDFExport';

const SEVERITY_COLORS = {
    high: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger' },
    medium: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning' },
    low: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', dot: 'bg-success' },
};

const SENTIMENT_COLORS = ['#10B981', '#EF4444', '#6B7280'];

const SIGNAL_STYLES = {
    bullish: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: '🟢' },
    bearish: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: '🔴' },
    neutral: { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10', icon: '⚪' },
};

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
                            <h1 className="text-2xl font-bold text-white font-mono">{result.ticker}</h1>
                            {result.financials.companyName && result.financials.companyName !== result.ticker && (
                                <span className="text-sm text-white/40">{result.financials.companyName}</span>
                            )}
                            {result.isDemo && <span className="badge-accent">DEMO</span>}
                        </div>
                        <p className="text-xs text-white/30">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PDFExport />
                </div>
            </div>

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
                        <div className="text-[10px] font-medium uppercase tracking-wider text-white/30">{item.label}</div>
                        <div className={`mt-1 font-mono text-lg font-bold ${item.color || (item.accent ? 'text-accent' : 'text-white')}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Financial Data */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
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
                            <span className="text-xs text-white/30">{item.label}</span>
                            <span className="font-mono text-sm text-white/80">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════ NEW: Technical Analysis ═══════════════════ */}
            {result.technicals && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                            <span className="text-base">📈</span> Technical Analysis
                        </h3>
                        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${SIGNAL_STYLES[result.technicals.overallSignal].bg} ${SIGNAL_STYLES[result.technicals.overallSignal].border} border ${SIGNAL_STYLES[result.technicals.overallSignal].color}`}>
                            {SIGNAL_STYLES[result.technicals.overallSignal].icon} OVERALL: {result.technicals.overallSignal.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {[result.technicals.rsi, result.technicals.macd, result.technicals.sma50, result.technicals.sma200].map((signal) => {
                            const style = SIGNAL_STYLES[signal.signal];
                            return (
                                <div key={signal.name} className={`rounded-lg border ${style.border} ${style.bg} p-3`}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-white/70">{signal.name}</span>
                                        <span className={`font-mono text-sm font-bold ${style.color}`}>
                                            {signal.value}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-relaxed">{signal.interpretation}</p>
                                </div>
                            );
                        })}
                    </div>

                    {result.technicals.goldenDeathCross && (
                        <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-center">
                            <span className="text-xs font-medium text-accent">{result.technicals.goldenDeathCross}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Sentiment + Risk Row */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {/* Sentiment Analysis */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">💬</span> Social Sentiment
                    </h3>
                    <div className="flex items-center gap-6">
                        <div className="h-32 w-32 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={35}
                                        outerRadius={55}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {sentimentData.map((_entry, index) => (
                                            <Cell key={index} fill={SENTIMENT_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1C1C2E',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                        }}
                                        formatter={(value: number) => `${value}%`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-success" />
                                    <span className="text-sm text-white/60">Bullish</span>
                                </div>
                                <span className="font-mono text-sm font-bold text-success">{result.sentiment.bullishPercent}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-danger" />
                                    <span className="text-sm text-white/60">Bearish</span>
                                </div>
                                <span className="font-mono text-sm font-bold text-danger">{result.sentiment.bearishPercent}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                                    <span className="text-sm text-white/60">Neutral</span>
                                </div>
                                <span className="font-mono text-sm font-bold text-muted">{result.sentiment.neutralPercent}%</span>
                            </div>
                            <div className="pt-2 text-[10px] text-white/20">
                                {result.sentiment.totalPosts} posts analyzed
                            </div>
                        </div>
                    </div>

                    {/* Themes */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {result.sentiment.themes.map((theme) => (
                            <span key={theme} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/40 border border-white/[0.06]">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Risk Factors */}
                <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">⚠️</span> Risk Factors
                    </h3>
                    <div className="space-y-3">
                        {result.risks.map((risk, i) => {
                            const colors = SEVERITY_COLORS[risk.severity];
                            return (
                                <div key={i} className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                        <span className={`text-xs font-semibold uppercase ${colors.text}`}>
                                            {risk.severity} — {risk.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed">{risk.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ═══════════════════ NEW: Insider Activity + Earnings Row ═══════════════════ */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {/* Insider Trading */}
                {result.insiderActivity && (
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                                <span className="text-base">🏦</span> Insider Activity
                            </h3>
                            <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${SIGNAL_STYLES[result.insiderActivity.netSentiment].bg} ${SIGNAL_STYLES[result.insiderActivity.netSentiment].border} border ${SIGNAL_STYLES[result.insiderActivity.netSentiment].color}`}>
                                NET: {result.insiderActivity.netSentiment.toUpperCase()}
                            </div>
                        </div>

                        <div className="mb-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-success/5 border border-success/10 p-2 text-center">
                                <div className="text-[10px] text-success/60">Total Buys</div>
                                <div className="font-mono text-sm font-bold text-success">{formatLargeNumber(result.insiderActivity.totalBuyValue)}</div>
                            </div>
                            <div className="rounded-lg bg-danger/5 border border-danger/10 p-2 text-center">
                                <div className="text-[10px] text-danger/60">Total Sells</div>
                                <div className="font-mono text-sm font-bold text-danger">{formatLargeNumber(result.insiderActivity.totalSellValue)}</div>
                            </div>
                        </div>

                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {result.insiderActivity.trades.map((trade, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                    <div className="min-w-0 flex-1">
                                        <span className="text-xs text-white/60 block truncate">{trade.name}</span>
                                        <span className="text-[10px] text-white/25">{trade.role} · {trade.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <span className={`text-xs font-semibold ${trade.transactionType === 'buy' ? 'text-success' : trade.transactionType === 'sell' ? 'text-danger' : 'text-white/40'}`}>
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

                {/* Earnings Surprise History */}
                {result.earnings && (
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                                <span className="text-base">📅</span> Earnings History
                            </h3>
                            {result.earnings.nextEarningsDate && (
                                <span className="text-[10px] text-accent font-medium">
                                    Next: {result.earnings.nextEarningsDate}
                                </span>
                            )}
                        </div>

                        <div className="mb-3 text-center">
                            <span className="text-sm font-medium text-white/70">{result.earnings.streak}</span>
                        </div>

                        {/* Earnings surprise chart */}
                        {result.earnings.surprises.length > 0 && (
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.earnings.surprises.slice().reverse()} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="quarter"
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                        />
                                        <YAxis
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                            label={{ value: 'EPS $', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1C1C2E',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                            }}
                                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'estimateEps' ? 'Estimate' : 'Actual']}
                                        />
                                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                                        <Bar dataKey="estimateEps" fill="#6B7280" radius={[2, 2, 0, 0]} name="Estimate" />
                                        <Bar dataKey="actualEps" fill="#0EA5E9" radius={[2, 2, 0, 0]} name="Actual" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="mt-2 grid grid-cols-2 gap-1">
                            {result.earnings.surprises.slice(0, 4).map((s, i) => (
                                <div key={i} className="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1">
                                    <span className="text-[10px] text-white/30">{s.quarter}</span>
                                    <span className={`text-[10px] font-mono font-bold ${s.beat ? 'text-success' : 'text-danger'}`}>
                                        {s.beat ? '✓ Beat' : '✗ Miss'} {s.surprisePercent > 0 ? '+' : ''}{s.surprisePercent.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════════════ NEW: Peer Comparison ═══════════════════ */}
            {result.peerComparison && result.peerComparison.peers.length > 0 && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">🏭</span> Peer Comparison
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="py-2 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Ticker</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">Price</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">Mkt Cap</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">P/E</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">EPS</th>
                                    <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Current stock row */}
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
                                {/* Peer rows */}
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

            {/* ═══════════════════ NEW: SEC Filings ═══════════════════ */}
            {result.secFilings && result.secFilings.length > 0 && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">📄</span> SEC Filings
                    </h3>
                    <div className="space-y-2">
                        {result.secFilings.map((filing, i) => (
                            <a
                                key={i}
                                href={filing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-3 hover:bg-white/[0.05] hover:border-accent/20 transition-all group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex-shrink-0 rounded bg-accent/10 px-2 py-0.5 font-mono text-xs font-bold text-accent">
                                        {filing.type}
                                    </span>
                                    <span className="text-xs text-white/50 truncate">{filing.description}</span>
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
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                    <span className="text-base">🚀</span> Catalysts
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {result.catalysts.map((catalyst, i) => (
                        <div key={i} className="rounded-lg border border-success/10 bg-success/[0.03] p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="badge-success">{catalyst.timeline}</span>
                                <span className="text-xs text-success/60 capitalize">{catalyst.impact}</span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed">{catalyst.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════ NEW: AI Consensus ═══════════════════ */}
            {result.aiConsensus && (
                <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">🤖</span> Multi-AI Consensus
                    </h3>

                    <div className="mb-4 grid grid-cols-3 gap-3">
                        {/* Gemini Verdict */}
                        <div className={`rounded-lg border ${SIGNAL_STYLES[result.aiConsensus.geminiVerdict as keyof typeof SIGNAL_STYLES]?.border || 'border-white/10'} ${SIGNAL_STYLES[result.aiConsensus.geminiVerdict as keyof typeof SIGNAL_STYLES]?.bg || 'bg-white/5'} p-3 text-center`}>
                            <div className="text-[10px] text-white/30 mb-1">AI Model 1</div>
                            <div className={`text-sm font-bold uppercase ${SIGNAL_STYLES[result.aiConsensus.geminiVerdict as keyof typeof SIGNAL_STYLES]?.color || 'text-white/50'}`}>
                                {result.aiConsensus.geminiVerdict}
                            </div>
                        </div>

                        {/* Agreement Score */}
                        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-center">
                            <div className="text-[10px] text-white/30 mb-1">Agreement</div>
                            <div className="font-mono text-2xl font-bold text-accent">{result.aiConsensus.agreementScore}%</div>
                        </div>

                        {/* Cerebras Verdict */}
                        <div className={`rounded-lg border ${SIGNAL_STYLES[result.aiConsensus.secondaryVerdict as keyof typeof SIGNAL_STYLES]?.border || 'border-white/10'} ${SIGNAL_STYLES[result.aiConsensus.secondaryVerdict as keyof typeof SIGNAL_STYLES]?.bg || 'bg-white/5'} p-3 text-center`}>
                            <div className="text-[10px] text-white/30 mb-1">AI Model 2</div>
                            <div className={`text-sm font-bold uppercase ${SIGNAL_STYLES[result.aiConsensus.secondaryVerdict as keyof typeof SIGNAL_STYLES]?.color || 'text-white/50'}`}>
                                {result.aiConsensus.secondaryVerdict}
                            </div>
                        </div>
                    </div>

                    <p className="mb-3 text-xs text-white/50 leading-relaxed">{result.aiConsensus.consensusSummary}</p>

                    {result.aiConsensus.divergences.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-warning/60">Key Divergences</span>
                            {result.aiConsensus.divergences.map((d, i) => (
                                <div key={i} className="rounded bg-warning/5 border border-warning/10 px-3 py-2 text-[11px] text-white/40">
                                    {d}
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="mt-2 text-[9px] text-white/15">Models: Gemini 2.5 Flash + {result.aiConsensus.secondaryModel}</p>
                </div>
            )}

            {/* Full Report */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.55s' }}>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                    <span className="text-base">📝</span> Full Analysis Report
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-white/60 leading-relaxed">
                    {result.report.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white/90 mt-5 mb-2">{line.slice(3)}</h2>;
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
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/50">
                        <span className="text-base">✅</span> Fact Audit
                    </h3>
                    <div className="mb-4 flex gap-3">
                        <span className="badge-success">✓ {result.audit.groundedCount} Grounded</span>
                        <span className="badge-warning">~ {result.audit.speculativeCount} Speculative</span>
                        <span className="badge-danger">✗ {result.audit.unverifiableCount} Unverifiable</span>
                    </div>
                    <div className="space-y-2">
                        {result.audit.claims.map((claim, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3 border border-white/[0.04]">
                                <span className={`mt-0.5 flex-shrink-0 ${claim.status === 'grounded' ? 'text-success' :
                                    claim.status === 'speculative' ? 'text-warning' : 'text-danger'
                                    }`}>
                                    {claim.status === 'grounded' ? '✓' : claim.status === 'speculative' ? '~' : '✗'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/50">{claim.claim}</p>
                                    <p className="mt-0.5 text-[10px] text-white/20">Source: {claim.source}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mb-8 rounded-lg border border-warning/10 bg-warning/[0.03] p-4 text-center">
                <p className="text-xs text-warning/60">{result.disclaimer}</p>
            </div>
        </div>
    );
}

// ─── Helpers ───────────────────────────────────────────────────────
function formatLargeNumber(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(2);
}
