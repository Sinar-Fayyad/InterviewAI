import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// Register a standard font
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf',
});

// ATS-friendly styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1 solid #333',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a',
  },
  contactInfo: {
    fontSize: 10,
    color: '#555',
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    textTransform: 'uppercase',
    borderBottom: '1 solid #ddd',
    paddingBottom: 3,
  },
  itemContainer: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#555',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 10,
    color: '#444',
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skill: {
    fontSize: 10,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: '3 8',
    borderRadius: 3,
    marginRight: 5,
    marginBottom: 3,
  },
  summary: {
    fontSize: 10,
    color: '#444',
    lineHeight: 1.5,
  },
});

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface CVDocumentProps {
  data: CVData;
}

export const CVDocument = ({ data }: CVDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName || 'Your Name'}</Text>
        {data.email && <Text style={styles.contactInfo}>{data.email}</Text>}
        {data.phone && <Text style={styles.contactInfo}>{data.phone}</Text>}
        {data.location && <Text style={styles.contactInfo}>{data.location}</Text>}
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemSubtitle}>
                {exp.company} | {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
              {exp.description && (
                <Text style={styles.itemDescription}>{exp.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>
                {edu.degree} {edu.field && `in ${edu.field}`}
              </Text>
              <Text style={styles.itemSubtitle}>
                {edu.school} | {edu.startDate} - {edu.endDate || 'Present'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill, index) => (
              <Text key={index} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {data.certifications.map((cert, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{cert.name}</Text>
              <Text style={styles.itemSubtitle}>
                {cert.issuer} {cert.date && `| ${cert.date}`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const generateCVPdf = async (data: CVData): Promise<Blob> => {
  const blob = await pdf(<CVDocument data={data} />).toBlob();
  return blob;
};

export const downloadCVPdf = async (data: CVData, filename: string = 'resume.pdf') => {
  const blob = await generateCVPdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
