export const environment = {
  production: true,
  apiUrl: `http://${
    typeof window !== 'undefined' ? window.location.hostname : 'localhost'
  }:3000/api`, // Dynamic API URL based on hostname
  // NOTE: While true, a production build boots into the /settings demo role-switcher
  // (see app.routes.ts redirect). Set to false for a real handover. See TODO.md.
  demoMode: true,
};
