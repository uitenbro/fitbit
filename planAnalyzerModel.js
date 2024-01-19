// planAnalyzerModel.js

var fitbitDatastore = {};
var fatPercentBestDates = []
var leanWeightBestDates = []

function initModel() {
  // Implement initialization logic based on the design document
  getFitbitData()
}

function getFitbitData() {
  // Implement logic to fetch Fitbit data and populate the fitbitDatastore
  Promise.all([getWeightLogs(getStartDate(), getDuration()), 
    getFatPercentLogs(getStartDate(), getDuration()),
    getCaloriesOutLogs(getStartDate(), getDuration()),
    getAzmLogs(getStartDate(), getDuration()),
    getStepLogs(getStartDate(), getDuration()),
    getDistanceLogs(getStartDate(), getDuration()),
    getCaloriesInLogs(getStartDate(), getDuration())])
    .then(() => {
    console.log('All operations completed successfully');
    calculateBodyWeightData(getPeriod())
    sortBodyWeightTrends()
    displayCharts(getStartDateCharts(), getEndDateCharts())
  })
  .catch(error => {
    console.error('Error in one or more operations:', error);
  });
}

function calculateBodyWeightData(period) {
  // Implement logic to calculate body weight data and populate fitbitDatastore
  // Calculate moving averages
  const movingAverageBodyWeight = calculateMovingAverage("bodyWeight", period);
  const movingAverageFatPercent = calculateMovingAverage("fatPercent", period);  
  const bestFitBodyWeight = calculateBestFitLine("bodyWeight", period);
  const bestFitFatPercent = calculateBestFitLine("fatPercent", period);

  // Calculate leanWeight for each date and add data back to the datastore
  const leanWeightData = {};
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];
    const leanWeight = calculateleanWeight(entry.bodyWeight, entry.fatPercent);
    leanWeightData[date] = isNaN(leanWeight) ? null : leanWeight;

    // Add the calculated values back to the entry in the datastore
    entry["bodyWeightAvg"] = movingAverageBodyWeight[date];
    entry["fatPercentAvg"] = movingAverageFatPercent[date];
    entry["bodyWeightLine"] = bestFitBodyWeight[date];
    entry["fatPercentLine"] = bestFitFatPercent[date];
    entry["leanWeight"] = leanWeightData[date];
  });

  // Calculate leanWeightAvg and add data back to the datastore
  const movingAverageLeanWeight = calculateMovingAverage("leanWeight", period);
  const bestFitLeanWeight = calculateBestFitLine("leanWeight", period);

  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];

    entry["leanWeightAvg"] = movingAverageLeanWeight[date];
    entry["leanWeightLine"] = bestFitLeanWeight[date];
    
  });
  // console.log(fitbitDatastore)
}

// Function to calculate duration-day moving average for a specific property
function calculateMovingAverage(property, duration) {
  const dates = Object.keys(fitbitDatastore);
  const averages = {};

  dates.forEach((date, index) => {
    const entry = fitbitDatastore[date];
    const values = [];

    // Get values for the property for the specified duration
    const startIndex = Math.max(0, index - Math.floor(duration / 2));
    const endIndex = Math.min(dates.length - 1, index + Math.ceil(duration / 2) - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      values.push(fitbitDatastore[dates[i]][property]);
    }
    // console.log(values)

    // Calculate the average and store it in the averages object
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    averages[date] = isNaN(average) ? null : average;
  });

  return averages;
}

// Function to calculate best fit line for a specific property
function calculateBestFitLine(property, duration) {
  const dates = Object.keys(fitbitDatastore);
  const bestFitLines = {};

  dates.forEach((date, index) => {
    const entry = fitbitDatastore[date];
    const values = [];

    // Get values for the property for the specified duration
    const startIndex = Math.max(0, index - Math.floor(duration / 2));
    const endIndex = Math.min(dates.length - 1, index + Math.ceil(duration / 2) - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      values.push(fitbitDatastore[dates[i]][property]);
    }

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
    const slope = fitbitDatastore[date][propertyToSort].slope;
    const offset = fitbitDatastore[date][propertyToSort].offset;

    // Calculate line points
    const linePoints = calculateLinePoints(slope, offset, date, duration);
    
    return {
        date,
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
    // if (middleDate == '2022-05-31') {
    //   console.log(`middleDate: ${middleDate} startIndex: ${startIndex} middleIndex: ${middleIndex} endIndex: ${endIndex}`)
    //   console.log(`i: ${i} x: ${x} slope: ${slope} offset: ${offset} y: ${y}`)
    //   console.log(`date: ${date} fitbitDatastore[date].leanWeight: ${fitbitDatastore[date].leanWeight}`)
    // }
  }

  return linePoints;
}