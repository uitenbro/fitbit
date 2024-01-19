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
      'accept-language': 'en_US',
      'accept-locale': 'en_US'
    },
  })
    .then(response => {
      // response.headers.forEach((value, name) => {
      //   console.log(`Header: ${name} = ${value}`);
      // });
      return response.json()
    })
    .catch(error => {
      console.error('Error making API request:', error);
      throw error;
    });
}
  // Exit here and restart this function when access token callback invokes again


// Function to get user profile from API
function getProfile() {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getProfile', Array.from(arguments))) {
      makeApiRequest('profile.json')
        .then(data => {
          handleProfile(data);
          resolve();
        })
        .catch(error => console.error('Error getting profile:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle profile data
function handleProfile(data) {
  console.log('Profile data:', data);
}

// Function to get daily Calories Burned Log data from API
function getCaloriesOutLogs(startDate, duration) {
   return new Promise((resolve, reject) => {   
    if (checkFitBitAccessToken('getCaloriesOutLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/calories/date/${startDate}/${endDate}.json`)
       .then(data => {
          handleCaloriesOutLogs(data);
          resolve()
        })
        .catch(error => console.error('Error getting calories:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle calorie data
function handleCaloriesOutLogs(data) {
  console.log('Calories Burned Log data:', data);
  data['activities-calories'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseInt(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {caloriesOut : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].caloriesOut = value;
    }
  });  
}

// Function to get AZM Log data from API
function getAzmLogs(startDate, duration) {
   return new Promise((resolve, reject) => {   
    if (checkFitBitAccessToken('getAzmLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/active-zone-minutes/date/${startDate}/${endDate}.json`)
      // makeApiRequest(`activities/activityCalories/date/${startDate}/${endDate}.json`)
      // https://dev.fitbit.com/build/reference/web-api/activity-timeseries/get-activity-timeseries-by-date-range/#Resource-Options
        .then(data => {
          handleAzmLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting calories:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle calorie data
function handleAzmLogs(data) {
  console.log('AZM Log data:', data);
  data['activities-active-zone-minutes'].forEach(entry => {
    const date = entry.dateTime;
    const value = entry.value; // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {AZM : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].AZM = value;
    }
  });  
}

// Function to get weight logs from API
function getWeightLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getWeightLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`body/weight/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleWeightLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting weight:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle weight data
function handleWeightLogs(data) {
  console.log('Weight Log data:', data);
  data['body-weight'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseFloat(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {bodyWeight : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].bodyWeight = value;
    }
  });
}

// Function to get fat percent logs from API
function getFatPercentLogs(startDate, duration) {
  return new Promise((resolve, reject) => {  
    if (checkFitBitAccessToken('getWeightLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`body/fat/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleFatPercentLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting fat percent:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle fat percent data
function handleFatPercentLogs(data) {
  console.log('Fat Percent Log data:', data);
  data['body-fat'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseFloat(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {fatPercent : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].fatPercent = value;
    }
  });
}

// Function to get daily step log data from API
function getStepLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getStepLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/steps/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleStepLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting steps:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle step data
function handleStepLogs(data) {
  console.log('Step Log data:', data);
  data['activities-steps'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseInt(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {steps : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].steps = value;
    }
  });
}

// Function to get daily distance log data from API
function getDistanceLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getDistanceLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/distance/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleDistanceLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting distance:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle distance data
function handleDistanceLogs(data) {
  console.log('Distance Log data:', data);
  data['activities-distance'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseFloat(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {distance : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].distance = value;
    }
  });
}


// Function to get daily minutes sedentary log data from API
function getMinutesSedentaryLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
  duration = duration > 100 ? 100 : duration // limit is 100 days (actually 100 records)
    if (checkFitBitAccessToken('getMinutesSedentaryLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/minutesSedentary/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleMinutesSedentaryLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting minutes sedentary:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle minutes sedentary data
function handleMinutesSedentaryLogs(data) {
  console.log('Minutes Sedentary Log data:', data);
}

// Function to get daily minutes lightly active log data from API
function getMinutesLightlyActiveLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    duration = duration > 100 ? 100 : duration // limit is 100 days (actually 100 records)
    if (checkFitBitAccessToken('getMinutesLightlyActiveLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/minutesLightlyActive/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleMinutesLightlyActiveLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting minutes lightly active:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle minutes lightly active data
function handleMinutesLightlyActiveLogs(data) {
  console.log('Minutes Lightly Active Log data:', data);
}

// Function to get daily minutes fairly active log data from API
function getMinutesFairlyActiveLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    duration = duration > 100 ? 100 : duration // limit is 100 days (actually 100 records)
    if (checkFitBitAccessToken('getMinutesFairlyActiveLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/minutesFairlyActive/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleMinutesFairlyActiveLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting minutes fairly active:', error));
    }
    else {
        reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle minutes fairly active data
function handleMinutesFairlyActiveLogs(data) {
  console.log('Minutes Fairly Active Log data:', data);
}

// Function to get daily minutes very active log data from API
function getMinutesVeryActiveLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    duration = duration > 100 ? 100 : duration // limit is 100 days (actually 100 records)
    if (checkFitBitAccessToken('getMinutesVeryActiveLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`activities/minutesVeryActive/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleMinutesVeryActiveLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting minutes very active:', error));
    }
    else {
        reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle minutes very active data
function handleMinutesVeryActiveLogs(data) {
  console.log('Minutes Very Active Log data:', data);
}

// Function to get sleep logs from API with duration
function getSleepLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getSleepLogs', Array.from(arguments))) {
      duration = duration > 100 ? 100 : duration // limit is 100 days (actually 100 records)
      const endDate = calculateEndDate(startDate, duration);
      const apiUrl = `/sleep/date/${startDate}/${endDate}.json`;
      makeApiRequest(apiUrl)
        .then(data => {
          handleSleepLogs(data)
          resolve();
        })
        .catch(error => console.error('Error getting sleep logs:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle sleep log data
function handleSleepLogs(data) {
  console.log('Sleep log data:', data);
}

// Function to get food log from API for a specific date
function getCaloriesInLogs(startDate, duration) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getCaloriesInLogs', Array.from(arguments))) {
      const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`foods/log/caloriesIn/date/${startDate}/${endDate}.json`)
        .then(data => {
          handleCaloriesInLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting food log:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle food log data
function handleCaloriesInLogs(data) {
  console.log('Food log data:', data);
  data['foods-log-caloriesIn'].forEach(entry => {
    const date = entry.dateTime;
    const value = parseInt(entry.value); // Convert the value to a numeric type if needed

    // Check if the date entry already exists in the datastore object
    if (!fitbitDatastore[date]) {
      fitbitDatastore[date] = {caloriesIn : value};
    } else {
      // Update the existing entry
      fitbitDatastore[date].caloriesIn = value;
    }
  });
}

// Function to get diet macro log from API for a specific date
function getMacroLogs(startDate) {
  return new Promise((resolve, reject) => {
    if (checkFitBitAccessToken('getMacroLogs', Array.from(arguments))) {
      //const endDate = calculateEndDate(startDate, duration);
      makeApiRequest(`foods/log/date/${startDate}.json`)
        .then(data => {
          handleGetMacroLogs(data);
          resolve();
        })
        .catch(error => console.error('Error getting diet macros:', error));
    }
    else {
      reject('Access token check failed');  // Reject the promise if access token check fails
    }
  })
}

// Function to handle diet macro log data
function handleGetMacroLogs(data) {
  console.log('Diet Macro log data:', data);
}

