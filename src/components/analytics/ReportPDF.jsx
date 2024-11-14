import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import { millisecondsToHours } from '../../utils/utils';

Font.register({ family: 'Helvetica-Bold' });
Font.register({ family: 'Helvetica' });

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1e1b4b',
    margin: -30,
    marginBottom: 10,
    padding: 20,
    paddingBottom: 10,
  },
  headerDate: {
    color: '#cbd5e1',
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 20,
  },
  headerCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  companyInfo: {
    marginLeft: 15,
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionNumber: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: 5,
    borderRadius: 6,
    fontSize: 10,
    marginRight: 10,
  },
  sectionTitle: {
    color: '#1e293b',
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
  },
  sectionContent: {
    color: '#475569',
    fontFamily: 'Helvetica',
    fontSize: 10,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 93,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#BFD8F0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  statValue: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#475569',
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginTop: 2,
  },
  statDescription: {
    color: '#6C6C76',
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  focusAreasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusArea: {
    backgroundColor: '#F1F5FA',
    borderRadius: 6,
    padding: 10,
    width: '48%',
  },
  focusAreaText: {
    color: '#334155',
    fontSize: 10,
  },
});

const ReportPDF = (props) => {
  const {
    totalUsers,
    totalVRSessionInMilliseconds,
    incompletionPercentage,
    passPercentage,
    moments = [],
    deviceCount,
  } = props;

  const averageVRSessionPerUser = Math.ceil(millisecondsToHours(totalVRSessionInMilliseconds) / totalUsers);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerDate}>{moment().format('MMMM Do YYYY, h:mm a').toString()}</Text>
            <View style={styles.headerCompany}>
              <Image style={styles.companyIcon} source="../../assets/AVrseLogo.png" />
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>AutoVRse</Text>
              </View>
            </View>
          </View>

          <Text style={styles.title}>VR Training Report</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>

          <Text style={styles.sectionContent}>
            Comprehensive analysis of our VR safety training program, highlighting key metrics and performance
            indicators across all departments.
          </Text>

          <View style={styles.statsGrid}>
            {[
              {
                value: totalUsers.toLocaleString(),
                label: 'Active Participants',
                description: 'Total number of employees engaged in VR training modules.',
              },
              {
                value: `${averageVRSessionPerUser}h`,
                label: 'Average Session Time',
                description: 'Time invested per user in practicing safety scenarios and navigating common hazards.',
              },
              {
                value: `${Math.ceil(100 - incompletionPercentage)}%`,
                label: 'Program Completion',
                description: 'Successfully completed and passed the VR training evaluations.',
              },
              {
                value: deviceCount,
                label: 'Active Devices',
                description: 'VR headsets deployed across training facilities.',
              },
            ].map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <View style={styles.statHeader}>
                    <View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.statDescription}>{stat.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Training Outcomes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Training Outcomes</Text>
          </View>

          <View style={styles.statsGrid}>
            {[
              {
                value: `${passPercentage}%`,
                label: 'Success Rate',
                description: 'Successfully completed and passed the VR training evaluations.',
              },
              {
                value: `${Math.ceil(100 - passPercentage)}%`,
                label: 'Requiring Review',
                description: 'Attempted but did not achieve a passing score in the evaluations.',
              },
              {
                value: `${Math.ceil(incompletionPercentage)}%`,
                label: 'Incompletion',
                description: 'Have not completed the full training program.',
              },
            ].map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statCardInner}>
                  <View style={styles.statHeader}>
                    <View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.statDescription}>{stat.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Key Focus Areas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Key Focus Areas (Top Failing Moments)</Text>
          </View>

          <View style={styles.focusAreasGrid}>
            {moments.map((moment, idx) => (
              <View key={idx} style={styles.focusArea}>
                <Text style={styles.focusAreaText}>{moment.momentName}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

ReportPDF.propTypes = {
  totalUsers: PropTypes.number.isRequired,
  totalVRSessionInMilliseconds: PropTypes.number.isRequired,
  incompletionPercentage: PropTypes.number.isRequired,
  passPercentage: PropTypes.number.isRequired,
  moments: PropTypes.array.isRequired,
  deviceCount: PropTypes.number.isRequired,
};

export default ReportPDF;
