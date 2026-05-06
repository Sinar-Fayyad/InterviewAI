import { Card } from "@/components/ui/card";
import type { CoverLetterData } from "./CoverLetterDocument";

interface CoverLetterPreviewProps {
  data: CoverLetterData;
}

// Checks whether a string looks like a real location (e.g. "Beirut, Lebanon")
const isRealLocation = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed.includes(",")) return false;
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => /[a-zA-Z]{2,}/.test(p));
};

export const CoverLetterPreview = ({ data }: CoverLetterPreviewProps) => {
  const content = data?.content?.trim() || "";

  if (!content) {
    return (
      <Card className="bg-white text-gray-900 p-10 shadow-lg border border-border max-w-[800px] mx-auto min-h-[600px]">
        <div className="text-center text-gray-500 py-12">
          <p>Your cover letter content will appear here after generation.</p>
        </div>
      </Card>
    );
  }

  const lines = content.split("\n");

  // ── Parse header (first line): "Full Name | email | phone | ..." ──
  const firstLine = lines[0] || "";
  const headerParts = firstLine.split("|").map((p) => p.trim()).filter(Boolean);
  const name = headerParts[0] || "";
  const contactInfo = headerParts.slice(1).join(" | ");

  // ── Scan lines 1–6 for an optional date and/or real location ──
  let dateLine = "";
  let locationLine = "";
  let bodyStartIndex = 1;

  for (let i = 1; i < Math.min(lines.length, 7); i++) {
    const line = lines[i].trim();
    if (!line) {
      bodyStartIndex = i + 1;
      continue;
    }

    const isDate =
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i.test(line) ||
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(line);

    if (isDate && !dateLine) {
      dateLine = line;
      bodyStartIndex = i + 1;
      continue;
    }

    if (!locationLine && isRealLocation(line)) {
      locationLine = line;
      bodyStartIndex = i + 1;
      continue;
    }

    // First non-empty line that is neither date nor location → body starts here
    break;
  }

  const body = lines.slice(bodyStartIndex).join("\n");

  return (
    <Card className="bg-white text-gray-900 p-10 shadow-lg border border-border max-w-[800px] mx-auto min-h-[600px]">
      {/* ── Name ── */}
      {name && (
        <p className="text-center text-xl font-bold text-gray-900 mb-1">
          {name}
        </p>
      )}

      {/* ── Contact info ── */}
      {contactInfo && (
        <p className="text-center text-xs text-gray-500 mb-4">
          {contactInfo}
        </p>
      )}

      {/* ── Divider ── */}
      {(name || contactInfo) && <hr className="border-gray-200 mb-4" />}

      {/* ── Location (left) · Date (right) ── */}
      {(locationLine || dateLine) && (
        <div className="flex justify-between items-start mb-4 text-sm text-gray-500">
          {/* Only shown when it's a verified real location */}
          <span>{locationLine}</span>
          <span>{dateLine}</span>
        </div>
      )}

      {/* ── Body ── */}
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
        {body}
      </div>
    </Card>
  );
};