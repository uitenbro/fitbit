// planAnalyzerModel.js

var fitbitDatastore = {};
var fatPercentBestDates = [];
var leanWeightBestDates = [];
var otherInterestingDates = [{date: '2024-01-01', periodDuration: 5, value: NaN, linePoints: [0,0,0,0], line: 'userLine'}];

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
    sortBodyWeightTrends()
    displayCharts(getStartDateCharts(), getEndDateCharts())

    getFitbitIntervalData(getPeriod())
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
    const leanWeight = entry.bodyWeight * (1 - entry.fatPercent / 100); 
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
    }
    else {
      bestFitLines[date] = { slope: 0, offset: 0 }

    }
  });

  return bestFitLines;
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
  // Get the intervals and dates that need data
  const missing = getCombinedDates()
  const missingMinuteRanges = missing.missingMinuteRanges;
  console.log(`Need to make ${missingMinuteRanges.length} + ${missing.missingDietDates.length} API calls`)
  const functionCalls = [];

  // Collect function calls to get all missing minute data  
  if (missingMinuteRanges) {
    functionCalls.push(...missingMinuteRanges.map(range => getMinutesSedentaryLogs(range.startDate, range.endDate)));
    functionCalls.push(...missingMinuteRanges.map(range => getMinutesLightlyActiveLogs(range.startDate, range.endDate)));
    functionCalls.push(...missingMinuteRanges.map(range => getMinutesFairlyActiveLogs(range.startDate, range.endDate)));
    functionCalls.push(...missingMinuteRanges.map(range => getMinutesVeryActiveLogs(range.startDate, range.endDate)));
    functionCalls.push(...missingMinuteRanges.map(range => getSleepLogs(range.startDate, range.endDate)));
  }
  // Add call for macros if necessary
  if (missing.missingDietDates.length) {
    functionCalls.push(getPeriodMacros(missing.missingDietDates));
  }

  // If there is missing data make the requests
  // console.log(`Need to make ${functionCalls.length} function calls`)
  if (functionCalls.length) {
    // Fetch Fitbit data and populate the fitbitDatastore then complete the calculations and display
    Promise.all(functionCalls)
    .then(() => {
      console.log('All interval requests completed successfully');
      calculateIntervalDerivedData()
      displayPeriods()
    })
    .catch(error => {
      console.error('Error in one or more operations:', error);
    });
  }
  else {
    console.log("No new interval or macro data to fetch using local data");
    calculateIntervalDerivedData()
    displayPeriods()
  }
}  

function calculateIntervalDerivedData() {
  console.log("Finished period data gathering")
  // Cycle through inputs for each day in period and calculate average min max and std dev
  const statsAzmMin = calculateStats("AZM.activeZoneMinutes", getPeriod());
  const statsAzmFat = calculateStats("AZM.fatBurnActiveZoneMinutes", getPeriod());
  const statsAzmCardio = calculateStats("AZM.cardioActiveZoneMinutes", getPeriod());
  const statsAzmPeak = calculateStats("AZM.peakBurnActiveZoneMinutes", getPeriod());
  const statsMinutesSedentary = calculateStats("minutesSedentary", getPeriod());
  const statsMinutesLightlyActive = calculateStats("LightlyActive", getPeriod());
  const statsMinutesFairlyActive = calculateStats("minutesFairlyActive", getPeriod());
  const statsMinutesVeryActive = calculateStats("minutesVeryActive", getPeriod());

  var period = getPeriod()
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];
    entry.trends[period].AzmActiveMinStats = statsAzmMin[date];
    entry.trends[period].AzmFatBurnStats = statsAzmFat[date];
    entry.trends[period].AzmCardioStats = statsAzmCardio[date];
    entry.trends[period].AzmPeakStats = statsAzmPeak[date];    
    entry.trends[period].minutesSedentaryStats = statsMinutesSedentary[date];    
    entry.trends[period].minutesLightlyActive = statsMinutesLightlyActive[date];    
    entry.trends[period].minutesFairlyActive = statsMinutesFairlyActive[date];    
    entry.trends[period].minutesVeryActiveStats = statsMinutesVeryActive[date];    
  });
  localStorage.setItem('fitbitDatastore', JSON.stringify(fitbitDatastore))
}

