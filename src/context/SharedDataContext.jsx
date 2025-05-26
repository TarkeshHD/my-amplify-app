import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { setSession } from '../utils/jwt';
import { useAuth } from '../hooks/useAuth';

const SharedDataContext = React.createContext();

const SharedDataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [domains, setDomains] = useState([]);
  const [modules, setModules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    setSession(localStorage.getItem('accessToken'));
    try {
      const [domainsResponse, modulesResponse, departmentsResponse] = await Promise.all([
        axios.get('/domain/all'),
        axios.get('/module/all', { params: { archived: true } }),
        axios.get('/department/all'),
      ]);
      setDomains(domainsResponse?.data?.details);
      setModules(modulesResponse?.data?.modules?.docs);
      setDepartments(departmentsResponse?.data?.departments?.docs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const contextValue = {
    domains,
    modules,
    departments,
    loading,
    fetchAllData,
  };

  return <SharedDataContext.Provider value={contextValue}>{children}</SharedDataContext.Provider>;
};

export { SharedDataProvider, SharedDataContext };
