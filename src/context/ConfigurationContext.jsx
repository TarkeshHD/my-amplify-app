import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import BaseConfig from '../utils/BaseConfig.json';

const initialState = {
  data: null,
  isConfigfileFetched: false,
};

const ConfigContext = createContext({
  ...initialState,

  getConfiguration: () => Promise.resolve(),
});

ConfigProvider.propTypes = {
  children: PropTypes.node,
};

function ConfigProvider({ children }) {
  const [state, setState] = useState(initialState);
  // State must have fields like isAuthenticated, user etc.

  // On first render fetch the file
  useEffect(() => {
    getConfiguration();
  }, []);

  const getConfiguration = async () => {
    try {
      // Use some method of authorization to fetch this configuration ??

      const response = BaseConfig;

      // Make API call and set Response

      setState((prev) => ({ ...prev, isConfigfileFetched: true, data: response }));

      console.log('Login');
    } catch (error) {
      setState((prev) => ({ ...prev, isAuthenticated: false, data: null }));
      console.log(error);
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        ...state,
        getConfiguration,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigContext, ConfigProvider };
