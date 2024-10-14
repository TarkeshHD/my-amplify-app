import React from 'react';
import UpcomingSession from '../../components/session/UpcomingSession';
import Analytics from '../../components/analytics/Analytics';
import { useConfig } from '../../hooks/useConfig';

export default function AdminDashboard() {
  const config = useConfig();
  const { data } = config;
  return (
    <>
      {data?.features?.schedule?.state === 'on' && <UpcomingSession />}
      <Analytics />
    </>
  );
}
