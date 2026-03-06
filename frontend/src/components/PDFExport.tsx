import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { useStore } from '../store';

/** Safe number: returns 0 for null/undefined/NaN to prevent .toFixed() crashes */
function safe(n: number | null | undefined): number {
    if (n == null || isNaN(n) || !isFinite(n)) return 0;
    return n;
}

export default function PDFExport() {
    const { result } = useStore();

    const generatePDF = useCallback(() => {
        if (!result) return;

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        // ── Helper functions ──────────────────────────────────────
        const addPage = () => {
            doc.addPage();
            y = margin;
            // Watermark on every page
            addWatermark();
        };

        const addWatermark = () => {
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(8);
            doc.text(
                'Not financial advice. Educational only.',
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 8,
                { align: 'center' }
            );
            doc.setTextColor(0, 0, 0);
        };

        const checkPageBreak = (height: number) => {
            if (y + height > doc.internal.pageSize.getHeight() - 20) {
                addPage();
            }
        };

        const addSection = (title: string) => {
            checkPageBreak(15);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 165, 233);
            doc.text(title, margin, y);
            y += 2;
            doc.setDrawColor(14, 165, 233);
            doc.setLineWidth(0.5);
            doc.line(margin, y, margin + contentWidth, y);
            y += 6;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
        };

        // ── Page 1: Header ────────────────────────────────────────
        addWatermark();

        // Title bar
        doc.setFillColor(10, 10, 15);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Nipun AI', margin, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(14, 165, 233);
        doc.text(`${result.ticker} — Institutional-Grade Analysis Report`, margin, 23);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text(`Generated: ${new Date(result.timestamp).toLocaleString()}${result.isDemo ? ' (DEMO DATA)' : ''}`, margin, 30);
        doc.setTextColor(0, 0, 0);
        y = 45;

        // ── Financial Data Table ──────────────────────────────────
        addSection('Financial Overview');

        const financialRows = [
            ['Price', `$${safe(result.financials.price).toFixed(2)}`, 'P/E Ratio', safe(result.financials.pe).toFixed(2)],
            ['Change', `${safe(result.financials.change) > 0 ? '+' : ''}${safe(result.financials.change).toFixed(2)} (${safe(result.financials.changePercent).toFixed(2)}%)`, 'EPS', `$${safe(result.financials.eps).toFixed(2)}`],
            ['Market Cap', formatNum(safe(result.financials.marketCap)), 'Beta', safe(result.financials.beta).toFixed(2)],
            ['52W High', `$${safe(result.financials.weekHigh52).toFixed(2)}`, '52W Low', `$${safe(result.financials.weekLow52).toFixed(2)}`],
            ['Gross Margin', `${safe(result.financials.grossMargin).toFixed(2)}%`, 'Debt/Equity', safe(result.financials.debtToEquity).toFixed(2)],
            ['Revenue', formatNum(safe(result.financials.revenue)), 'Div Yield', `${safe(result.financials.dividendYield).toFixed(2)}%`],
        ];

        doc.setFontSize(9);
        for (const row of financialRows) {
            checkPageBreak(6);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(row[0], margin, y);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(row[1], margin + 35, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(row[2], margin + contentWidth / 2, y);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text(row[3], margin + contentWidth / 2 + 35, y);
            y += 6;
        }
        y += 4;

        // ── Sentiment ─────────────────────────────────────────────
        addSection('Social Sentiment Analysis');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Sentiment bars
        const barWidth = contentWidth * 0.65;
        const sentiments = [
            { label: 'Bullish', pct: result.sentiment.bullishPercent, color: [16, 185, 129] as [number, number, number] },
            { label: 'Bearish', pct: result.sentiment.bearishPercent, color: [239, 68, 68] as [number, number, number] },
            { label: 'Neutral', pct: result.sentiment.neutralPercent, color: [107, 114, 128] as [number, number, number] },
        ];

        for (const s of sentiments) {
            checkPageBreak(8);
            doc.setFontSize(9);
            doc.setTextColor(80, 80, 80);
            doc.text(`${s.label}: ${s.pct}%`, margin, y);

            // Background bar
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(margin + 35, y - 3.5, barWidth, 4, 1, 1, 'F');

            // Filled bar
            doc.setFillColor(...s.color);
            const fillWidth = Math.max(0, (barWidth * s.pct) / 100);
            if (fillWidth > 0) {
                doc.roundedRect(margin + 35, y - 3.5, fillWidth, 4, 1, 1, 'F');
            }
            y += 7;
        }

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`${result.sentiment.totalPosts} posts analyzed • Themes: ${result.sentiment.themes.slice(0, 4).join(', ')}`, margin, y);
        y += 8;

        // ── Risk Factors ──────────────────────────────────────────
        addSection('Risk Factors');
        doc.setFontSize(9);

        for (const risk of result.risks) {
            checkPageBreak(16);
            const sevColor = risk.severity === 'high' ? [239, 68, 68] : risk.severity === 'medium' ? [245, 158, 11] : [16, 185, 129];
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
            doc.text(`[${risk.severity.toUpperCase()}] ${risk.category.toUpperCase()}`, margin, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const lines = doc.splitTextToSize(risk.description, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * 4 + 4;
        }

        // ── Catalysts ─────────────────────────────────────────────
        addSection('Catalysts');
        doc.setFontSize(9);

        for (const catalyst of result.catalysts) {
            checkPageBreak(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129);
            doc.text(`[${catalyst.timeline}]`, margin, y);
            y += 4;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const lines = doc.splitTextToSize(catalyst.description, contentWidth);
            doc.text(lines, margin, y);
            y += lines.length * 4 + 4;
        }

        // ── Full Report Text ──────────────────────────────────────
        addSection('Full Analysis Report');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);

        const reportLines = result.report.split('\n');
        for (const line of reportLines) {
            if (line.startsWith('# ')) {
                checkPageBreak(10);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(line.slice(2), margin, y);
                y += 7;
            } else if (line.startsWith('## ')) {
                checkPageBreak(10);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(14, 165, 233);
                doc.text(line.slice(3), margin, y);
                y += 6;
            } else if (line.trim() === '') {
                y += 3;
            } else if (line.startsWith('---')) {
                checkPageBreak(5);
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, y, margin + contentWidth, y);
                y += 5;
            } else {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(40, 40, 40);
                const cleanLine = line.replace(/\*\*/g, '').replace(/\*/g, '');
                const wrapped = doc.splitTextToSize(cleanLine, contentWidth);
                checkPageBreak(wrapped.length * 4);
                doc.text(wrapped, margin, y);
                y += wrapped.length * 4 + 1;
            }
        }

        // ── Audit Results ─────────────────────────────────────────
        if (result.audit) {
            addSection('Fact Audit Results');
            doc.setFontSize(9);

            doc.setFont('helvetica', 'bold');
            doc.text(
                `Grounded: ${result.audit.groundedCount} | Speculative: ${result.audit.speculativeCount} | Unverifiable: ${result.audit.unverifiableCount}`,
                margin,
                y
            );
            y += 6;

            for (const claim of result.audit.claims) {
                checkPageBreak(10);
                const icon = claim.status === 'grounded' ? '✓' : claim.status === 'speculative' ? '~' : '✗';
                const color = claim.status === 'grounded' ? [16, 185, 129] : claim.status === 'speculative' ? [245, 158, 11] : [239, 68, 68];
                doc.setTextColor(color[0], color[1], color[2]);
                doc.setFont('helvetica', 'bold');
                doc.text(icon, margin, y);

                doc.setTextColor(60, 60, 60);
                doc.setFont('helvetica', 'normal');
                const claimLines = doc.splitTextToSize(claim.claim, contentWidth - 8);
                doc.text(claimLines, margin + 5, y);
                y += claimLines.length * 4 + 3;
            }
        }

        // ── Nipun Score™ ──────────────────────────────────────────
        if (result.nipunScore) {
            addSection('Nipun Score™');
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 165, 233);
            doc.text(`Grade: ${result.nipunScore.grade} (${safe(result.nipunScore.numericScore)}/100)`, margin, y);
            y += 7;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Confidence: ${result.nipunScore.confidence}%`, margin, y);
            y += 5;
            const verdictLines = doc.splitTextToSize(result.nipunScore.verdict, contentWidth);
            doc.text(verdictLines, margin, y);
            y += verdictLines.length * 4 + 3;

            if (result.nipunScore.strengths.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(16, 185, 129);
                doc.text('Strengths:', margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                for (const s of result.nipunScore.strengths) {
                    checkPageBreak(6);
                    doc.text(`+ ${s}`, margin + 3, y);
                    y += 5;
                }
            }
            if (result.nipunScore.weaknesses.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(239, 68, 68);
                doc.text('Weaknesses:', margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                for (const w of result.nipunScore.weaknesses) {
                    checkPageBreak(6);
                    doc.text(`- ${w}`, margin + 3, y);
                    y += 5;
                }
            }
            y += 3;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 165, 233);
            doc.text('Recommendation:', margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const recLines = doc.splitTextToSize(result.nipunScore.recommendation, contentWidth);
            doc.text(recLines, margin, y);
            y += recLines.length * 4 + 4;
        }

        // ── Investment Score ──────────────────────────────────────
        if (result.investmentScore) {
            addSection('Investment Score');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`${result.investmentScore.overall}/100 — ${result.investmentScore.signal}`, margin, y);
            y += 7;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const scores = result.investmentScore.breakdown;
            const scoreRows = [
                ['Fundamentals', `${scores.fundamentalScore}/100`, 'Technicals', `${scores.technicalScore}/100`],
                ['Sentiment', `${scores.sentimentScore}/100`, 'Risk', `${scores.riskScore}/100`],
                ['Insider Signal', `${scores.insiderScore}/100`, '', ''],
            ];
            for (const row of scoreRows) {
                checkPageBreak(6);
                doc.text(row[0], margin, y);
                doc.setFont('helvetica', 'bold');
                doc.text(row[1], margin + 30, y);
                doc.setFont('helvetica', 'normal');
                if (row[2]) {
                    doc.text(row[2], margin + contentWidth / 2, y);
                    doc.setFont('helvetica', 'bold');
                    doc.text(row[3], margin + contentWidth / 2 + 30, y);
                    doc.setFont('helvetica', 'normal');
                }
                y += 5;
            }
            y += 3;
        }

        // ── Scenario Analysis ─────────────────────────────────────
        if (result.scenarioAnalysis) {
            addSection('Scenario Analysis');
            doc.setFontSize(9);
            for (const sc of [result.scenarioAnalysis.bull, result.scenarioAnalysis.base, result.scenarioAnalysis.bear]) {
                checkPageBreak(14);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(sc.label === 'Bull Case' ? 16 : sc.label === 'Bear Case' ? 239 : 100,
                    sc.label === 'Bull Case' ? 185 : sc.label === 'Bear Case' ? 68 : 100,
                    sc.label === 'Bull Case' ? 129 : sc.label === 'Bear Case' ? 68 : 100);
                doc.text(`${sc.label}: $${safe(sc.price).toFixed(0)} (${safe(sc.upside) > 0 ? '+' : ''}${safe(sc.upside).toFixed(1)}%) — ${sc.probability}% probability`, margin, y);
                y += 4;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                const ratLines = doc.splitTextToSize(sc.rationale, contentWidth);
                doc.text(ratLines, margin, y);
                y += ratLines.length * 4 + 3;
            }
        }

        // ── Financial Health ──────────────────────────────────────
        if (result.financialHealth) {
            addSection('Financial Health');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const healthRows = [
                ['Altman Z-Score', `${safe(result.financialHealth.altmanZScore).toFixed(2)} (${result.financialHealth.altmanZone})`],
                ['Piotroski F-Score', `${result.financialHealth.piotroskiFScore}/9 (${result.financialHealth.piotroskiRating})`],
                ['Current Ratio', safe(result.financialHealth.currentRatio).toFixed(2)],
                ['Quick Ratio', safe(result.financialHealth.quickRatio).toFixed(2)],
                ['Interest Coverage', `${safe(result.financialHealth.interestCoverage).toFixed(1)}x`],
                ['52W Position', `${safe(result.financialHealth.pricePositionPercent).toFixed(0)}%`],
                ['Volatility', result.financialHealth.volatilityCategory],
            ];
            for (const [label, value] of healthRows) {
                checkPageBreak(6);
                doc.text(label, margin, y);
                doc.setFont('helvetica', 'bold');
                doc.text(value, margin + 40, y);
                doc.setFont('helvetica', 'normal');
                y += 5;
            }
            y += 2;
        }

        // ── Valuation Models ──────────────────────────────────────
        if (result.valuationModels) {
            addSection('Valuation Models');
            doc.setFontSize(9);
            for (const [name, model] of [['DCF', result.valuationModels.dcf], ['Graham Number', result.valuationModels.graham], ['Peter Lynch', result.valuationModels.lynch]] as const) {
                checkPageBreak(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(`${name}: $${safe(model.value).toFixed(0)} (${safe(model.upside) > 0 ? '+' : ''}${safe(model.upside).toFixed(1)}%)`, margin, y);
                y += 4;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(model.methodology, margin, y);
                y += 5;
            }
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(14, 165, 233);
            doc.text(`Consensus Fair Value: $${safe(result.valuationModels.consensus.value).toFixed(0)} (${safe(result.valuationModels.consensus.upside) > 0 ? '+' : ''}${safe(result.valuationModels.consensus.upside).toFixed(1)}%)`, margin, y);
            y += 6;
        }

        // ── Competitive Moat ──────────────────────────────────────
        if (result.competitiveMoat) {
            addSection('Competitive Moat');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Rating: ${result.competitiveMoat.rating} (${result.competitiveMoat.score}/100) — Durability: ${result.competitiveMoat.durability}`, margin, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            for (const src of result.competitiveMoat.sources) {
                checkPageBreak(8);
                doc.text(`• ${src.name} (${src.strength}): ${src.description}`, margin, y);
                y += 5;
            }
            y += 3;
        }

        // ── SWOT Analysis ─────────────────────────────────────────
        if (result.swotAnalysis) {
            addSection('SWOT Analysis');
            doc.setFontSize(9);
            for (const [label, items, color] of [
                ['Strengths', result.swotAnalysis.strengths, [16, 185, 129]],
                ['Weaknesses', result.swotAnalysis.weaknesses, [239, 68, 68]],
                ['Opportunities', result.swotAnalysis.opportunities, [56, 189, 248]],
                ['Threats', result.swotAnalysis.threats, [245, 158, 11]],
            ] as const) {
                checkPageBreak(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(color[0], color[1], color[2]);
                doc.text(`${label}:`, margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(60, 60, 60);
                for (const item of items.slice(0, 3)) {
                    checkPageBreak(6);
                    const itemLines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
                    doc.text(itemLines, margin + 3, y);
                    y += itemLines.length * 4 + 2;
                }
            }
        }

        // ── Investment Thesis ─────────────────────────────────────
        if (result.investmentThesis) {
            addSection('Investment Thesis');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const summLines = doc.splitTextToSize(result.investmentThesis.summary, contentWidth);
            doc.text(summLines, margin, y);
            y += summLines.length * 4 + 4;

            checkPageBreak(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(16, 185, 129);
            doc.text('Bull Case:', margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const bullLines = doc.splitTextToSize(result.investmentThesis.bullCase, contentWidth);
            doc.text(bullLines, margin, y);
            y += bullLines.length * 4 + 4;

            checkPageBreak(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(239, 68, 68);
            doc.text('Bear Case:', margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const bearLines = doc.splitTextToSize(result.investmentThesis.bearCase, contentWidth);
            doc.text(bearLines, margin, y);
            y += bearLines.length * 4 + 4;
        }

        // ── Momentum & Risk-Reward ────────────────────────────────
        if (result.momentum) {
            addSection('Momentum Score');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Score: ${result.momentum.score}/100 — Trend: ${result.momentum.trend}`, margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`7D: ${result.momentum.shortTerm.performance > 0 ? '+' : ''}${result.momentum.shortTerm.performance}% | 30D: ${result.momentum.mediumTerm.performance > 0 ? '+' : ''}${result.momentum.mediumTerm.performance}% | 90D: ${result.momentum.longTerm.performance > 0 ? '+' : ''}${result.momentum.longTerm.performance}%`, margin, y);
            y += 6;
        }

        if (result.riskReward) {
            addSection('Risk-Reward Profile');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Ratio: ${safe(result.riskReward.ratio).toFixed(1)}:1 — Rating: ${result.riskReward.rating}`, margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Max Downside: -${result.riskReward.maxDrawdownEstimate}% | Upside: +${result.riskReward.upsidePotential}%`, margin, y);
            y += 6;
        }

        // ── Dividend Analysis ─────────────────────────────────────
        if (result.dividendAnalysis && result.dividendAnalysis.yield > 0) {
            addSection('Dividend Analysis');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(`Yield: ${result.dividendAnalysis.yield}% | Annual: $${result.dividendAnalysis.annualDividend} | Payout: ${result.dividendAnalysis.payoutRatio}% | Safety: ${result.dividendAnalysis.safety}`, margin, y);
            y += 6;
        }

        // ── Technical Analysis Summary ────────────────────────────
        if (result.technicals) {
            addSection('Technical Analysis');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Overall Signal: ${result.technicals.overallSignal.toUpperCase()}`, margin, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            for (const sig of [result.technicals.rsi, result.technicals.macd, result.technicals.sma50, result.technicals.sma200]) {
                checkPageBreak(8);
                doc.setTextColor(sig.signal === 'bullish' ? 16 : sig.signal === 'bearish' ? 239 : 100,
                    sig.signal === 'bullish' ? 185 : sig.signal === 'bearish' ? 68 : 100,
                    sig.signal === 'bullish' ? 129 : sig.signal === 'bearish' ? 68 : 100);
                doc.setFont('helvetica', 'bold');
                doc.text(`${sig.name}: ${sig.value} (${sig.signal})`, margin, y);
                y += 4;
                doc.setTextColor(60, 60, 60);
                doc.setFont('helvetica', 'normal');
                const interpLines = doc.splitTextToSize(sig.interpretation, contentWidth);
                doc.text(interpLines, margin, y);
                y += interpLines.length * 4 + 2;
            }
        }

        // ── AI Consensus ──────────────────────────────────────────
        if (result.aiConsensus) {
            addSection('Multi-AI Consensus');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Agreement: ${result.aiConsensus.agreementScore}% | Gemini: ${result.aiConsensus.geminiVerdict} | ${result.aiConsensus.secondaryModel}: ${result.aiConsensus.secondaryVerdict}`, margin, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const consLines = doc.splitTextToSize(result.aiConsensus.consensusSummary, contentWidth);
            doc.text(consLines, margin, y);
            y += consLines.length * 4 + 4;
        }

        // ── Insider Activity ──────────────────────────────────────
        if (result.insiderActivity) {
            addSection('Insider Activity');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`Net Sentiment: ${result.insiderActivity.netSentiment} | Buys: ${formatNum(result.insiderActivity.totalBuyValue)} | Sells: ${formatNum(result.insiderActivity.totalSellValue)}`, margin, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            for (const t of result.insiderActivity.trades.slice(0, 5)) {
                checkPageBreak(6);
                doc.text(`${t.name} (${t.role}) — ${t.transactionType.toUpperCase()} ${formatNum(t.value)} on ${t.date}`, margin, y);
                y += 5;
            }
            y += 2;
        }

        // ── Final Disclaimer ──────────────────────────────────────
        checkPageBreak(20);
        y += 5;
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, contentWidth, 15);
        doc.setFillColor(255, 252, 240);
        doc.rect(margin, y, contentWidth, 15, 'F');
        y += 4;
        doc.setFontSize(7);
        doc.setTextColor(180, 140, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠️ DISCLAIMER', margin + 3, y);
        y += 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const disclaimerLines = doc.splitTextToSize(
            'This is not financial advice. This report is for educational and informational purposes only. Always conduct your own research and consult with a qualified financial advisor before making investment decisions.',
            contentWidth - 6
        );
        doc.text(disclaimerLines, margin + 3, y);

        // Save
        doc.save(`NipunAI_${result.ticker}_${new Date().toISOString().split('T')[0]}.pdf`);
    }, [result]);

    return (
        <button onClick={generatePDF} className="btn-primary text-sm" id="pdf-export-btn">
            📄 Export PDF
        </button>
    );
}

function formatNum(n: number): string {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(2)}`;
}
