// fitbitAuth.js

let FitbitAuth = {
  clientId: '23RM4Z', // Replace with your Fitbit app's client ID
  redirectUri: 'https://localhost:8000', // Replace with your Fitbit app's redirect URI
  authorizationUrl: 'https://www.fitbit.com/oauth2/authorize',
  tokenUrl: 'https://api.fitbit.com/oauth2/token',
  scope: 'activity nutrition weight sleep respiratory_rate profile', // Adjust scopes based on your needs
}

function authenticateFitbit() {
    const authUrl = `${FitbitAuth.authorizationUrl}?client_id=${FitbitAuth.clientId}&redirect_uri=${encodeURIComponent(FitbitAuth.redirectUri)}&response_type=token&scope=${encodeURIComponent(FitbitAuth.scope)}`;

    // Redirect the user to Fitbit for authentication
    window.location.href = authUrl;
}

function handleAuthenteFitbit() {
  const hashParams = window.location.hash.substring(1).split('&').reduce((result, item) => {
    const parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});

  // Check if the access token is present in the URL hash
  if (hashParams.access_token) {
    // Store the access token in sessionStorage or localStorage as needed
    sessionStorage.setItem('fitbitAccessToken', hashParams.access_token);
  } else {
    console.error('Access token not found in URL hash');
  }
}

function getFitbitAccessToken() {
  return sessionStorage.getItem('fitbitAccessToken');
}

