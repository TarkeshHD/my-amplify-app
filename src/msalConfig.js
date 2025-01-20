import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: `${import.meta.env.VITE_AZ_CLIENT_ID}`, // Application (client) ID
    authority: `https://login.microsoftonline.com/af8e89a3-d9ac-422f-ad06-cc4eb4214314`, // Your Azure tenant ID
    redirectUri: `${import.meta.env.VITE_SSO_OKTA_REDIRECT_URI}`, // Redirect URI
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
