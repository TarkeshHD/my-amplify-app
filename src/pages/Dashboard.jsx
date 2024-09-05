import { Helmet } from 'react-helmet-async';

import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import Analytics from '../components/analytics/Analytics';
import UpcomingSession from '../components/session/UpcomingSession';
import { useEffect } from 'react';
import { displayPendingToast } from '../utils/utils';
import Evaluations from '../pages/Evaluations';
import AdminDashboard from '../sections/dashboard/AdminDashboard';
import TraineeDashboard from '../sections/dashboard/TraineeDashboard';

const Page = () => {
  const config = useConfig();
  const { data } = config;

  const auth = useAuth();

  const { user } = useAuth();

  useEffect(() => {
    displayPendingToast();
  });

  return (
    <>
      <Helmet>
        <title>Sessions and Analytics | VRse Builder</title>
      </Helmet>
      <RoleBasedDashboard user={user?.role} />
    </>
  );
};

const RoleBasedDashboard = ({ user }) => {
  switch (user) {
    case 'user':
      return <TraineeDashboard />;

    default:
      return <AdminDashboard />;
  }
};

export default Page;
