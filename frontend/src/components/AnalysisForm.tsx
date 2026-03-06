import { useState } from 'react';
import { useStore } from '../store';

const POPULAR_TICKERS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'RELIANCE'];

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
                    <span className="badge-gold">
                        🎮 Demo Mode — Using realistic mock data
                    </span>
                </div>
            )}

            {/* Main form */}
            <div className="card p-8">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-glow">
                        <span className="text-3xl">✨</span>
                    </div>
                    <h2 className="mb-2 font-display text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">Analyze a Stock</h2>
                    <p className="text-sm text-white/50 max-w-sm mx-auto">
                        Enter a ticker symbol to generate an ultra-premium, AI-driven financial manifesto.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-accent to-gold opacity-30 blur-sm transition duration-500 group-hover:opacity-75"></div>
                        <input
                            type="text"
                            className="relative w-full rounded-xl border border-white/10 bg-[#0A0F1C] px-6 py-4 pr-24 text-center font-mono text-3xl font-black tracking-[0.2em] text-white placeholder-white/20 shadow-inner transition-all duration-300 focus:outline-none focus:border-accent/50 focus:bg-[#111827] focus:ring-1 focus:ring-accent/30"
                            placeholder="AAPL"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                            disabled={isAnalyzing}
                            autoFocus
                            id="ticker-input"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-white/30 border border-white/10">TICKER</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isAnalyzing || !inputValue.trim()}
                        className="btn-gold w-full text-base disabled:opacity-30 disabled:cursor-not-allowed"
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
                            <>⚡ Generate Premium Report</>
                        )}
                    </button>
                </form>

                {/* Phase indicator */}
                {isAnalyzing && analysisPhase && (
                    <div className="mt-6 animate-slide-up">
                        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                                <span className="text-sm text-accent font-body">{analysisPhase}</span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                                <div className="h-full animate-shimmer rounded-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" style={{ backgroundSize: '200% 100%' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="mt-4 animate-slide-up rounded-xl border border-rose/20 bg-rose/5 p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-rose">⚠️</span>
                            <span className="text-sm text-rose">{error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick tickers */}
            <div className="mt-6 text-center">
                <p className="mb-3 section-heading">Popular Tickers</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {POPULAR_TICKERS.map((t) => (
                        <button
                            key={t}
                            onClick={() => handleQuickTicker(t)}
                            disabled={isAnalyzing}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 font-mono text-xs text-white/50 transition-all duration-200 hover:border-accent/20 hover:bg-accent/5 hover:text-accent hover:-translate-y-0.5 disabled:opacity-30"
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
