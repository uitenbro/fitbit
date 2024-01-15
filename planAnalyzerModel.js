// planAnalyzerModel.js

var fitbitDatastore = {};

function initModel() {
  // Implement initialization logic based on the design document
  getFitbitData()
}

function getFitbitData() {
  // Implement logic to fetch Fitbit data and populate the fitbitDatastore
  getWeightLogs(getStartDate(), getDuration())
  getFatPercentLogs(getStartDate(), getDuration())
}

function calculateBodyWeightData() {
  // Implement logic to calculate body weight data and populate fitbitDatastore
  // Calculate 7-day moving averages
  const movingAverageBodyWeight = calculateMovingAverage("bodyWeight");
  const movingAverageFatPercent = calculateMovingAverage("fatPercent");

  // Calculate leanWeight for each date and add data back to the datastore
  const leanWeightData = {};
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];
    const leanWeight = calculateleanWeight(entry.bodyWeight, entry.fatPercent);
    leanWeightData[date] = isNaN(leanWeight) ? null : leanWeight;

    // Add the calculated values back to the entry in the datastore
    entry["bodyWeightAvg"] = movingAverageBodyWeight[date];
    entry["fatPercentAvg"] = movingAverageFatPercent[date];
    entry["leanWeight"] = leanWeightData[date];
  });

  // Calculate leanWeightAvg and add data back to the datastore
  const movingAverageleanWeight = calculateMovingAverage("leanWeight");
  const leanWeightAvgData = {};
  Object.keys(fitbitDatastore).forEach(date => {
    const entry = fitbitDatastore[date];

    entry["leanWeightAvg"] = movingAverageleanWeight[date];
    
  });
  console.log(fitbitDatastore)
}

function calculateBodyWeightTrends(duration) {
  // Implement logic to calculate trends for the specified duration and update trends in fitbitDatastore
}

function sortBodyWeightTrends(goal) {
  // Implement logic to sort trends in fitbitDatastore based on the supplied goal
}

function calculateProgramInputs(startDate, endDate) {
  // Implement logic to calculate program inputs for the specified period and return individual day data and summary
}

// Function to calculate 7-day moving average for a specific property
function calculateMovingAverage(property) {
  const dates = Object.keys(fitbitDatastore);
  const averages = {};

  dates.forEach((date, index) => {
    const entry = fitbitDatastore[date];
    const values = [];

    // Get values for the property for the previous 3, current, and following 3 days
    for (let i = index - 3; i <= index + 3; i++) {
      if (i >= 0 && i < dates.length) {
        values.push(fitbitDatastore[dates[i]][property]);
      }
    }

    // Calculate the average and store it in the averages object
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    averages[date] = isNaN(average) ? null : average;
  });

  return averages;
}

// Function to calculate leanWeight based on bodyWeight and fatPercent
function calculateleanWeight(bodyWeight, fatPercent) {
  return bodyWeight * (1 - fatPercent / 100);
}

