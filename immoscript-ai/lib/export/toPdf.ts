import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { contentToSections } from "./contentToSections";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, fontSize) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export async function buildPdf(type: ContentType, content: unknown, contextLabel: string): Promise<Buffer> {
  const { title, sections } = contentToSections(type, content);

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(lineHeight: number) {
    if (y - lineHeight < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawParagraph(
    text: string,
    { size, bold = false, gray = 0.1, gapAfter = 12 }: { size: number; bold?: boolean; gray?: number; gapAfter?: number }
  ) {
    const activeFont = bold ? boldFont : font;
    for (const line of wrapText(text, activeFont, size, CONTENT_WIDTH)) {
      ensureSpace(size + 4);
      page.drawText(line, { x: MARGIN, y, size, font: activeFont, color: rgb(gray, gray, gray) });
      y -= size + 4;
    }
    y -= gapAfter;
  }

  function drawBullet(text: string, size: number) {
    const lines = wrapText(text, font, size, CONTENT_WIDTH - 14);
    lines.forEach((line, index) => {
      ensureSpace(size + 4);
      page.drawText(index === 0 ? `•  ${line}` : `    ${line}`, { x: MARGIN, y, size, font, color: rgb(0.1, 0.1, 0.1) });
      y -= size + 4;
    });
  }

  drawParagraph(title, { size: 18, bold: true, gapAfter: 4 });
  drawParagraph(`${CONTENT_TYPE_LABELS[type]} · ${contextLabel}`, { size: 10, gray: 0.45, gapAfter: 18 });

  for (const section of sections) {
    if (section.heading) {
      drawParagraph(section.heading, { size: 13, bold: true, gapAfter: 6 });
    }
    for (const paragraph of section.paragraphs ?? []) {
      drawParagraph(paragraph, { size: 11, gapAfter: 10 });
    }
    for (const bullet of section.bullets ?? []) {
      drawBullet(bullet, 11);
    }
    y -= 6;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
