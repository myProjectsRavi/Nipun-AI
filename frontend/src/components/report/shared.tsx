/**
 * ─── Shared Report UI Primitives & Constants ──────────────────────
 * Reused across all report sub-components and PDFExport.
 */
import type { ReactNode } from 'react';
import type { ResearchSources } from '../../store';

// ─── Color Maps ─────────────────────────────────────────────────────
export const SEVERITY = {
    high: { bg: 'bg-rose/10', border: 'border-rose/20', text: 'text-rose', dot: 'bg-rose' },
    medium: { bg: 'bg-gold/10', border: 'border-gold/20', text: 'text-gold', dot: 'bg-gold' },
    low: { bg: 'bg-emerald/10', border: 'border-emerald/20', text: 'text-emerald', dot: 'bg-emerald' },
} as const;

export const SIGNAL = {
    bullish: { color: 'text-emerald', bg: 'bg-emerald/10', border: 'border-emerald/20', icon: '🟢' },
    bearish: { color: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/20', icon: '🔴' },
    neutral: { color: 'text-muted', bg: 'bg-white/5', border: 'border-white/10', icon: '⚪' },
} as const;

export const GRADE_COLORS: Record<string, string> = {
    'A+': 'text-emerald', 'A': 'text-emerald', 'A-': 'text-emerald-light',
    'B+': 'text-sky', 'B': 'text-sky', 'B-': 'text-sky-light',
    'C+': 'text-gold', 'C': 'text-gold', 'C-': 'text-gold-light',
    'D': 'text-rose-light', 'F': 'text-rose',
};

export const PIE_COLORS = ['#34D399', '#FB7185', '#94A3B8'];
export const REVENUE_COLORS = ['#818CF8', '#38BDF8', '#34D399', '#F59E0B', '#FB7185'];

export const RESEARCH_CATEGORIES: Record<keyof ResearchSources, { icon: string; label: string }> = {
    financialData:       { icon: '📈', label: 'Financial Data (Finnhub)' },
    technicalAnalysis:   { icon: '📊', label: 'Technical Analysis Sources' },
    secFilings:          { icon: '📋', label: 'SEC Filings & Regulatory' },
    financialStatements: { icon: '💰', label: 'Financial Statements' },
    companyResearch:     { icon: '🏢', label: 'Company Research' },
    newsSentiment:       { icon: '📰', label: 'News & Sentiment Sources' },
    analystData:         { icon: '🎯', label: 'Analyst & Institutional Data' },
    valuationReferences: { icon: '🧮', label: 'Valuation Model References' },
    earningsDividends:   { icon: '🔬', label: 'Earnings & Dividends' },
    riskCompliance:      { icon: '🛡️', label: 'Risk & Compliance' },
};

// ─── Utility Functions ──────────────────────────────────────────────

/** Format large numbers with $-prefix and suffix (T/B/M/K) */
export function formatN(n: number): string {
    if (n == null || isNaN(n)) return '$0';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return n.toString();
}

/** Safe number: returns 0 for null/undefined/NaN/Infinity */
export function safe(n: number | null | undefined): number {
    if (n == null || isNaN(n) || !isFinite(n)) return 0;
    return n;
}

// ─── Primitive Components ───────────────────────────────────────────

export function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="stat-label">{label}</span>
                <span className="font-mono text-sm font-bold text-white">{value}</span>
            </div>
            <div className="score-bar">
                <div className={`score-bar-fill ${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

export function SectionCard({ title, icon, delay, children, premium }: {
    title: string; icon: string; delay?: string; children: ReactNode; premium?: boolean;
}) {
    return (
        <div className={`${premium ? 'card-premium' : 'card'} p-5 animate-slide-up`} style={delay ? { animationDelay: delay } : undefined}>
            <h3 className="section-heading mb-4 flex items-center gap-2">
                <span className="text-base">{icon}</span> {title}
            </h3>
            {children}
        </div>
    );
}
