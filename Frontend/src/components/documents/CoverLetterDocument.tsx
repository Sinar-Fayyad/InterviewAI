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
  line: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1a1a1a",
    marginBottom: 4,
  },
});

export interface CoverLetterData {
  content: string;
}

interface CoverLetterDocumentProps {
  data: CoverLetterData;
}

export const CoverLetterDocument = ({ data }: CoverLetterDocumentProps) => {
  const lines = data.content
    .split("\n")
    .map((line) => line.trimEnd());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          {lines.map((line, index) => (
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
}