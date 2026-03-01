import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { useStore } from '../store';

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
            ['Price', `$${result.financials.price.toFixed(2)}`, 'P/E Ratio', result.financials.pe.toFixed(2)],
            ['Change', `${result.financials.change > 0 ? '+' : ''}${result.financials.change.toFixed(2)} (${result.financials.changePercent.toFixed(2)}%)`, 'EPS', `$${result.financials.eps.toFixed(2)}`],
            ['Market Cap', formatNum(result.financials.marketCap), 'Beta', result.financials.beta.toFixed(2)],
            ['52W High', `$${result.financials.weekHigh52.toFixed(2)}`, '52W Low', `$${result.financials.weekLow52.toFixed(2)}`],
            ['Gross Margin', `${result.financials.grossMargin.toFixed(2)}%`, 'Debt/Equity', result.financials.debtToEquity.toFixed(2)],
            ['Revenue', formatNum(result.financials.revenue), 'Div Yield', `${result.financials.dividendYield.toFixed(2)}%`],
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
