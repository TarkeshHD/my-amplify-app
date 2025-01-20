import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import axios from '../utils/axios';
import { isTokenValid, setSession } from '../utils/jwt';
import { setToastWithExpiration } from '../utils/utils';
import { useConfig } from '../hooks/useConfig';

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  ssoLoginCompleted: false,
  permissions: [],
};

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  loginSSO: () => Promise.resolve(),
});

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);
  const navigate = useNavigate();
  const { data: configData } = useConfig();
  // State must have fields like isAuthenticated, user etc.

  // On first render check if we have a token already, validate user and login
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing Auth Context');
        const token = localStorage.getItem('accessToken');
        setSession(token);
        console.log('Token:', token);
        if (token && isTokenValid(token)) {
          // Make Login/Authentication API call to check token if we have token
          let response = {};

          const res = await axios.post('/auth/login/token', {});

          response = res.data.details;

          if (configData?.freeTrial && response?.user?.role !== 'productAdmin') {
            console.log('Free Trial User');
            response.user.role = 'superAdmin';
          }

          setState((prev) => ({
            ...prev,
            isAuthenticated: true,
            isInitialized: true,
            user: response.user,
            permissions: response.permissions,
          }));
        } else {
          setSession(null);
          setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
        }
      } catch (error) {
        setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
        console.log(error);
      }
    };

    initialize();
  }, [configData]);

  // Type -> Pass what type of authentication API needs to be called!
  const login = async (data, type = 'BasicAuth') => {
    try {
      // Make Login API call

      let response = {};
      if (type === 'BasicAuth') {
        const res = await axios.post('/auth/login/basic', data);
        response = res.data.details;
      }

      if (configData?.freeTrial) {
        response.user.role = 'superAdmin';

        if (response?.user?.hasRequestedAccountUpgrade) {
          localStorage.setItem('hasRequestedAccountUpgrade', true);
        }
      }

      setSession(response.token);
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isInitialized: true,
        user: response.user,
        permissions: response.permissions,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
      console.log(error.message);
      throw error;
    }
  };

  const loginSSO = async (email, name, inviteLink) => {
    try {
      let response = {};
      const res = await axios.post('/auth/login/sso', {
        email,
        name,
        inviteLink,
      });

      response = res.data.details;
      console.log('SSO login response:', response);
      sessionStorage.setItem('ssoLoginCompleted', true);

      setSession(response.token);
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isInitialized: true,
        user: response.user,
        permissions: response.permissions,
      }));
      setToastWithExpiration(res.data.message, 5000);
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
      console.log(error.message);
      throw error;
    }
  };

  const register = async () => {
    try {
      const response = {
        name: 'New Login',
        email: 'Autovrse@SomeMail',
      };
      // Make Register API call

      setSession(`Token`);
      setState((prev) => ({ ...prev, isAuthenticated: true, user: response }));
      console.log('Register');
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, user: null }));
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      if (configData?.features?.auth?.types[0] === 'AzureAdAuth') {
        console.log('hereee logout');
        // const { instance } = useMsal();
        // instance.logoutRedirect();
      }
      // Remove session
      setSession(null);
      sessionStorage.setItem('ssoLoginCompleted', false);

      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isInitialized: true,
        ssoLoginCompleted: false,
        permissions: [],
        user: null,
      }));
      console.log('logout');
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
      console.log(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        register,
        loginSSO,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
