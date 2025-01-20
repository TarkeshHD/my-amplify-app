import { Box, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { LoadingButton } from '@mui/lab';
import { useMsal } from '@azure/msal-react';
import VRIllustration from '../../assets/vr-boy-illustration.svg';
import Logo from '../../components/Logo';
import BaseLoginForm from '../../components/login/BaseLoginForm';
import BasicLoginForm from '../../components/login/BasicLoginForm';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import {
  displayPendingToast,
  getItemWithExpiration,
  setItemWithExpiration,
  setToastWithExpiration,
} from '../../utils/utils';

const Page = () => {
  const config = useConfig();
  const navigate = useNavigate();
  const auth = useAuth();
  const { loginSSO } = useAuth();
  const { instance, accounts } = useMsal();

  const [inviteToken, setInviteToken] = useState('');

  const [method, setMethod] = useState([]);
  const [viewMethod, setViewMethod] = useState('BasicAuth');
  const handleMethodChange = useCallback((event, value) => {
    console.log('here value', value);
    setViewMethod(value);
  }, []);

  useEffect(() => {
    // IIFE to trigger authentication immediately
    (async () => {
      console.log('🚀 Starting authentication process');

      try {
        const setSSOLoginCompleted = sessionStorage.getItem('ssoLoginCompleted');
        if (accounts.length !== 0 && setSSOLoginCompleted === 'true') {
          // Wait for MSAL to be ready

          // If no account is found, trigger login redirect

          // Get user info
          const email = accounts[0]?.username || 'Unknown';
          const name = accounts[0]?.name || 'User';
          const inviteLink = getItemWithExpiration('inviteLink');
          console.log('invite link', inviteLink);

          // Perform SSO login
          await loginSSO(email, name, inviteLink);
          console.log('✅ SSO login successful. Redirecting...');
          navigate('/'); // Redirect after successful login
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        setToastWithExpiration(`Error: ${error.message || 'Something went wrong.'}`, 5000);
        navigate('/auth/login'); // Redirect to login page on error
      }
    })(); // Immediately invoked async function
  }, [accounts, instance]);

  useEffect(() => {
    if (config?.isConfigfileFetched && config?.data?.features?.auth?.types.length > 0) {
      setMethod([config?.data?.features?.auth?.types[0]]);
      setViewMethod(config?.data?.features?.auth?.types[0]);
      // Check if in url ? productAdmin=true is there, if its there make it basicLogin
      if (window.location.search.includes('productAdmin=true')) {
        setMethod(['BasicAuth']);
        setViewMethod('BasicAuth');
      }
    }
  }, [config.isConfigfileFetched]);

  useEffect(() => {
    // IIFE to trigger authentication immediately
    (async () => {
      console.log('🚀 Starting authentication process');

      try {
        if (accounts.length !== 0) {
          // Wait for MSAL to be ready

          // If no account is found, trigger login redirect

          // Get user info
          const email = accounts[0]?.username || 'Unknown';
          const name = accounts[0]?.name || 'User';

          console.log('📧 Email:', email);
          console.log('👤 Name:', name);

          // Perform SSO login
          await loginSSO(email, name);
          console.log('✅ SSO login successful. Redirecting...');
          navigate('/'); // Redirect after successful login
        }
      } catch (error) {
        console.error('❌ Authentication error:', error);
        setToastWithExpiration(`Error: ${error.message || 'Something went wrong.'}`, 5000);
        navigate('/auth/login'); // Redirect to login page on error
      }
    })(); // Immediately invoked async function
  }, [accounts, instance]);

  useEffect(() => {
    displayPendingToast();
    const params = new URLSearchParams(window.location.search);
    setInviteToken(params.get('invite'));
  }, []);

  const { loginWithRedirect } = useAuth0();

  const { user, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      navigate('/');
    }
  }, [user, isAuthenticated]);

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        minHeight: '100vh',
      }}
    >
      <Helmet>
        <title>Login | VRse Builder</title>
      </Helmet>
      <Grid container sx={{ flex: '1 1 auto' }}>
        <Grid
          item
          xs={12}
          lg={6}
          sx={{
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Box
            component="header"
            sx={{
              left: 0,
              p: 3,
              position: 'fixed',
              top: 0,
              width: '100%',
            }}
          >
            <Box
              component={Link}
              href="/"
              sx={{
                display: 'inline-flex',
                height: 32,
                width: 32,
              }}
            >
              <Logo />
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: 'background.paper',
              flex: '1 1 auto',
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                maxWidth: 550,
                px: 3,
                py: '100px',
                width: '100%',
              }}
            >
              <div>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  <Typography variant="h4">Login</Typography>
                  {/* <Typography color="text.secondary" variant="body2">
                    Don&apos;t have an account? &nbsp;
                    <Link component={Link} href="/auth/register" underline="hover" variant="subtitle2">
                      Register
                    </Link>
                  </Typography> */}
                </Stack>
                {config?.isConfigfileFetched && method !== '' ? (
                  <>
                    <Tabs onChange={handleMethodChange} sx={{ mb: 2 }} value={viewMethod}>
                      {config?.data?.features?.auth?.state === 'on' &&
                        method.map((v, i) => <Tab key={i} label={v} value={v} />)}
                    </Tabs>

                    {viewMethod.length !== 0 && getLoginComponents(viewMethod, inviteToken)}
                  </>
                ) : (
                  <Typography variant="body2"> Wait till we get your login type... </Typography>
                )}
              </div>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          lg={6}
          sx={{
            alignItems: 'center',
            background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            '& img': {
              maxWidth: '100%',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography
              align="center"
              color="inherit"
              sx={{
                fontSize: '24px',
                lineHeight: '32px',
                mb: 1,
              }}
              variant="h1"
            >
              Welcome to{' '}
              <Box component="a" sx={{ color: '#15B79E' }} target="_blank">
                VRse Dashboard
              </Box>
            </Typography>
            <Typography align="center" sx={{ mb: 3 }} variant="subtitle1">
              A one-in-all platform solution for your VR Training modules.
            </Typography>
            <img alt="vrBoy" src={VRIllustration} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const getLoginComponents = (value, inviteToken) => {
  const { loginWithRedirect } = useAuth0();
  const { instance } = useMsal();
  console.log('value', value);
  switch (value) {
    case 'BasicAuth':
      return <BasicLoginForm />;
    case 'DomainAuth':
      return <BasicLoginForm />;
    case 'SimpleAuthDevice':
      return <BaseLoginForm />;
    case 'TwoFactorAuth':
      return <BaseLoginForm />;
    case 'SsoAuth':
      return (
        <LoadingButton
          // loading={isSubmitting}

          size="medium"
          sx={{ mt: 1 }}
          type="submit"
          variant="outlined"
          onClick={() => {
            setItemWithExpiration('inviteLink', inviteToken, 1000 * 60 * 5);
            // Expiration with 5 minutes for testing
            loginWithRedirect();
          }}
        >
          Log In / Sign Up Using OKTA
        </LoadingButton>
      );
    case 'AzureAdAuth': // New case for Azure AD
      return (
        <LoadingButton
          size="medium"
          sx={{ mt: 1 }}
          type="submit"
          variant="outlined"
          onClick={() => {
            setItemWithExpiration('inviteLink', inviteToken, 1000 * 60 * 5); // Expiration with 5 minutes
            instance.loginRedirect({
              scopes: ['User.Read', 'openid', 'profile', 'email'], // Permissions for profile access
              redirectUri: `${import.meta.env.VITE_SSO_OKTA_REDIRECT_URI}`, // Redirect URI after login
            });
          }}
        >
          Log In / Sign Up Using Microsoft Azure AD
        </LoadingButton>
      );
    default:
      return <BasicLoginForm />;
  }
};

export default Page;
