export const environment = {
  production: true,
  apiUrl: `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3000/api` // Dynamic API URL based on hostname
};
