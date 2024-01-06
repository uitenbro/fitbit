// fitbitApi.js

let FitbitApiUrl = 'https://api.fitbit.com/1/user/-/'; // Adjust based on your Fitbit API endpoints

function makeFitbitApiRequest(endpoint, method = 'GET') {
  const accessToken = getFitbitAccessToken();

  if (!accessToken) {
    console.error('Access token not available. Perform authentication first.');
    return Promise.reject(new Error('Access token not available.'));
  }

  const url = `${FitbitApiUrl}${endpoint}.json`;

  return fetch(url, {
    method: method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
    .then(response => response.json())
    .catch(error => {
      console.error('Error making API request:', error);
      throw error;
    });
}

function getFitbitProfile() {
  makeFitbitApiRequest('profile')
    .then(data => console.log('Profile data:', data))
    .catch(error => console.error('Error getting profile:', error));
}