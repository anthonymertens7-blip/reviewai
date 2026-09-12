import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { contentToSections } from "./contentToSections";
import { CONTENT_TYPE_LABELS } from "@/lib/ai/labels";
import type { ContentType } from "@/lib/ai/types";

export async function buildDocx(type: ContentType, content: unknown, contextLabel: string): Promise<Buffer> {
  const { title, sections } = contentToSections(type, content);

  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({
      children: [new TextRun({ text: `${CONTENT_TYPE_LABELS[type]} · ${contextLabel}`, italics: true, color: "666666" })],
    }),
    new Paragraph({ text: "" }),
  ];

  for (const section of sections) {
    if (section.heading) {
      children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_2 }));
    }
    for (const paragraph of section.paragraphs ?? []) {
      children.push(new Paragraph({ text: paragraph }));
    }
    for (const bullet of section.bullets ?? []) {
      children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
    }
    children.push(new Paragraph({ text: "" }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
