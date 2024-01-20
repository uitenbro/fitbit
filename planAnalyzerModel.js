// planAnalyzerModel.js

var fitbitDatastore = {};
var fatPercentBestDates = []
var leanWeightBestDates = []

function initModel() {
  // Implement initialization logic based on the design document
  getProfile()
}

function getTimeSeriesFitbitData() {
 // Use localStorage if its available
  try {
    // Attempt to read from localStorage and parse the object
    const storedData =localStorage.getItem('fitbitDatastore');
    if (storedData) {
      fitbitDatastore = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  // Check if today's data has already been received
  const today = new Date().toISOString().split('T')[0];
  if (!fitbitDatastore[today]) {
    // Implement logic to fetch Fitbit data and populate the fitbitDatastore
    Promise.all([
      getWeightLogs(getStartDate(), getDuration()), 
      getFatPercentLogs(getStartDate(), getDuration()),
      getCaloriesOutLogs(getStartDate(), getDuration()),
      getAzmLogs(getStartDate(), getDuration()),
      getStepLogs(getStartDate(), getDuration()),
      getDistanceLogs(getStartDate(), getDuration()),
      getCaloriesInLogs(getStartDate(), getDuration())
    ])
    .then(() => {
      console.log('All operations completed successfully');
      calculateTimeSeriesDerivedData(getPeriod())
      sortBodyWeightTrends()
      displayCharts(getStartDateCharts(), getEndDateCharts())
      getFitbitIntervalData();
    })
    .catch(error => {
      console.error('Error in one or more operations:', error);
    });
  }
  else {
    console.log("Using local storage")
    calculateTimeSeriesDerivedData(getPeriod())
    calculateIntervalDerivedData(getPeriod())
    sortBodyWeightTrends()
    displayCharts(getStartDateCharts(), getEndDateCharts())
    displayPeriods()
  }
}

function calculateTimeSeriesDerivedData(period) {
  // Implement logic to calculate body weight data and populate fitbitDatastore
  fitbitDatastore = sortFitbitDatastoreByDate(fitbitDatastore);

  // Calculate moving averages
  const movingAverageBodyWeight = calculateStats("bodyWeight", period);
  const movingAverageFatPercent = calculateStats("fatPercent", period);  
  const bestFitBodyWeight = calculateBestFitLine("bodyWeight", period);
  const bestFitFatPercent = calculateBestFitLine("fatPercent", period);

  const statsCaloriesIn = calculateStats("caloriesIn", getPeriod());
  const statsCaloriesOut = calculateStats("caloriesOut", getPeriod());
  const statsDistance = calculateStats("distance", getPeriod());
  const statsSteps = calculateStats("steps", getPeriod());

  // Calculate leanWeight for each date and add data back to the datastore
  const leanWeightData = {};
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];
    const leanWeight = calculateleanWeight(entry.bodyWeight, entry.fatPercent);
    leanWeightData[date] = isNaN(leanWeight) ? null : leanWeight;
    entry["leanWeight"] = leanWeightData[date]

    const calorieDiff = fitbitDatastore[date].caloriesIn ? fitbitDatastore[date].caloriesOut - fitbitDatastore[date].caloriesIn : NaN;
    entry.calorieDiff = calorieDiff;

    // Add the calculated values back to the entry in the datastore
    // Check if the date entry already exists in the datastore object
    if (!entry.trends) {
      // create entry for this period duration
      entry.trends = {[period]: {}}
    }
    entry.trends[period] = {
      "bodyWeightStats": movingAverageBodyWeight[date],
      "fatPercentStats" : movingAverageFatPercent[date],
      "bodyWeightLine" : bestFitBodyWeight[date],
      "fatPercentLine" : bestFitFatPercent[date],

      "caloriesInStats" : statsCaloriesIn[date],
      "caloriesOutStats" : statsCaloriesOut[date],
      "distanceStats" : statsDistance[date],
      "stepsStats" : statsSteps[date]
    }
  });

  // Calculate leanWeightAvg and add data back to the datastore
  const movingAverageLeanWeight = calculateStats("leanWeight", period);
  const bestFitLeanWeight = calculateBestFitLine("leanWeight", period);

  const statsCalorieDiff = calculateStats("calorieDiff", getPeriod());


  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];

    entry.trends[period].leanWeightStats = movingAverageLeanWeight[date];
    entry.trends[period].leanWeightLine = bestFitLeanWeight[date];
    entry.trends[period].calorieDiffStats = statsCalorieDiff[date];
    
  });
  localStorage.setItem('fitbitDatastore', JSON.stringify(fitbitDatastore))
  // console.log(fitbitDatastore)
}

