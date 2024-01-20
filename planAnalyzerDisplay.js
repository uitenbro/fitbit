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

function displayPeriods() {
  console.log("Display period data")
  var periodData = document.createElement('div');
  periodData.id = "periodData";
  // periodData.appendChild(displayPeriodMetrics(getMidPoint(), getPeriod()))
  periodData.appendChild(displayStatsTable(getMidPoint(), getPeriod()))

  document.getElementById('periodData').replaceWith(periodData)
}

function displayStatsTable(middleDate, periodDuration) {
  var statsData = fitbitDatastore[middleDate].trends[periodDuration]

  // Create a table element
  const table = document.createElement('table');

  // Create a header row
  const headerRow = table.insertRow();
  const headers = ['Metric', 'Average', 'Min', 'Max', 'StdDev'];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  // Iterate through the stats data and add rows to the table
  for (const [metric, stats] of Object.entries(statsData)) {
    if (metric.includes('Stats')) {
      const row = table.insertRow();
      // Replace null with "-"
      const avg = stats.average !== null ? stats.average.toFixed(1) : "-";
      const min = stats.min !== null ? stats.min.toFixed(1) : "-";
      const max = stats.max !== null ? stats.max.toFixed(1) : "-";
      const stdDev = stats.stdDev !== null ? stats.stdDev.toFixed(1) : "-";

      const cells = [metric, avg, min, max, stdDev];

      // Add cells to the row
      cells.forEach(cellData => {
        const cell = document.createElement('td');
        cell.textContent = cellData;
        row.appendChild(cell);
      });
    }
  }

  // Append the table to the body of the document
  return table;
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
function getMidPoint() {
  var midDate  = new Date(document.getElementById('midPeriodDate').value) 
  return midDate.toISOString().split('T')[0]
}