import { useStore } from '../store';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import PDFExport from './PDFExport';

const SEVERITY_COLORS = {
    high: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger' },
    medium: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning' },
    low: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', dot: 'bg-success' },
};

const SENTIMENT_COLORS = ['#10B981', '#EF4444', '#6B7280'];

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

            {/* Catalysts */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
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

            {/* Full Report */}
            <div className="mb-6 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
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
                        <span className="text-base">✅</span> Fact Audit (Cohere RAG)
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
