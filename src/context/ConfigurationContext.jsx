import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
import BaseConfig from '../utils/BaseConfig.json';

import { toast } from 'react-toastify';
import axios from '../utils/axios';

const initialState = {
  data: BaseConfig,
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
    let responses = BaseConfig;
    try {
      // Use some method of authorization to fetch this configuration ??

      const response = await axios.get('/config');

      console.log('Response', response?.data?.details);

      // If the response doesn't have the required fields, use the default config file

      responses = response?.data?.details || BaseConfig;
    } catch (error) {
      responses = BaseConfig;
      toast(`Please reload, ${error.message || 'Failed to fetch configuration'}`);
      console.log(error);
    } finally {
      setState((prev) => ({ ...prev, isConfigfileFetched: true, data: responses }));
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

// TypeError: Cannot read properties of undefined (reading 'dark')
