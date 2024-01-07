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

function handleAuthenticateFitbit() {
  const hashParams = window.location.hash.substring(1).split('&').reduce((result, item) => {
    const parts = item.split('=');
    result[parts[0]] = parts[1];
    return result;
  }, {});

  // Check if the access token is present in the URL hash
  if (hashParams.access_token) {
    // Calculate expiration time (if 'expires_in' parameter is present)
    let expirationTime = null;
    if (hashParams.expires_in) {
      const expiresInSeconds = parseInt(hashParams.expires_in, 10);
      const now = new Date();
      expirationTime = new Date().getTime() + expiresInSeconds * 1000; // Convert seconds to milliseconds
    }

    // Store the parsed authentication response in localStorage
    const authResponse = {
      accessToken: hashParams.access_token,
      tokenType: hashParams.token_type,
      expiresAt: expirationTime ? expirationTime : null,
      refreshToken: hashParams.refresh_token,
      userId: hashParams.user_id
    };

    localStorage.setItem('fitbitAuthResponse', JSON.stringify(authResponse));
  } else {
    console.error('Access token not found in URL hash');
  }

  // Continue execution where we left off if there is a stored state
  if (localStorage.getItem('state') !== null) {
    parseStoredStateAndExecuteFunction();
    // Clear state
    localStorage.removeItem('state')
  }
}

function getFitbitAccessToken() {
  var tokenResponse = JSON.parse(localStorage.getItem('fitbitAuthResponse'));
  return tokenResponse.accessToken
}

function checkFitBitAccessToken(continuationFcnName, ...continuationParameters) {
  var tokenResponse = JSON.parse(localStorage.getItem('fitbitAuthResponse'));

  // If no token exists perform initial authorization
  if (tokenResponse.accessToken === null) {
    authenticateFitbit();
  }
  // if token is expired refresh token
  else if(new Date().getTime() > tokenResponse.expiresAt) {
      // store function and parameters to resume once token is refreshed
      storeFunctionInfoInlocalStorage(continuationFcnName, ...continuationParameters);
      // Perform authenticaion flow
      authenticateFitbit();
      return false;
  }
  return true;
}

// Function to store function information in localStorage
function storeFunctionInfoInlocalStorage(functionName, ...parameters) {
  const stateObject = {
    name: functionName,
    parameters: parameters
  };

  // Convert the state object to a JSON string
  const stateString = JSON.stringify(stateObject);

  // Store the state in localStorage
  localStorage.setItem('state', stateString);
}

// Function to parse stored state and execute the corresponding function
function parseStoredStateAndExecuteFunction() {
  // Retrieve state from localStorage
  const stateString = localStorage.getItem('state');

  // Check if state is present and parse it
  if (stateString) {
    try {
      const stateObject = JSON.parse(stateString);

      // Extract function information from the state
      const functionName = stateObject.name;
      const parameters = stateObject.parameters;

      // Execute the corresponding function with the parameters
      executeFunctionByName(functionName, parameters);
      // Remove the stored state
      localStorage.removeItem('state');
    } catch (error) {
      console.error('Error parsing stored state:', error);
    }
  } else {
    console.error('Stored state not found.');
  }
}

// Function to execute a dynamically named function with parameters
function executeFunctionByName(functionName, parameters) {
  // Check if the function exists
  if (typeof window[functionName] === 'function') {
    // Execute the function with the parameters
    console.log("parameters:", ...parameters)
    window[functionName](...parameters);
  } else {
    console.error(`Function '${functionName}' not found.`);
  }
}