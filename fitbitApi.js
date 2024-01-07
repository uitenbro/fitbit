// fitbitApi.js

let FitbitApiUrl = 'https://api.fitbit.com/1/user/-/'; // Adjust based on your Fitbit API endpoints

function makeApiRequest(endpoint, method = 'GET') {

  // Assumes call to checkFitbitAccessToken is completed before this to ensure valid token
  const accessToken = getFitbitAccessToken();
  const url = `${FitbitApiUrl}${endpoint}`;

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
  // Exit here and restart this function when access token callback invokes again


// Function to get user profile from API
function getProfile() {
  if (checkFitBitAccessToken('getProfile', Array.from(arguments))) {
    makeApiRequest('profile.json')
      .then(data => handleProfile(data))
      .catch(error => console.error('Error getting profile:', error));
  }
}

// Function to handle profile data
function handleProfile(data) {
  console.log('Profile data:', data);
}

// Function to get daily activity summary from API
function getActivityLogs(date) {
  if (checkFitBitAccessToken('getActivityLogs', Array.from(arguments))) {
    makeApiRequest(`activities/date/${date}.json`)
      .then(data => handleActivityLogs(data))
      .catch(error => console.error('Error getting activity:', error));
  }
}

// Function to handle activity data
function handleActivityLogs(data) {
  console.log('Activity Log data:', data);
}

// Function to get sleep logs from API
function getSleepLogs(date) {
  if (checkFitBitAccessToken('getSleepLogs', Array.from(arguments))) {
    makeApiRequest(`sleep/date/${date}.json`)
      .then(data => handleSleepLogs(data))
      .catch(error => console.error('Error getting sleep logs:', error));
  }
}

// Function to handle sleep log data
function handleSleepLogs(data) {
  console.log('Sleep log data:', data);
}

// Function to get food log from API for a specific date
function getFoodLogs(date) {
  if (checkFitBitAccessToken('getFoodLogs', Array.from(arguments))) {
    makeApiRequest(`foods/log/date/${date}.json`)
      .then(data => handleGetFoodLogs(data))
      .catch(error => console.error('Error getting diet macros:', error));
  }
}

// Function to handle food log data
function handleGetFoodLogs(data) {
  console.log('Food log data:', data);
}
