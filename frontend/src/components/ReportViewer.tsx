/**
 * ─── Report Viewer ────────────────────────────────────────────────
 * Thin orchestrator composing all report sub-components.
 * Each section lives in components/report/ for maintainability.
 */
import { useStore } from '../store';
import PDFExport from './PDFExport';
import {
    ScoreCards,
    HealthScenarioCards,
    MarketDataCards,
    AnalysisCards,
    CompanyDataCards,
    BottomSection,
} from './report';

export default function ReportViewer() {
    const { result, clearResult, setView } = useStore();
    if (!result) return null;

    const goBack = () => { clearResult(); setView('analysis'); };

    return (
        <div className="mx-auto max-w-6xl animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={goBack} className="btn-secondary text-base" id="new-analysis-btn">← New</button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-display text-2xl font-extrabold text-white">{result.ticker}</h1>
                            {result.financials.companyName !== result.ticker && (
                                <span className="text-base text-white/70">{result.financials.companyName}</span>
                            )}
                            {result.isDemo && <span className="badge-gold">DEMO</span>}
                        </div>
                        <p className="text-base text-white/80">{new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <PDFExport />
            </div>

            {/* Demo-only hosted instance notice */}
            {result.hostedDemoNotice && (
                <div className="mb-4 rounded-xl border border-sky/30 bg-sky/10 px-5 py-3 text-sm text-sky" id="hosted-demo-notice">
                    <p className="font-semibold">🏠 {result.hostedDemoNotice}</p>
                    <a
                        href="https://github.com/myProjectsRavi/Nipun-AI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block font-bold text-white underline hover:text-sky-light"
                    >
                        → Deploy your own (free, 5 minutes)
                    </a>
                </div>
            )}

            <ScoreCards result={result} />
            <HealthScenarioCards result={result} />
            <MarketDataCards result={result} />
            <AnalysisCards result={result} />
            <CompanyDataCards result={result} />
            <BottomSection result={result} />
        </div>
    );
}
