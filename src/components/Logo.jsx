import React from 'react';

import { useConfig } from '../hooks/useConfig';

const Logo = () => {
  const config = useConfig();
  let {
    data: { clientLogo: logo },
  } = config;

  logo = import.meta.env.VITE_BASE_URL + logo;

  return <img alt="avLogo" src={logo} />;
};

export default Logo;
