import { Helmet } from 'react-helmet-async';

import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import Analytics from '../components/analytics/Analytics';
import UpcomingSession from '../components/session/UpcomingSession';

const Page = () => {
  const config = useConfig();
  const { data } = config;

  const auth = useAuth();

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
