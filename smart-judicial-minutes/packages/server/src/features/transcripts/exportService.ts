import {
  formatDuration,
  judicialRoleLabel,
  sessionDurationMs,
  type ExportFormat,
  type TranscriptionSession,
  type TranscriptSegment,
} from '@smj/shared';

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

function formatClock(timestamp: string): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** The speaker heading shown per entry: "Name — Role" or just one if missing. */
function speakerHeading(segment: TranscriptSegment): string {
  const role = judicialRoleLabel(segment.speakerRole);
  const name = segment.speakerLabel?.trim();
  if (name && segment.speakerRole && segment.speakerRole !== 'unassigned') {
    return `${role} — ${name}`;
  }
  return name || role;
}

interface DocumentMeta {
  title: string;
  caseNumber: string;
  date: string;
  duration: string;
  entries: string;
}

function buildMeta(session: TranscriptionSession, segments: TranscriptSegment[]): DocumentMeta {
  return {
    title: session.meetingTitle,
    caseNumber: session.caseNumber?.trim() || 'غير محدد',
    date: formatDate(session.startedAt),
    duration: formatDuration(sessionDurationMs(session)),
    entries: String(segments.filter((s) => s.isFinal).length),
  };
}

/**
 * Renders a transcript to TXT, DOCX (Office Open XML), or PDF. Generation is
 * dependency-light and fully RTL-aware so exported minutes read correctly in
 * Arabic, and every export carries the hearing metadata (title, case number,
 * date and duration).
 */
export const exportService = {
  export(
    session: TranscriptionSession,
    segments: TranscriptSegment[],
    format: ExportFormat,
  ): ExportResult {
    switch (format) {
      case 'txt':
        return this.toTxt(session, segments);
      case 'docx':
        return this.toDocx(session, segments);
      case 'pdf':
        return this.toPdf(session, segments);
    }
  },

  toTxt(session: TranscriptionSession, segments: TranscriptSegment[]): ExportResult {
    const meta = buildMeta(session, segments);
    const lines: string[] = [
      'المحضر الذكي — نص الجلسة',
      '',
      `عنوان الجلسة: ${meta.title}`,
      `رقم القضية: ${meta.caseNumber}`,
      `التاريخ: ${meta.date}`,
      `مدة الجلسة: ${meta.duration}`,
      `عدد المداخلات: ${meta.entries}`,
      '='.repeat(64),
      '',
    ];
    for (const s of segments.filter((seg) => seg.isFinal)) {
      lines.push(`[${formatClock(s.timestamp)}] ${speakerHeading(s)}`);
      lines.push(s.text);
      lines.push('');
    }
    return {
      buffer: Buffer.from(`\uFEFF${lines.join('\r\n')}`, 'utf-8'),
      contentType: 'text/plain; charset=utf-8',
      filename: this.filename(session, 'txt'),
    };
  },

  toDocx(session: TranscriptionSession, segments: TranscriptSegment[]): ExportResult {
    const buffer = buildDocx(session, segments);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: this.filename(session, 'docx'),
    };
  },

  toPdf(session: TranscriptionSession, segments: TranscriptSegment[]): ExportResult {
    const buffer = buildPdf(session, segments);
    return {
      buffer,
      contentType: 'application/pdf',
      filename: this.filename(session, 'pdf'),
    };
  },

  filename(session: TranscriptionSession, ext: string): string {
    const base = session.caseNumber?.trim() || session.meetingTitle;
    const safe = base.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60);
    return `transcript_${safe}_${session.id.slice(0, 8)}.${ext}`;
  },
};

// ---------------------------------------------------------------------------
// DOCX (minimal, valid Office Open XML wordprocessing package as a ZIP)
// ---------------------------------------------------------------------------

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function docParagraph(
  text: string,
  opts: { bold?: boolean; size?: number; spaceAfter?: number } = {},
): string {
  const sizeHalfPts = opts.size ?? 24; // half-points (24 = 12pt)
  const rPr =
    `<w:rPr>${opts.bold ? '<w:b/><w:bCs/>' : ''}` +
    `<w:sz w:val="${sizeHalfPts}"/><w:szCs w:val="${sizeHalfPts}"/><w:rtl/></w:rPr>`;
  const spacing = opts.spaceAfter != null ? `<w:spacing w:after="${opts.spaceAfter}"/>` : '';
  return (
    `<w:p><w:pPr><w:bidi/>${spacing}<w:jc w:val="right"/></w:pPr>` +
    `<w:r>${rPr}<w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`
  );
}

