import { formatDuration, judicialRoleLabel, type TranscriptSegment } from '@smj/shared';
import { formatClock } from './format';

export interface PrintMeta {
  caseNumber: string | null;
  circuitName: string | null;
  judgeName: string | null;
  date: string;
  durationMs: number;
}

/** Escapes text for safe interpolation into printable HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function speakerHeading(segment: TranscriptSegment): string {
  const role = judicialRoleLabel(segment.speakerRole);
  const name = segment.speakerLabel?.trim();
  if (name && segment.speakerRole && segment.speakerRole !== 'unassigned') {
    return `${role} — ${name}`;
  }
  return name || role;
}

/**
 * Builds the print-ready, RTL, Ministry-branded HTML document for a transcript.
 * Exported separately from {@link printTranscript} so it can be unit-tested.
 * All dynamic text is HTML-escaped.
 */
export function buildPrintHtml(meta: PrintMeta, segments: TranscriptSegment[]): string {
  const finals = segments.filter((s) => s.isFinal);
  const rows = finals
    .map(
      (s) => `
        <div class="entry">
          <div class="head"><span class="role">${escapeHtml(speakerHeading(s))}</span>
          <span class="time">${escapeHtml(formatClock(s.timestamp))}</span></div>
          <div class="text">${escapeHtml(s.text)}</div>
        </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>المحضر الذكي — نص الجلسة</title>
<style>
  body { font-family: 'Segoe UI', 'Traditional Arabic', Tahoma, serif; color: #111; margin: 32px; }
  header { text-align: center; border-bottom: 2px solid #1b6c3c; padding-bottom: 12px; margin-bottom: 20px; }
  header .ministry { color: #1b6c3c; font-weight: 700; letter-spacing: .5px; }
  header h1 { margin: 4px 0; font-size: 22px; }
  .meta { margin-bottom: 20px; font-size: 14px; line-height: 1.9; }
  .meta b { color: #1b6c3c; }
  .entry { padding: 10px 0; border-bottom: 1px solid #ddd; page-break-inside: avoid; }
  .head { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .role { font-weight: 700; color: #1b6c3c; }
  .time { color: #666; font-variant-numeric: tabular-nums; }
  .text { font-size: 17px; line-height: 1.8; }
  @media print { body { margin: 12mm; } }
</style>
</head>
<body>
  <header>
    <div class="ministry">وزارة العدل</div>
    <h1>المحضر الذكي — نص الجلسة</h1>
  </header>
  <div class="meta">
    <div><b>رقم القضية:</b> ${escapeHtml(meta.caseNumber || 'غير محدد')}</div>
    <div><b>اسم الدائرة:</b> ${escapeHtml(meta.circuitName || 'غير محددة')}</div>
    <div><b>القاضي:</b> ${escapeHtml(meta.judgeName || 'غير محدد')}</div>
    <div><b>التاريخ:</b> ${escapeHtml(meta.date)}</div>
    <div><b>مدة الجلسة:</b> ${escapeHtml(formatDuration(meta.durationMs))}</div>
    <div><b>عدد المداخلات:</b> ${finals.length}</div>
  </div>
  ${rows}
  <script>window.addEventListener('load', function () { window.print(); });</script>
</body>
</html>`;
}

/**
 * Opens the print-ready view in a new window and triggers the print dialog.
 */
export function printTranscript(meta: PrintMeta, segments: TranscriptSegment[]): void {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!win) return;
  win.document.open();
  win.document.write(buildPrintHtml(meta, segments));
  win.document.close();
}
