import { useContext } from 'react';

import { SharedDataContext } from '../context/SharedDataContext';

export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (!context) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
};
