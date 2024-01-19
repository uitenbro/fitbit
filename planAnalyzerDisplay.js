// planAnalyzerDisplay.js

function init() {
  handleAuthenticateFitbit(); 
  initModel(); 
  drawAll();
}

function drawAll() {
  drawControls();
  drawBodyWeightDisplay();
}

function drawControls() {
  // Implement logic to draw user inputs for goal and period duration
}

function drawBodyWeightDisplay() {
  // Implement logic to draw body weight data including the graph
}

function displayCharts(startDate, endDate) {
  createCombinedChart(fitbitDatastore, startDate, endDate, getPeriod(), leanWeightBestDates.concat(fatPercentBestDates));
  // createWeightChart(fitbitDatastore, startDate, endDate)
  // createFatPercentChart(fitbitDatastore, startDate, endDate)
}

function drawPeriodDisplay() {
  // Implement logic to draw the display containing the best 4 periods and associated data
}

function drawPeriodDetails(startDate) {
  // Implement logic to draw the details associated with a specific period
}

// Additional utility functions or UI components can be added based on your requirements

// Function to get start date from the input
function getStartDate() {
  return document.getElementById('startDate').value;
}

// Function to get duration from the input
function getDuration() {
  return parseInt(document.getElementById('duration').value, 10);
}
// Function to get period from the input
function getPeriod() {
  return parseInt(document.getElementById('period').value, 10);
}

// Function to get start date from the input
function getStartDateCharts() {
  return document.getElementById('startDateCharts').value;
}

// Function to get duration from the input
function getEndDateCharts() {
  return document.getElementById('endDateCharts').value;
}

// Function to calculate end date based on start date and duration
function calculateEndDate(startDate, duration) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + duration - 1);
  return end.toISOString().split('T')[0];
}

function getStartDateFromMidPoint() {
  var midDate  = new Date(document.getElementById('midPeriodDate').value) 
  var startDate = new Date(midDate)
  startDate.setDate(midDate.getDate() - Math.floor(getPeriod() / 2));
  return startDate.toISOString().split('T')[0]
}