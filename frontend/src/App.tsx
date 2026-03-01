import { useStore } from './store';
import KeyVault from './components/KeyVault';
import AnalysisForm from './components/AnalysisForm';
import ReportViewer from './components/ReportViewer';

const FEATURES = [
    { icon: '🏆', title: 'Nipun Score™', desc: 'A+ to F letter grade with actionable recommendation', tag: 'EXCLUSIVE' },
    { icon: '🎯', title: 'Scenario Analysis', desc: 'Bull / Base / Bear targets with probabilities', tag: 'EXCLUSIVE' },
    { icon: '🏰', title: 'Competitive Moat', desc: 'AI-assessed moat sources & durability rating', tag: 'EXCLUSIVE' },
    { icon: '📊', title: 'Revenue Breakdown', desc: 'Segment-level revenue with YoY growth rates', tag: 'EXCLUSIVE' },
    { icon: '⚡', title: 'Momentum Score', desc: 'Multi-timeframe performance + relative strength', tag: 'EXCLUSIVE' },
    { icon: '⚖️', title: 'Risk-Reward Ratio', desc: 'Quantified upside vs downside with rating', tag: 'EXCLUSIVE' },
    { icon: '💎', title: 'Value vs Growth', desc: 'Classification with PEG, P/B, P/S metrics', tag: 'EXCLUSIVE' },
    { icon: '💰', title: 'Dividend Deep Dive', desc: 'Safety score, payout ratio, growth streak', tag: 'EXCLUSIVE' },
    { icon: '🧠', title: 'Multi-AI Consensus', desc: 'Cross-model agreement score with divergences', tag: null },
    { icon: '🛡️', title: 'Financial Health', desc: 'Altman Z-Score + Piotroski F-Score analysis', tag: null },
    { icon: '📈', title: 'Technical Analysis', desc: 'RSI, MACD, SMA with plain-English verdicts', tag: null },
    { icon: '🏦', title: 'Insider Activity', desc: 'Real-time executive buy/sell tracking', tag: null },
];

const COMPARISON = [
    { feature: 'Nipun Score™ (A+ to F)', nipun: true, screener: false, perplexity: false },
    { feature: 'Scenario Analysis (Bull/Base/Bear)', nipun: true, screener: false, perplexity: false },
    { feature: 'Competitive Moat Assessment', nipun: true, screener: false, perplexity: false },
    { feature: 'Revenue Segment Breakdown', nipun: true, screener: true, perplexity: false },
    { feature: 'Momentum Score', nipun: true, screener: false, perplexity: false },
    { feature: 'Risk-Reward Ratio', nipun: true, screener: false, perplexity: false },
    { feature: 'Multi-AI Consensus', nipun: true, screener: false, perplexity: false },
    { feature: 'Altman Z-Score + Piotroski', nipun: true, screener: false, perplexity: false },
    { feature: 'Insider Trading Activity', nipun: true, screener: true, perplexity: false },
    { feature: 'SEC Filing Links', nipun: true, screener: true, perplexity: false },
    { feature: 'Fact Audit (Grounded/Speculative)', nipun: true, screener: false, perplexity: false },
    { feature: 'Real-time Social Sentiment', nipun: true, screener: false, perplexity: true },
    { feature: '22+ Data Dimensions', nipun: true, screener: false, perplexity: false },
    { feature: 'Completely Free', nipun: true, screener: false, perplexity: true },
];

export default function App() {
    const { view } = useStore();

    return (
        <div className="min-h-screen font-body">
            <Nav />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
                {view === 'setup' && <LandingPage />}
                {view === 'analysis' && <AnalysisForm />}
                {view === 'report' && <ReportViewer />}
            </main>
            <Footer />
        </div>
    );
}

function Nav() {
    const { view, setView, clearResult } = useStore();

    return (
        <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-surface/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <button
                    onClick={() => { clearResult(); setView('setup'); }}
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    id="nav-logo"
                >
                    <span className="text-xl">⚡</span>
                    <span className="font-display text-lg font-bold">
                        Nipun <span className="text-gradient">AI</span>
                    </span>
                </button>
                <div className="flex items-center gap-2">
                    {view === 'report' && (
                        <span className="badge-gold">REPORT</span>
                    )}
                    <button
                        onClick={() => setView('setup')}
                        className="btn-secondary text-xs"
                        id="nav-manage-keys"
                    >
                        🔑 Manage Keys
                    </button>
                </div>
            </div>
        </nav>
    );
}

function LandingPage() {
    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <section className="py-16 text-center">
                <div className="mb-4">
                    <span className="badge-gold text-[10px]">
                        ✦ Premium Financial Intelligence — ₹0 Forever
                    </span>
                </div>
                <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                    <span className="text-gradient-hero">Nipun</span>{' '}
                    <span className="text-gradient">AI</span>
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-base text-white/50 leading-relaxed">
                    Get the stock analysis that Bloomberg charges ₹16,000/month for.
                    <br />
                    <span className="font-semibold text-white/70">22+ data dimensions, multi-AI consensus, proprietary Nipun Score™ — all free.</span>
                </p>
            </section>

            {/* Feature Grid */}
            <section className="mb-12">
                <div className="mb-6 text-center">
                    <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold">
                        100x More Impact Than Competitors
                    </h2>
                    <p className="mt-1 text-xs text-white/30">Features you won't find on Screener.in, Perplexity, or any free tool</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className={`card p-4 ${f.tag === 'EXCLUSIVE' ? 'border-gold/15 hover:border-gold/30' : ''}`}>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-lg">{f.icon}</span>
                                {f.tag && <span className="badge-gold">{f.tag}</span>}
                            </div>
                            <h3 className="font-display text-sm font-bold text-white/90">{f.title}</h3>
                            <p className="mt-0.5 text-[11px] text-white/40 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Table */}
            <section className="mb-12">
                <div className="card-premium overflow-hidden p-0">
                    <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
                        <h2 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold">
                            ⚔️ Feature Comparison
                        </h2>
                        <p className="mt-0.5 text-[10px] text-white/30">See why Nipun AI delivers 100x more value</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="px-6 py-3 text-left text-[10px] font-display font-bold uppercase tracking-wider text-white/40">Feature</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-display font-bold uppercase tracking-wider text-gold">Nipun AI</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-display font-bold uppercase tracking-wider text-white/30">Screener.in</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-display font-bold uppercase tracking-wider text-white/30">Perplexity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON.map((row, i) => (
                                    <tr key={row.feature} className={`border-b border-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                                        <td className="px-6 py-2.5 text-xs text-white/60">{row.feature}</td>
                                        <td className="px-4 py-2.5 text-center text-sm">{row.nipun ? '✅' : '❌'}</td>
                                        <td className="px-4 py-2.5 text-center text-sm">{row.screener ? '✅' : '❌'}</td>
                                        <td className="px-4 py-2.5 text-center text-sm">{row.perplexity ? '✅' : '❌'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Key Vault */}
            <KeyVault />
        </div>
    );
}

function Footer() {
    return (
        <footer className="mt-12 border-t border-white/[0.04] py-6 text-center">
            <p className="text-[10px] text-white/20">
                Nipun AI — Premium Financial Intelligence · Not financial advice · Always do your own research
            </p>
        </footer>
    );
}
