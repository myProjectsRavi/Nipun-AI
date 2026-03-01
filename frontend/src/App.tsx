import { useStore } from './store';
import KeyVault from './components/KeyVault';
import AnalysisForm from './components/AnalysisForm';
import ReportViewer from './components/ReportViewer';

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
        <div className="min-h-screen bg-base bg-mesh">
            {/* ── Navigation ──────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-base/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <button onClick={handleLogoClick} className="flex items-center gap-2.5 group" id="logo-btn">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-lg transition-transform group-hover:scale-110">
                            ⚡
                        </div>
                        <div>
                            <span className="text-base font-bold text-white">Nipun</span>
                            <span className="ml-1 text-base font-bold text-gradient">AI</span>
                        </div>
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Status indicators */}
                        {(keys || demoMode) && view !== 'setup' && (
                            <div className="hidden items-center gap-2 sm:flex">
                                {demoMode ? (
                                    <span className="badge-accent text-[10px]">DEMO</span>
                                ) : (
                                    <span className="badge-success text-[10px]">LIVE</span>
                                )}
                            </div>
                        )}

                        {/* Settings / Key management */}
                        {view !== 'setup' && (
                            <button
                                onClick={handleSettingsClick}
                                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/50 transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
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
                    <div className="mb-12 text-center animate-fade-in">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-xs font-medium text-accent">Zero-Cost MoE Financial Intelligence</span>
                        </div>
                        <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                            <span className="text-gradient">Nipun</span>{' '}
                            <span className="text-white">AI</span>
                        </h1>
                        <p className="mx-auto max-w-xl text-base text-white/40 leading-relaxed">
                            Institutional-grade stock analysis powered by a Mixture-of-Experts pipeline.
                            Bring your own API keys. Zero cost. Maximum alpha.
                        </p>

                    </div>
                )}

                {/* View Router */}
                {view === 'setup' && <KeyVault />}
                {view === 'analysis' && <AnalysisForm />}
                {view === 'report' && <ReportViewer />}
            </main>

            {/* ── Footer ──────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.04] bg-base/50">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/20">⚡ Nipun AI</span>
                            <span className="text-xs text-white/10">v1.0.0</span>
                        </div>

                        {/* Disclaimer — always visible */}
                        <div className="rounded-lg border border-warning/10 bg-warning/[0.03] px-4 py-2">
                            <p className="text-center text-[10px] text-warning/50">
                                ⚠️ Not financial advice. Educational and informational purposes only.
                                Always consult a qualified financial advisor.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/10">
                                AI-powered analysis engine
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
