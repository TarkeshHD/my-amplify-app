import { Helmet } from 'react-helmet-async';

import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import Analytics from '../components/analytics/Analytics';
import UpcomingSession from '../components/session/UpcomingSession';
import { useEffect } from 'react';
import { displayPendingToast } from '../utils/utils';
import Evaluations from '../pages/Evaluations';

const Page = () => {
  const config = useConfig();
  const { data } = config;

  const auth = useAuth();

  const { user } = useAuth();

  if (user?.role === 'user') {
    // redirect to evaluation page
    return <Evaluations />;
  }

  useEffect(() => {
    displayPendingToast();
  });

  return (
    <>
      <Helmet>
        <title>Sessions and Analytics | VRse Builder</title>
      </Helmet>

      <UpcomingSession />
      <Analytics />
    </>
  );
};

export default Page;
