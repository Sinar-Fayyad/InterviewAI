import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#111111',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contactInfo: {
    fontSize: 10,
    color: '#555555',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottom: '1 solid #cccccc',
    paddingBottom: 3,
    marginBottom: 8,
  },
  itemContainer: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 3,
  },
  itemTitlePlain: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: 'row',
    marginTop: 2,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 10,
    color: '#444444',
    marginRight: 4,
    lineHeight: 1.4,
  },
  bulletText: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.4,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skill: {
    fontSize: 10,
    color: '#333333',
    backgroundColor: '#f0f0f0',
    padding: '3 8',
    borderRadius: 3,
    marginRight: 5,
    marginBottom: 3,
  },
  summary: {
    fontSize: 10,
    color: '#444444',
    lineHeight: 1.5,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toBullets = (description: string[] | string): string[] => {
  if (Array.isArray(description)) {
    return description.map((d) => d.trim()).filter(Boolean);
  }
  return description
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);
};

const ensurePeriod = (text: string) =>
  text.endsWith(".") ? text : `${text}.`;
// ─────────────────────────────────────────────────────────────────────────────

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: {
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string[] | string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }[];
}

interface CVDocumentProps {
  data: CVData;
}

export const CVDocument = ({ data }: CVDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {data.email ? <Text style={styles.contactInfo}>{data.email}</Text> : null}
          {data.phone ? <Text style={styles.contactInfo}>• {data.phone}</Text> : null}
          {data.location ? <Text style={styles.contactInfo}>• {data.location}</Text> : null}
        </View>
      </View>

      {/* ── Summary ── */}
      {data.summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>
      ) : null}

      {/* ── Experience ── */}
      {data.experience && data.experience.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemSubtitle}>
                {exp.company} | {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
              {exp.description
                ? toBullets(exp.description).map((item, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{ensurePeriod(item)}</Text>
                    </View>
                  ))
                : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Education ── */}
      {data.education && data.education.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.itemContainer}>
              {(edu.degree || edu.field) ? (
                <Text style={styles.itemTitle}>
                  {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                </Text>
              ) : null}
              <Text style={(edu.degree || edu.field) ? styles.itemSubtitle : styles.itemTitlePlain}>
                {[edu.school, `${edu.startDate} - ${edu.endDate || 'Present'}`]
                  .filter(Boolean)
                  .join(' | ')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Skills ── */}
      {data.skills && data.skills.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill, index) => (
              <Text key={index} style={styles.skill}>{skill}</Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* ── Certifications ── */}
      {data.certifications && data.certifications.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {data.certifications.map((cert, index) => (
            <View key={index} style={styles.itemContainer}>
              {(cert.name || cert.issuer) ? (
                <Text style={styles.itemTitle}>{cert.name || cert.issuer}</Text>
              ) : null}
              {cert.name && (cert.issuer || cert.date) ? (
                <Text style={styles.itemSubtitle}>
                  {[cert.issuer, cert.date].filter(Boolean).join(' | ')}
                </Text>
              ) : null}
              {!cert.name && !cert.issuer && cert.date ? (
                <Text style={styles.itemSubtitle}>{cert.date}</Text>
              ) : null}
              {cert.description
                ? cert.description
                    .split(".")
                    .map((d) => d.trim())
                    .filter(Boolean)
                    .map((item, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{item}.</Text>
                      </View>
                    ))
                : null}
            </View>
          ))}
        </View>
      ) : null}

    </Page>
  </Document>
);

export const generateCVPdf = async (data: CVData): Promise<Blob> => {
  const blob = await pdf(<CVDocument data={data} />).toBlob();
  return blob;
};

export const downloadCVPdf = async (
  data: CVData,
  filename: string = 'resume.pdf'
) => {
  const blob = await generateCVPdf(data);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};