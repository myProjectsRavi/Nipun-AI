import { useState } from 'react';
import { useStore } from '../store';

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'RELIANCE.NS'];

export default function AnalysisForm() {
    const { ticker, setTicker, isAnalyzing, analysisPhase, error, demoMode, runAnalysis } = useStore();
    const [inputValue, setInputValue] = useState(ticker || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setTicker(inputValue.trim().toUpperCase());
        runAnalysis();
    };

    const handleQuickTicker = (t: string) => {
        setInputValue(t);
        setTicker(t);
        runAnalysis();
    };

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            {/* Demo mode badge */}
            {demoMode && (
                <div className="mb-6 flex justify-center">
                    <span className="badge-accent text-sm">
                        🎮 Demo Mode — Using mock data
                    </span>
                </div>
            )}

            {/* Main form */}
            <div className="glass-card p-8">
                <div className="mb-6 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-white">Analyze a Stock</h2>
                    <p className="text-sm text-white/40">
                        Enter a ticker symbol to generate an institutional-grade analysis report
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            className="input-field pr-24 text-center font-mono text-2xl font-bold tracking-wider uppercase"
                            placeholder="AAPL"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                            disabled={isAnalyzing}
                            autoFocus
                            id="ticker-input"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <span className="text-xs text-white/20 font-mono">TICKER</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !inputValue.trim()}
                        className="btn-primary w-full text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                        id="analyze-btn"
                    >
                        {isAnalyzing ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Analyzing...
                            </span>
                        ) : (
                            <>
                                ⚡ Generate Analysis Report
                            </>
                        )}
                    </button>
                </form>

                {/* Phase indicator */}
                {isAnalyzing && analysisPhase && (
                    <div className="mt-6 animate-slide-up">
                        <div className="glass-card p-4">
                            <div className="flex items-center gap-3">
                                <div className="phase-dot-active" />
                                <span className="text-sm text-accent">{analysisPhase}</span>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                                <div className="h-full animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" style={{ backgroundSize: '200% 100%' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="mt-4 animate-slide-up rounded-lg border border-danger/20 bg-danger/5 p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-danger">⚠️</span>
                            <span className="text-sm text-danger">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick tickers */}
            <div className="mt-6 text-center">
                <p className="mb-3 text-xs text-white/20 uppercase tracking-wider">Popular Tickers</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_TICKERS.map((t) => (
                        <button
                            key={t}
                            onClick={() => handleQuickTicker(t)}
                            disabled={isAnalyzing}
                            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-xs text-white/40 transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent disabled:opacity-30"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pipeline info */}
            <div className="mt-8 glass-card p-6">
                <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-white/30">
                    Analysis Pipeline
                </h3>
                <div className="grid grid-cols-5 gap-2">
                    {[
                        { phase: '1', label: 'Financials', icon: '📊' },
                        { phase: '2', label: 'Sentiment', icon: '💬' },
                        { phase: '3', label: 'Risk Analysis', icon: '⚠️' },
                        { phase: '4', label: 'Synthesis', icon: '🔮' },
                        { phase: '5', label: 'Fact Audit', icon: '✅' },
                    ].map((p) => (
                        <div key={p.phase} className="text-center">
                            <div className="mb-1 text-lg">{p.icon}</div>
                            <div className="text-[10px] font-medium text-white/50">{p.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
