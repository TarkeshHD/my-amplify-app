import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import axios from '../utils/axios';
import { isTokenValid, setSession } from '../utils/jwt';

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
});

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, setState] = useState(initialState);
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

          setState((prev) => ({ ...prev, isAuthenticated: true, isInitialized: true, user: response.user }));
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
      setState((prev) => ({ ...prev, isAuthenticated: true, isInitialized: true, user: response.user }));

      console.log('Login');
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
