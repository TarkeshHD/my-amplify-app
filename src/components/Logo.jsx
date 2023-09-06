import React from 'react';

import { useConfig } from '../hooks/useConfig';
import defaultLogo from '../assets/AVrseLogo.png';

const Logo = () => {
  const config = useConfig();
  const { data } = config;
  let logo = '';

  if (data?.clientName !== 'AutovrseTest') {
    logo = import.meta.env.VITE_BASE_URL + data.clientLogo;
  } else {
    logo = defaultLogo;
  }
  console.log(logo);

  return <img alt="avLogo" src={logo} />;
};

export default Logo;
