import React from 'react';

import { useConfig } from '../hooks/useConfig';

const Logo = () => {
  const config = useConfig();
  const {
    data: { clientLogo: logo },
  } = config;

  return <img alt="avLogo" src={logo} />;
};

export default Logo;
