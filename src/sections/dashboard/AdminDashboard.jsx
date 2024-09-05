import React from 'react';
import UpcomingSession from '../../components/session/UpcomingSession';
import Analytics from '../../components/analytics/Analytics';

export default function AdminDashboard() {
  return (
    <>
      <UpcomingSession />
      <Analytics />
    </>
  );
}
