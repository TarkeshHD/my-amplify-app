import React from 'react';
import { useAuth } from '../../hooks/useAuth';

// Import the SSO handler component

const Page = () => {
  sessionStorage.setItem('ssoLoginCompleted', true);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Authenticating...</div>
      {/* Calling the reusable component */}
    </div>
  );
};

export default Page;
