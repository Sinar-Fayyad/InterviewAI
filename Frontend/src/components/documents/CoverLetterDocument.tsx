import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 50,
    fontFamily: "Helvetica",
  },
  content: {
    width: "100%",
  },
  name: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    textAlign: "center",
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 10,
    color: "#6b7280",
  },
  line: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
    marginBottom: 4,
  },
});

// ─── Helpers (mirrors CoverLetterPreview logic) ───────────────────────────────
const isRealLocation = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed.includes(",")) return false;
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 && parts.every((p) => /[a-zA-Z]{2,}/.test(p));
};

const parseCoverLetter = (content: string) => {
  const lines = content.split("\n");
  const firstLine = lines[0] || "";

  const headerParts = firstLine.split("|").map((p) => p.trim()).filter(Boolean);
  const name = headerParts[0] || "";
  const contactInfo = headerParts.slice(1).join(" | ");

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

    break;
  }

  const bodyLines = lines.slice(bodyStartIndex).map((l) => l.trimEnd());

  return { name, contactInfo, dateLine, locationLine, bodyLines };
};
// ─────────────────────────────────────────────────────────────────────────────

export interface CoverLetterData {
  content: string;
}

interface CoverLetterDocumentProps {
  data: CoverLetterData;
}

export const CoverLetterDocument = ({ data }: CoverLetterDocumentProps) => {
  const { name, contactInfo, dateLine, locationLine, bodyLines } =
    parseCoverLetter(data.content);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>

          {/* ── Name ── */}
          {name ? <Text style={styles.name}>{name}</Text> : null}

          {/* ── Contact info ── */}
          {contactInfo ? <Text style={styles.contactInfo}>{contactInfo}</Text> : null}

          {/* ── Divider ── */}
          {(name || contactInfo) ? <View style={styles.divider} /> : null}

          {/* ── Location (left) · Date (right) ── */}
          {(locationLine || dateLine) ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{locationLine}</Text>
              <Text style={styles.metaText}>{dateLine}</Text>
            </View>
          ) : null}

          {/* ── Body ── */}
          {bodyLines.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line || " "}
            </Text>
          ))}

        </View>
      </Page>
    </Document>
  );
};

export const generateCoverLetterPdf = async (
  data: CoverLetterData
): Promise<Blob> => {
  const blob = await pdf(<CoverLetterDocument data={data} />).toBlob();
  return blob;
};

export const downloadCoverLetterPdf = async (
  data: CoverLetterData,
  filename: string = "cover-letter.pdf"
) => {
  const blob = await generateCoverLetterPdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};