function buildDocx(session: TranscriptionSession, segments: TranscriptSegment[]): Buffer {
  const meta = buildMeta(session, segments);
  const header = [
    docParagraph('المحضر الذكي — نص الجلسة', { bold: true, size: 36, spaceAfter: 120 }),
    docParagraph(`عنوان الجلسة: ${meta.title}`, { bold: true, spaceAfter: 40 }),
    docParagraph(`رقم القضية: ${meta.caseNumber}`, { spaceAfter: 40 }),
    docParagraph(`التاريخ: ${meta.date}`, { spaceAfter: 40 }),
    docParagraph(`مدة الجلسة: ${meta.duration}`, { spaceAfter: 40 }),
    docParagraph(`عدد المداخلات: ${meta.entries}`, { spaceAfter: 200 }),
  ];
  const bodyEntries = segments
    .filter((s) => s.isFinal)
    .flatMap((s) => [
      docParagraph(`[${formatClock(s.timestamp)}]  ${speakerHeading(s)}`, {
        bold: true,
        size: 22,
        spaceAfter: 20,
      }),
      docParagraph(s.text, { size: 26, spaceAfter: 160 }),
    ]);
  const body = [...header, ...bodyEntries].join('');

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${body}<w:sectPr><w:bidi/></w:sectPr></w:body></w:document>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  return zipStore([
    { name: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf-8') },
    { name: '_rels/.rels', data: Buffer.from(rels, 'utf-8') },
    { name: 'word/document.xml', data: Buffer.from(documentXml, 'utf-8') },
  ]);
}

// ---------------------------------------------------------------------------
// PDF (dependency-free writer; UTF-16BE text so Arabic survives to the viewer)
// ---------------------------------------------------------------------------

/** Wraps a line to a maximum character width, preserving whole words. */
function wrapLine(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars) {
      if (current) out.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [text];
}

function buildPdf(session: TranscriptionSession, segments: TranscriptSegment[]): Buffer {
  const meta = buildMeta(session, segments);
  const maxChars = 90;
  const lines: string[] = [
    'Smart Judicial Minutes / المحضر الذكي — نص الجلسة',
    '',
    `عنوان الجلسة: ${meta.title}`,
    `رقم القضية: ${meta.caseNumber}`,
    `التاريخ: ${meta.date}`,
    `مدة الجلسة: ${meta.duration}`,
    `عدد المداخلات: ${meta.entries}`,
    '────────────────────────────────────────',
    '',
  ];
  for (const s of segments.filter((seg) => seg.isFinal)) {
    lines.push(`[${formatClock(s.timestamp)}]  ${speakerHeading(s)}`);
    for (const wrapped of wrapLine(s.text, maxChars)) lines.push(wrapped);
    lines.push('');
  }
  return renderPdf(lines);
}

/** Encodes a string as a PDF UTF-16BE hex string with a BOM. */
function pdfHexUtf16(text: string): string {
  const buf = Buffer.from(`\uFEFF${text}`, 'utf16le').swap16();
  return `<${buf.toString('hex')}>`;
}

function renderPdf(lines: string[]): Buffer {
  const pageHeight = 792;
  const pageWidth = 612;
  const margin = 54;
  const leading = 16;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / leading);

  const pages: string[][] = [];
  for (let i = 0; i < Math.max(lines.length, 1); i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }

  const objects: string[] = [];
  const fontObj = 3;
  const pageObjStart = 4;
  const contentObjStart = pageObjStart + pages.length;

  const kids = pages.map((_, i) => `${pageObjStart + i} 0 R`).join(' ');

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`;
  // Standard Type1 font. Arabic is emitted as UTF-16BE hex strings, which
  // compliant readers render through their substitution font — keeping the
  // writer dependency-free while remaining valid PDF.
  objects[fontObj] =
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

  pages.forEach((pageLines, i) => {
    const contentObj = contentObjStart + i;
    objects[pageObjStart + i] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`;

    let stream = `BT /F1 11 Tf ${leading} TL ${margin} ${pageHeight - margin} Td\n`;
    for (const line of pageLines) {
      stream += `${pdfHexUtf16(line)} Tj T*\n`;
    }
    stream += 'ET';
    objects[contentObj] =
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue;
    offsets[i] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, 'latin1');
  const count = objects.length;
  pdf += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) {
    const off = offsets[i] ?? 0;
    pdf += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

// ---------------------------------------------------------------------------
// Minimal ZIP writer (STORE / no compression) for the DOCX package
// ---------------------------------------------------------------------------

interface ZipEntry {
  name: string;
  data: Buffer;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(entries: ZipEntry[]): Buffer {
  const chunks: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf-8');
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // STORE
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, nameBuf, entry.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(size, 20);
    centralHeader.writeUInt32LE(size, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    central.push(centralHeader, nameBuf);
    offset += local.length + nameBuf.length + entry.data.length;
  }

  const centralBuf = Buffer.concat(central);
  const centralOffset = offset;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuf, end]);
}
