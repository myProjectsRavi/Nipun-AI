import { useStore } from './store';
import KeyVault from './components/KeyVault';
import AnalysisForm from './components/AnalysisForm';
import ReportViewer from './components/ReportViewer';

const FEATURES = [
    { icon: '📊', title: 'Technical Analysis', desc: 'RSI, MACD, SMA with plain-English verdicts' },
    { icon: '🏦', title: 'Insider Trading', desc: 'Real-time buy/sell activity of executives' },
    { icon: '📈', title: 'Earnings History', desc: 'Beat/miss streak + next earnings date' },
    { icon: '🏭', title: 'Peer Comparison', desc: 'Side-by-side vs industry competitors' },
    { icon: '📄', title: 'SEC Filings', desc: 'Direct links to 10-K, 10-Q, 8-K filings' },
    { icon: '🤖', title: 'AI Consensus', desc: 'Multi-model agreement score' },
    { icon: '💰', title: 'Investment Score', desc: 'Combined 0–100 buy/sell signal' },
    { icon: '🛡️', title: 'Financial Health', desc: 'Piotroski & Altman Z-Score analysis' },
];

export default function App() {
    const { view, setView, demoMode, keys, clearResult } = useStore();

    const handleLogoClick = () => {
        clearResult();
        setView('setup');
    };

    const handleSettingsClick = () => {
        clearResult();
        setView('setup');
    };

    return (
        <div className="min-h-screen bg-premium bg-mesh">
            {/* ── Navigation ──────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 border-b border-white/[0.05]" style={{ background: 'rgba(12, 18, 34, 0.85)', backdropFilter: 'blur(20px)' }}>
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <button onClick={handleLogoClick} className="flex items-center gap-2.5 group" id="logo-btn">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                            ⚡
                        </div>
                        <div className="font-display">
                            <span className="text-base font-bold text-white">Nipun</span>
                            <span className="ml-1 text-base font-bold text-gradient">AI</span>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        {(keys || demoMode) && view !== 'setup' && (
                            <div className="hidden items-center gap-2 sm:flex">
                                {demoMode ? (
                                    <span className="badge-accent text-[10px]">DEMO</span>
                                ) : (
                                    <span className="badge-success text-[10px]">LIVE</span>
                                )}
                            </div>
                        )}

                        {view !== 'setup' && (
                            <button
                                onClick={handleSettingsClick}
                                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/60 transition-all duration-300 hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
                                id="settings-btn"
                                title="Manage API Keys"
                            >
                                🔑 Manage Keys
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Main Content ────────────────────────────────────── */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {/* Hero — only on setup */}
                {view === 'setup' && (
                    <div className="mb-12 animate-fade-in">
                        {/* Hero Text */}
                        <div className="text-center mb-10">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                                <span className="text-xs font-semibold text-accent/90">Premium Financial Intelligence — Completely Free</span>
                            </div>
                            <h1 className="mb-4 font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-tight">
                                <span className="text-gradient">Nipun</span>{' '}
                                <span className="text-white">AI</span>
                            </h1>
                            <p className="mx-auto max-w-lg text-base text-muted leading-relaxed">
                                Get the stock analysis that Bloomberg charges $200/month for.
                                20+ data dimensions, multi-AI consensus, technical signals — all free.
                            </p>
                        </div>

                        {/* What Makes Us Different */}
                        <div className="mb-10 glass-card p-6">
                            <h3 className="mb-1 text-center text-xs font-bold uppercase tracking-widest text-accent/70">
                                What You Get That Others Don't
                            </h3>
                            <p className="mb-5 text-center text-[11px] text-muted">
                                Features not available on Screener.in, Perplexity, or free tools
                            </p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {FEATURES.map((f) => (
                                    <div key={f.title} className="group rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center transition-all duration-300 hover:border-accent/15 hover:bg-accent/[0.03]">
                                        <div className="mb-1.5 text-xl transition-transform duration-300 group-hover:scale-110">{f.icon}</div>
                                        <div className="text-xs font-semibold text-white/80 mb-0.5">{f.title}</div>
                                        <div className="text-[10px] text-muted leading-tight">{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* View Router */}
                {view === 'setup' && <KeyVault />}
                {view === 'analysis' && <AnalysisForm />}
                {view === 'report' && <ReportViewer />}
            </main>

            {/* ── Footer ──────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.04]" style={{ background: 'rgba(12, 18, 34, 0.6)' }}>
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/25 font-display">⚡ Nipun AI</span>
                            <span className="text-xs text-white/10">v2.0</span>
                        </div>

                        <div className="rounded-xl border border-warning/10 bg-warning/[0.03] px-4 py-2">
                            <p className="text-center text-[10px] text-warning/50">
                                ⚠️ Not financial advice. Educational and informational purposes only.
                            </p>
                        </div>

                        <span className="text-[10px] text-white/10">
                            AI-powered analysis engine
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
