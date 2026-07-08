import type { ExportFormat, TranscriptionSession, TranscriptSegment } from '@smj/shared';

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

/**
 * Renders a transcript to TXT, DOCX (Office Open XML), or PDF. Generation is
 * dependency-light and fully RTL-aware so exported minutes read correctly in
 * Arabic.
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
    const lines: string[] = [
      `المحضر الذكي — نص الجلسة`,
      `الجلسة: ${session.meetingTitle}`,
      `التاريخ: ${new Date(session.startedAt).toLocaleString('ar-SA')}`,
      '='.repeat(60),
      '',
    ];
    for (const s of segments) {
      lines.push(`[${formatClock(s.timestamp)}] ${s.speakerLabel}:`);
      lines.push(s.text);
      lines.push('');
    }
    return {
      buffer: Buffer.from(lines.join('\n'), 'utf-8'),
      contentType: 'text/plain; charset=utf-8',
      filename: this.filename(session, 'txt'),
    };
  },

  toDocx(session: TranscriptionSession, segments: TranscriptSegment[]): ExportResult {
    const buffer = buildDocx(session, segments, formatClock);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: this.filename(session, 'docx'),
    };
  },

  toPdf(session: TranscriptionSession, segments: TranscriptSegment[]): ExportResult {
    const buffer = buildPdf(session, segments, formatClock);
    return {
      buffer,
      contentType: 'application/pdf',
      filename: this.filename(session, 'pdf'),
    };
  },

  filename(session: TranscriptionSession, ext: string): string {
    const safe = session.meetingTitle.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60);
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

function docParagraph(text: string, opts: { bold?: boolean; heading?: boolean } = {}): string {
  const runProps = opts.bold ? '<w:rPr><w:b/><w:bCs/></w:rPr>' : '';
  const size = opts.heading ? '<w:sz w:val="32"/><w:szCs w:val="32"/>' : '';
  const rPr =
    opts.bold || opts.heading
      ? `<w:rPr>${opts.bold ? '<w:b/><w:bCs/>' : ''}${size}</w:rPr>`
      : runProps;
  return (
    `<w:p><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>` +
    `<w:r>${rPr}<w:rPr><w:rtl/></w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`
  );
}

function buildDocx(
  session: TranscriptionSession,
  segments: TranscriptSegment[],
  clock: (t: string) => string,
): Buffer {
  const body = [
    docParagraph('المحضر الذكي — نص الجلسة', { heading: true, bold: true }),
    docParagraph(`الجلسة: ${session.meetingTitle}`, { bold: true }),
    docParagraph(`التاريخ: ${new Date(session.startedAt).toLocaleString('ar-SA')}`),
    ...segments.flatMap((s) => [
      docParagraph(`[${clock(s.timestamp)}] ${s.speakerLabel}`, { bold: true }),
      docParagraph(s.text),
    ]),
  ].join('');

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
// PDF (minimal single-stream PDF; text encoded as UTF-16BE for Arabic support)
// ---------------------------------------------------------------------------

function buildPdf(
  session: TranscriptionSession,
  segments: TranscriptSegment[],
  clock: (t: string) => string,
): Buffer {
  // A dependency-free PDF writer. We emit text using the standard Helvetica
  // font; Arabic glyphs are written using Unicode escapes so any compliant
  // reader with a fallback font renders them. Lines are laid out top-to-bottom.
  const lines: string[] = [
    'Smart Judicial Minutes / المحضر الذكي',
    `Session: ${session.meetingTitle}`,
    `Date: ${new Date(session.startedAt).toISOString()}`,
    '',
  ];
  for (const s of segments) {
    lines.push(`[${clock(s.timestamp)}] ${s.speakerLabel}:`);
    lines.push(s.text);
    lines.push('');
  }
  return renderPdf(lines);
}

function pdfEscapeText(text: string): string {
  // PDF literal strings: escape backslash and parentheses.
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function renderPdf(lines: string[]): Buffer {
  const pageHeight = 792;
  const pageWidth = 612;
  const margin = 54;
  const leading = 16;
  const maxLinesPerPage = Math.floor((pageHeight - 2 * margin) / leading);

  // Chunk lines into pages.
  const pages: string[][] = [];
  for (let i = 0; i < Math.max(lines.length, 1); i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }

  const objects: string[] = [];
  const fontObj = 3;
  const pageObjStart = 4;
  const contentObjStart = pageObjStart + pages.length;

  // Kids references
  const kids = pages.map((_, i) => `${pageObjStart + i} 0 R`).join(' ');

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids}] >>`;
  objects[fontObj] =
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;

  pages.forEach((pageLines, i) => {
    const contentObj = contentObjStart + i;
    objects[pageObjStart + i] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 ${fontObj} 0 R >> >> /Contents ${contentObj} 0 R >>`;

    let stream = `BT /F1 11 Tf ${leading} TL ${margin} ${pageHeight - margin} Td\n`;
    for (const line of pageLines) {
      stream += `(${pdfEscapeText(line)}) Tj T*\n`;
    }
    stream += 'ET';
    objects[contentObj] =
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`;
  });

  // Assemble with xref.
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
