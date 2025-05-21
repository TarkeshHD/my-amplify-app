import React, { useState, useCallback } from 'react';
import { Tabs, Tab, Box, Button } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import _ from 'lodash';
import UpcomingSession from '../../components/session/UpcomingSession';
import Analytics from '../../components/analytics/Analytics';
import ModuleAnalytics from '../../components/analytics/ModuleAnalytics';
import { useConfig } from '../../hooks/useConfig';
import { useAuth } from '../../hooks/useAuth';
import DomainAnalytics from '../../components/analytics/DomainAnalytics';
import DepartmentAnalytics from '../../components/analytics/DepartmentAnalytics';
import ReportPDF from '../../components/analytics/ReportPDF';

export default function AdminDashboard() {
  const config = useConfig();
  const { data } = config;
  const [activeTab, setActiveTab] = React.useState('overall');
  const { user } = useAuth();

  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalVRSessionInMilliseconds: 0,
    incompletionPercentage: 0,
    passPercentage: 0,
    top5FailureMoments: [],
    deviceCount: 0,
  });

  const updateAnalyticsData = useCallback((data) => {
    setAnalyticsData(data);
  }, []);

  const tabs = [
    { id: 'overall', label: 'Overall' },
    { id: 'module', label: 'Module Analytics' },
  ];

  if (user.role === 'admin') {
    tabs.push({ id: 'department', label: 'Department Analytics' });
  } else {
    tabs.push({ id: 'domain', label: 'Domain Analytics' });
    tabs.push({ id: 'department', label: 'Department Analytics' });
  }

  const renderTabContent = (updateAnalyticsData) => {
    try {
      switch (activeTab) {
        case 'overall':
          return (
            <>
              {data?.features?.schedule?.state === 'on' && <UpcomingSession />}
              <Analytics type={activeTab} updateAnalyticsData={updateAnalyticsData} />
            </>
          );
        case 'module':
          return <ModuleAnalytics />;
        case 'domain':
          return <DomainAnalytics />;
        case 'department':
          return <DepartmentAnalytics />;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return null;
    }
  };

  return (
    <div>
      <Box sx={{ mb: 3, mx: 2 }}>
        <Box sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', mb: 3 }}>
          <h1>Analytics</h1>
          {!data?.freeTrial && analyticsData?.totalUsers !== 0 && (
            <PDFDownloadLink
              document={
                <ReportPDF
                  totalUsers={analyticsData.totalUsers}
                  totalVRSessionInMilliseconds={analyticsData.totalVRSessionInMilliseconds}
                  incompletionPercentage={analyticsData.incompletionPercentage}
                  passPercentage={analyticsData.passPercentage}
                  moments={analyticsData.top5FailureMoments.slice(0, 2)}
                  deviceCount={analyticsData.deviceCount}
                />
              }
              fileName="autovrse_training_report.pdf"
            >
              {({ loading }) => (loading ? 'Loading...' : <Button variant="contained">Generate report</Button>)}
            </PDFDownloadLink>
          )}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} aria-label="dashboard tabs">
            {tabs.map((tab) => (
              <Tab key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </Tabs>
        </Box>
      </Box>
      {renderTabContent(updateAnalyticsData)}
    </div>
  );
}
