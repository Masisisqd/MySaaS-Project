import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface QBRData {
  companyName: string;
  familyName: string;
  creditScore: number;
  period: string;
  financials: {
    grossRevenue: number;
    totalTax: number;
    totalSavings: number;
    operatingExpenses: number;
  };
  compliance: {
    academicHours: number;
    businessHours: number;
    prodigyRatio: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A', // Tailwind blue-900
    paddingBottom: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B', // Tailwind slate-500
    marginTop: 4,
  },
  metadataContainer: {
    alignItems: 'flex-end',
  },
  metadataText: {
    fontSize: 10,
    color: '#475569',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    border: '1px solid #E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: '#334155',
  },
  value: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  highlightedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
  },
  highlightedLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  highlightedValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  ceoLetterContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  ceoLetterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  ceoLetterText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  badgeHonors: {
    backgroundColor: '#DCFCE7', // green-100
    color: '#166534', // green-800
  },
  badgeNotice: {
    backgroundColor: '#FEF3C7', // amber-100
    color: '#92400E', // amber-800
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});

// Format with BWP (P ) prefix
const formatCurrency = (val: number) => `P ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface QBRDocumentProps {
  data: QBRData;
}

export const QBRDocument: React.FC<QBRDocumentProps> = ({ data }) => {
  const { companyName, familyName, creditScore, period, financials, compliance } = data;

  const getLetterText = () => {
    if (creditScore > 750) return "Outstanding operational excellence. Eligible for a Board-approved Dividend.";
    if (creditScore < 500) return "Performance Improvement Plan (PIP) required. Focus on Academic Compliance for Q2.";
    return "Steady performance. Continue optimizing cross-departmental efficiency.";
  };

  const netProfit = financials.grossRevenue - (financials.totalTax + financials.totalSavings + financials.operatingExpenses);
  const isHonors = compliance.prodigyRatio > 1.0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Prodigy Chore Suite</Text>
            <Text style={styles.subtitle}>Q1 2026 Fiscal Report</Text>
          </View>
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>{companyName}</Text>
            <Text style={styles.metadataText}>Period: {period}</Text>
            <Text style={styles.metadataText}>Generated: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Performance</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Gross Revenue (Ledger Activity)</Text>
            <Text style={styles.value}>{formatCurrency(financials.grossRevenue)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Taxes Paid (20%)</Text>
            <Text style={styles.value}>- {formatCurrency(financials.totalTax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Savings (30%)</Text>
            <Text style={styles.value}>- {formatCurrency(financials.totalSavings)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Operating Expenses (Tool Rentals)</Text>
            <Text style={styles.value}>- {formatCurrency(financials.operatingExpenses)}</Text>
          </View>

          <View style={styles.highlightedRow}>
            <Text style={styles.highlightedLabel}>Net Retained Earnings</Text>
            <Text style={styles.highlightedValue}>{formatCurrency(netProfit)}</Text>
          </View>
        </View>

        {/* Academic Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Compliance</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>R&amp;D Hours (Study Time)</Text>
            <Text style={styles.value}>{compliance.academicHours.toFixed(1)} hrs</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Business Hours (Chore Time)</Text>
            <Text style={styles.value}>{compliance.businessHours.toFixed(1)} hrs</Text>
          </View>

          <View style={styles.highlightedRow}>
            <Text style={styles.highlightedLabel}>Prodigy Ratio (Academic / Work)</Text>
            <Text style={styles.highlightedValue}>{compliance.prodigyRatio.toFixed(2)}x</Text>
          </View>
          
          {isHonors && (
            <View style={[styles.badge, styles.badgeHonors]}>
              <Text style={styles.badgeText}>🏅 Honors CEO Status Achieved</Text>
            </View>
          )}
          {!isHonors && (
            <View style={[styles.badge, styles.badgeNotice]}>
              <Text style={styles.badgeText}>⚠️ Target Prodigy Ratio: &gt; 1.0x</Text>
            </View>
          )}
        </View>

        {/* CEO Letter */}
        <View style={styles.ceoLetterContainer}>
          <Text style={styles.ceoLetterTitle}>Letter to the CEO</Text>
          <Text style={styles.ceoLetterText}>Current FICO System Score: {creditScore}</Text>
          <Text style={[styles.ceoLetterText, { marginTop: 8 }]}>
            {getLetterText()}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Certified by the Board of Directors - {familyName} Holdings.
        </Text>
      </Page>
    </Document>
  );
};
