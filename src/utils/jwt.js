import jwtDecode from 'jwt-decode';
import axios from './axios';

// Need methods like - TokenValidation, SetSession, Get Token, Token Expiration

const isTokenValid = async (accessToken) => {
  if (!accessToken) {
    return false;
  }
  const decodedToken = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  console.log('decoded Token', decodedToken);

  return decodedToken.exp > currentTime;
};

// Current time 1689339789.71
// Expiry time 1689382989
//  Time left 43199.28999996185

const handleTokenExpired = async (exp) => {
  const currentTime = Date.now();

  const timeLeft = exp * 1000 - currentTime;

  setTimeout(() => {
    // alert('Your session is expired.');
    // Run logout code
    localStorage.removeItem('accessToken');
    window.location.reload();
  }, timeLeft);
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);

    // Use below code to setup axios header
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    console.log('EXP', exp);
    handleTokenExpired(exp);
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

export { isTokenValid, setSession };