function getPeriodMacros(datesToRequest) {
  // Collect function calls to get all macro data
  const macroDataRequests = datesToRequest.map(dateString => getMacroLogs(dateString));

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

function getCombinedDates() {
  // Extract date strings using map
  const leanDateObjects = leanWeightBestDates.map(obj => ({ date: obj.date, duration: obj.periodDuration }));
  const fatDateObjects = fatPercentBestDates.map(obj => ({ date: obj.date, duration: obj.periodDuration }));
  const otherDateObjects = otherInterestingDates.map(obj => ({ date: obj.date, duration: obj.periodDuration }));

  const combinedDateObjects = [...leanDateObjects, ...fatDateObjects, ...otherDateObjects];

  // Remove duplicate dateStrings (if any)
  const uniqueDateObjects = Array.from(new Set(combinedDateObjects));

  // Array to store dateStrings that don't exist in fitbitDatastore.food
  const missingMinDateStrings = [];
  const missingDietDateStrings = [];

  // Check if fitbitDatastore has entries for the combined dateStrings
  uniqueDateObjects.forEach(dateObject => {
    const MinEntry = fitbitDatastore[dateObject.date]?.minutesSedentary;
    if (MinEntry === undefined) {
      // Expand the range and add to missingDateStrings
      const expandedRange = expandRange(dateObject);
      missingMinDateStrings.push(...expandedRange);
    }
    const dietEntry = fitbitDatastore[dateObject.date]?.diet;
    if (dietEntry === undefined) {
      // Expand the range and add to missingDateStrings
      const expandedRange = expandRange(dateObject);
      missingDietDateStrings.push(...expandedRange);
    }
  });

  // Remove duplicate dateStrings (if any) and sort
  const sortedUniqueMinDateStrings = [...new Set(missingMinDateStrings)].sort();
  const sortedUniqueFoodDateStrings = [...new Set(missingDietDateStrings)].sort();

  // Calculate the minimum number of 100-day ranges
  const missingMinRanges = [];
  let currentRange = { startDate: sortedUniqueMinDateStrings[0], endDate: sortedUniqueMinDateStrings[0] };

  for (let i = 1; i < sortedUniqueMinDateStrings.length; i++) {
    const currentDate = new Date(sortedUniqueMinDateStrings[i]);
    const previousDate = new Date(sortedUniqueMinDateStrings[i - 1]);

    // Check if the difference between current and previous dates is greater than 100 days
    if ((currentDate - previousDate) / (1000 * 60 * 60 * 24) > 100) {
      missingMinRanges.push(currentRange);
      currentRange = { startDate: sortedUniqueMinDateStrings[i], endDate: sortedUniqueMinDateStrings[i] };
    } 
    else {
      currentRange.endDate = sortedUniqueMinDateStrings[i];
    }
  }

  // Push the last range if dates are defined
  if (currentRange.startDate && currentRange.endDate) {
    missingMinRanges.push(currentRange);
  }
  
  // Return the results
  return { missingDietDates : sortedUniqueFoodDateStrings, missingMinuteRanges : missingMinRanges };
}

function expandRange(dateObject) {
  const { date, duration } = dateObject;

  // Parse the mid-point date and duration
  const midPointDate = new Date(date);

  // Calculate the start and end dates of the period
  const startDate = new Date(midPointDate);
  startDate.setDate(midPointDate.getDate() - Math.floor(duration / 2));

  const endDate = new Date(midPointDate);
  endDate.setDate(midPointDate.getDate() + Math.ceil(duration / 2) - 1);

  // Generate an array of all date strings within the period
  const dateStrings = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateStrings.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  //console.log(dateStrings)
  return dateStrings;
}
