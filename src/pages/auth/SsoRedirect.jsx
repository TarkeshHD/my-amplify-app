import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { getItemWithExpiration, setToastWithExpiration } from '../../utils/utils';
import { setSession } from '../../utils/jwt';
import { useAuth } from '../../hooks/useAuth';

const Page = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const { loginSSO } = useAuth();

  useEffect(() => {
    async function verifyAndRedirect() {
      const inviteLink = getItemWithExpiration('inviteLink');

      if (isAuthenticated && user?.email) {
        try {
          const email = user.email;
          const name = user.name;

          await loginSSO(email, name, inviteLink);

          navigate('/');
        } catch (error) {
          console.error('Error verifying invite link:', error);
          setToastWithExpiration(error.message, 5000);
          navigate('/auth/login');
          return;
        }
      }
    }

    verifyAndRedirect();
  }, [isAuthenticated, user?.email]);

  // This component doesn't render anything, just performs the logic and redirects
  return null;
};

export default Page;
