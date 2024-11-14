import React from 'react';

import defaultLogo from '../assets/AVrseLogo.png';
import { useConfig } from '../hooks/useConfig';

const Logo = () => {
  const config = useConfig();
  const { data } = config;
  const height = data?.clientLogoHeight || 100;
  let logo = '';
  if (data && data?.clientName !== 'FrontEndFallbackConfig') {
    logo = import.meta.env.VITE_BASE_URL + data.clientLogo;
  } else {
    logo = defaultLogo;
  }

  return (
    <img
      onClick={() => {
        window.location.href = '/';
      }}
      alt="avLogo"
      src={logo}
      height={height}
    />
  );
};

export default Logo;
