import { useContext } from 'react';
import { ConfigContext } from '../context/ConfigurationContext';

export const useConfig = () => useContext(ConfigContext);
