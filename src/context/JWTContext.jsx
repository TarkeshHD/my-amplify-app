import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import axios from '../utils/axios';
import { isTokenValid, setSession } from '../utils/jwt';
import { useNavigate } from 'react-router-dom';
import { setToastWithExpiration } from '../utils/utils';

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
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
  // State must have fields like isAuthenticated, user etc.

  // On first render check if we have a token already, validate user and login
  useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        setSession(token);
        if (token && isTokenValid(token)) {
          // Make Login/Authentication API call to check token if we have token
          let response = {};

          const res = await axios.post('/auth/login/token', {});

          response = res.data.details;

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
  }, []);

  // Type -> Pass what type of authentication API needs to be called!
  const login = async (data, type = 'BasicAuth') => {
    try {
      // Make Login API call

      let response = {};
      if (type === 'BasicAuth') {
        const res = await axios.post('/auth/login/basic', data);
        response = res.data.details;
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
        email: email,
        name: name,
        inviteLink: inviteLink,
      });

      response = res.data.details;

      setToastWithExpiration(res.data.message, 5000);
      setSession(response.token);
      setState((prev) => ({ ...prev, isAuthenticated: true, isInitialized: true, user: response.user }));
    } catch (error) {
      console.error('SSO login error:', error);
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
      // Remove session
      setSession(null);
      setState((prev) => ({ ...prev, isAuthenticated: false, isInitialized: true, user: null }));
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
