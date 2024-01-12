import React from 'react';

import defaultLogo from '../assets/AVrseLogo.png';
import { useConfig } from '../hooks/useConfig';

const Logo = () => {
  const config = useConfig();
  const { data } = config;
  let logo = '';
  if (data && data?.clientName !== 'FrontEndFallbackConfig') {
    logo = import.meta.env.VITE_BASE_URL + data.clientLogo;
  } else {
    logo = defaultLogo;
  }

  return <img alt="avLogo" src={logo} />;
};

export default Logo;