// Function to calculate duration-day moving average, min, max, and std dev for a specific property
function calculateStats(property, duration) {
  const dates = Object.keys(fitbitDatastore);
  const stats = {};

  dates.forEach((date, index) => {
    const entry = fitbitDatastore[date];
    var values = [];

    // Get values for the property for the specified duration
    const startIndex = Math.max(0, index - Math.floor(duration / 2));
    const endIndex = Math.min(dates.length - 1, index + Math.ceil(duration / 2) - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      const nestedValue = getNestedProperty(fitbitDatastore[dates[i]], property);
      values.push(nestedValue);    
    }
    values = values.filter(n => !isNaN(n))

    // Calculate the average, min, max, and std dev and store them in the stats object
    const sum = values.reduce((acc, value) => acc + value, 0);
    const avg = values.length > 0 ? sum / values.length : null;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const squaredDifferences = values.map(value => Math.pow(value - avg, 2));
    const variance = squaredDifferences.reduce((acc, diff) => acc + diff, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    stats[date] = {
      average: avg,
      min: min,
      max: max,
      stdDev: stdDev
    };
  });

  return stats;
}

// Function to safely get nested properties
function getNestedProperty(obj, path) {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined; // Return undefined if any key is not found
    }
  }

  return result;
}


// Function to calculate best fit line for a specific property
function calculateBestFitLine(property, duration) {

  const dates = Object.keys(fitbitDatastore);
  const bestFitLines = {};

  dates.forEach((date, index) => {
    const entry = fitbitDatastore[date];
    var values = [];

    // Get values for the property for the specified duration
    const startIndex = Math.max(0, index - Math.floor(duration / 2));
    const endIndex = Math.min(dates.length - 1, index + Math.ceil(duration / 2) - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      values.push(fitbitDatastore[dates[i]][property]);
    }
    values = values.filter(n => !isNaN(n))

    // Calculate the best fit line (y = mx + b) Note: x (represented by i) ranges from neg to positive around midpoint
    const n = values.length;
    const sumX = values.reduce((sum, value, i) => sum + (i + startIndex - index), 0);  
    const sumY = values.reduce((sum, value) => sum + value, 0);
    const sumXY = values.reduce((sum, value, i) => sum + (i + startIndex - index) * value, 0);
    const sumX2 = values.reduce((sum, value, i) => sum + (i + startIndex - index) ** 2, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
    const offset = (sumY - slope * sumX) / n;

    // Don't include slopes for samples shorter than the period duration
    if (n == duration) {
      bestFitLines[date] = { slope, offset };
      // if(date == '2022-05-31') {
      //   console.log(`date: ${date} slope: ${slope} offset: ${offset} fitbitDatastore[date].leanWeight: `)
      //     console.log (fitbitDatastore[date])
      // }
    }
    else {
      bestFitLines[date] = { slope: 0, offset: 0 }

    }
  });

  return bestFitLines;
}

// Function to calculate leanWeight based on bodyWeight and fatPercent
function calculateleanWeight(bodyWeight, fatPercent) {
  return bodyWeight * (1 - fatPercent / 100);
}


function sortBodyWeightTrends() {
  // Implement logic to sort trends in fitbitDatastore based on the supplied goal
  leanWeightBestDates = getBestDates('leanWeightLine', 'decending', getPeriod(), 5);
  fatPercentBestDates = getBestDates('fatPercentLine', 'ascending', getPeriod(), 5);

  console.log('Top five leanWeightLine:', leanWeightBestDates);
  console.log('Top five fatPercentLine:', fatPercentBestDates);
}

function getBestDates(propertyToSort, sortOrder = 'decending', duration, count) {
  // Extract dates and corresponding property values into an array
  const dataArray = Object.keys(fitbitDatastore).map(date => {
    const slope = fitbitDatastore[date].trends[duration][propertyToSort].slope;
    const offset = fitbitDatastore[date].trends[duration][propertyToSort].offset;

    // Calculate line points
    const linePoints = calculateLinePoints(slope, offset, date, duration);
    
    return {
        date,
        periodDuration: getPeriod(),
        value: slope,
        linePoints,
        line: propertyToSort
      };
  });

  // Sort the array based on the property value and sortOrder
  dataArray.sort((a, b) => (sortOrder === 'ascending' ? a.value - b.value : b.value - a.value));

  // Take the top five entries
  const topDates = dataArray.slice(0, count);

  return topDates;
}

function calculateLinePoints(slope, offset, middleDate, duration) {
  const dates = Object.keys(fitbitDatastore);
  const middleIndex = dates.indexOf(middleDate);

  if (middleIndex === -1) {
    console.error('Middle date not found in the datastore.');
    return [];
  }

  const startIndex = Math.max(0, middleIndex - Math.floor(duration / 2));
  const endIndex = Math.min(dates.length - 1, middleIndex + Math.ceil(duration / 2) - 1);

  const linePoints = [];

  for (let i = startIndex; i <= endIndex; i++) {
    const date = dates[i];
    const x = i - middleIndex;
    const y = slope * x + offset;

    linePoints.push({ date, 'value': y });
  }

  return linePoints;
}

function sortFitbitDatastoreByDate(fitbitDatastore) {
  // Convert object entries to an array of [key, value] pairs
  const entries = Object.entries(fitbitDatastore);

  // Sort the array based on the date (assuming the date is in ISO format)
  entries.sort((a, b) => new Date(a[0]) - new Date(b[0]));

  // Convert the sorted array back to an object
  const sortedFitbitDatastore = Object.fromEntries(entries);

  return sortedFitbitDatastore;
}

function getFitbitIntervalData() {
  // Implement logic to fetch Fitbit data and populate the fitbitDatastore
  Promise.all([
    getMinutesSedentaryLogs(getStartDateFromMidPoint(), getPeriod()),
    getMinutesLightlyActiveLogs(getStartDateFromMidPoint(), getPeriod()),
    getMinutesFairlyActiveLogs(getStartDateFromMidPoint(), getPeriod()),
    getMinutesVeryActiveLogs(getStartDateFromMidPoint(), getPeriod()),
    
    getSleepLogs(getStartDateFromMidPoint(), getPeriod()),
    getPeriodMacros(getStartDateFromMidPoint(), getPeriod())
  ])
  .then(() => {
    console.log('All operations completed successfully');
    calculateIntervalDerivedData()
    displayPeriods()
  })
  .catch(error => {
    console.error('Error in one or more operations:', error);
  });
}  

function calculateIntervalDerivedData() {
  console.log("Finished period data gathering")
  // Cycle through inputs for each day in period and calculate average min max and std dev
  const statsAzmMin = calculateStats("AZM.activeZoneMinutes", getPeriod());
  const statsAzmFat = calculateStats("AZM.fatBurnActiveZoneMinutes", getPeriod());
  const statsAzmCardio = calculateStats("AZM.cardioActiveZoneMinutes", getPeriod());
  const statsAzmPeak = calculateStats("AZM.peakBurnActiveZoneMinutes", getPeriod());

  var period = getPeriod()
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];
    entry.trends[period].AzmActiveMinStats = statsAzmMin[date];
    entry.trends[period].AzmFatBurnStats = statsAzmFat[date];
    entry.trends[period].AzmCardioStats = statsAzmCardio[date];
    entry.trends[period].AzmPeakStats = statsAzmPeak[date];    
  });
  localStorage.setItem('fitbitDatastore', JSON.stringify(fitbitDatastore))
}

