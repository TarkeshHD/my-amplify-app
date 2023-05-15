import jwtDecode from 'jwt-decode';

// Need methods like - TokenValidation, SetSession, Get Token, Token Expiration

const isTokenValid = async (accessToken) => {
  if (!accessToken) {
    return false;
  }
  const decodedToken = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;

  return decodedToken.exp > currentTime;
};

const handleTokenExpired = async (exp) => {
  const currentTime = Date.now();

  const timeLeft = exp - currentTime / 1000;

  setTimeout(() => {
    alert('Your session is expired.');
    // Run logout code
    localStorage.removeItem('accessToken');
    window.location.reload();
  }, timeLeft);
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);

    // Use below code to setup axios header
    // axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // This function below will handle when token is expired
    const { exp } = jwtDecode(accessToken); // ~3 days by minimals server
    handleTokenExpired(exp);
  } else {
    localStorage.removeItem('accessToken');
    // delete axios.defaults.headers.common.Authorization;
  }
};

export { isTokenValid, setSession };
