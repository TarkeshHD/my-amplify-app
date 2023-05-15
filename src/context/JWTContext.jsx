import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
        if (token && isTokenValid(token)) {
          // Make Login/Authentication API call to check token if we have token

          const response = {
            name: 'New Login',
            email: 'Autovrse@SomeMail',
          };

          setState((prev) => ({ ...prev, isAuthenticated: true, user: response }));
        } else {
          throw Error('Token is expired or invalid');
        }

        console.log('initialize');
      } catch (error) {
        setState((prev) => ({ ...prev, isAuthenticated: false, user: null }));
        console.log(error);
      }
    };

    initialize();
  }, []);

  const login = async (data) => {
    try {
      const response = {
        name: 'New Login',
        email: 'Autovrse@SomeMail',
      };
      // Make Login API call

      setSession(`Token`);
      setState((prev) => ({ ...prev, isAuthenticated: true, user: response }));

      console.log('Login');
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, user: null }));
      console.log(error);
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
      setState((prev) => ({ ...prev, isAuthenticated: false, user: null }));
      console.log('logout');
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, user: null }));
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
