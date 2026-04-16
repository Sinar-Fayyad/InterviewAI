import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// ATS-friendly styles for cover letter
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  senderInfo: {
    marginBottom: 20,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1a1a1a',
  },
  senderContact: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#555',
    marginBottom: 20,
  },
  recipientInfo: {
    marginBottom: 20,
  },
  recipientLine: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  subject: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  salutation: {
    fontSize: 11,
    marginBottom: 15,
    color: '#333',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 12,
    color: '#333',
    textAlign: 'justify',
  },
  closing: {
    fontSize: 11,
    marginTop: 20,
    marginBottom: 5,
    color: '#333',
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#1a1a1a',
  },
});

export interface CoverLetterData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderLocation: string;
  recipientName?: string;
  companyName: string;
  jobTitle: string;
  platform?: string;
  date: string;
  paragraphs: string[];
}

interface CoverLetterDocumentProps {
  data: CoverLetterData;
}

export const CoverLetterDocument = ({ data }: CoverLetterDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Sender Information */}
      <View style={styles.senderInfo}>
        <Text style={styles.senderName}>{data.senderName || 'Your Name'}</Text>
        {data.senderEmail && <Text style={styles.senderContact}>{data.senderEmail}</Text>}
        {data.senderPhone && <Text style={styles.senderContact}>{data.senderPhone}</Text>}
        {data.senderLocation && <Text style={styles.senderContact}>{data.senderLocation}</Text>}
      </View>

      {/* Date */}
      <Text style={styles.date}>{data.date}</Text>

      {/* Recipient Information */}
      <View style={styles.recipientInfo}>
        {data.recipientName && <Text style={styles.recipientLine}>{data.recipientName}</Text>}
        <Text style={styles.recipientLine}>{data.companyName}</Text>
      </View>

      {/* Subject Line */}
      <Text style={styles.subject}>
        Re: Application for {data.jobTitle} Position
      </Text>

      {/* Salutation */}
      <Text style={styles.salutation}>
        Dear {data.recipientName || 'Hiring Manager'},
      </Text>

      {/* Body Paragraphs */}
      {data.paragraphs.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>{paragraph}</Text>
      ))}

      {/* Closing */}
      <Text style={styles.closing}>Sincerely,</Text>
      <Text style={styles.signature}>{data.senderName}</Text>
    </Page>
  </Document>
);

export const generateCoverLetterPdf = async (data: CoverLetterData): Promise<Blob> => {
  const blob = await pdf(<CoverLetterDocument data={data} />).toBlob();
  return blob;
};

export const downloadCoverLetterPdf = async (data: CoverLetterData, filename: string = 'cover-letter.pdf') => {
  const blob = await generateCoverLetterPdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