function getPeriodMacros(middleDate, periodDuration) {
  const dates = Object.keys(fitbitDatastore);
  const middleIndex = dates.indexOf(middleDate);

  if (middleIndex === -1) {
    console.error('Middle date not found in the datastore.');
    return [];
  }

  const startIndex = Math.max(0, middleIndex - Math.floor(periodDuration / 2));
  const endIndex = Math.min(dates.length - 1, middleIndex + Math.ceil(periodDuration / 2) - 1);

  // Collect function calls to get all macro data
  const macroDataRequests = [];
  for (let i = startIndex; i <= endIndex; i++) {
    macroDataRequests.push(getMacroLogs(dates[i]))
  }

  Promise.all(macroDataRequests)
    .then(results => {
      calculateMacroDerivedData();
    })
    .catch(error => console.log("Error receiveing macro data"))
}

function calculateMacroDerivedData() {
  console.log("All macros received")
  const carbStats = calculateStats("diet.summary.carbs", getPeriod());
  const fatStats = calculateStats("diet.summary.fat", getPeriod());
  const proteinStats = calculateStats("diet.summary.protein", getPeriod());
  const fibreStats = calculateStats("diet.summary.fiber", getPeriod());

  var period = getPeriod()
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];

    entry.trends[period].carbStats = carbStats[date];
    entry.trends[period].fatStats = fatStats[date];
    entry.trends[period].proteinStats = proteinStats[date];
    entry.trends[period].fibreStats = fibreStats[date];
  })
  localStorage.setItem('fitbitDatastore', JSON.stringify(fitbitDatastore))
}

