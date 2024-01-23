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
  createCombinedChart(fitbitDatastore, startDate, endDate, getPeriod(), leanWeightBestDates.concat(fatPercentBestDates).concat(leanWeightRecentDates).concat(fatPercentRecentDates));
  // createWeightChart(fitbitDatastore, startDate, endDate)
  // createFatPercentChart(fitbitDatastore, startDate, endDate)
}

function displayPeriods() {
  console.log("Display period data")
  var periodDuration = getPeriod();
  var allPeriodData = document.createElement('div');
  allPeriodData.id = "allPeriodData";
  allPeriodData.classList.add("container");

  var columeOnePeriodData = document.createElement('div');
  columeOnePeriodData.id = "columnOnePeriodData";
  columeOnePeriodData.classList.add("column");
  var ul = document.createElement('ul');

  // Populate column 1 with the metric names
  var statsData = fitbitDatastore[leanWeightBestDates[0].date].trends[periodDuration]
  for (const [metric, stats] of Object.entries(statsData)) {
    if (metric.includes('Stats')) {
      var li = document.createElement('li');
      var aLeft = document.createElement('a');
      aLeft.classList.add("labels");
      aLeft.appendChild(document.createTextNode(metric));
      var aRight = document.createElement('a');
      aRight.classList.add("right");
      aRight.appendChild(document.createTextNode('units'));
      li.appendChild(aLeft);
      li.appendChild(aRight);
      ul.appendChild(li);
    }
  }
  columeOnePeriodData.appendChild(ul)
  allPeriodData.appendChild(columeOnePeriodData)

  for (const periodDates of [leanWeightBestDates, fatPercentBestDates, leanWeightRecentDates, fatPercentRecentDates]) {
    periodDates.forEach(periodData => {
      var statsData = fitbitDatastore[periodData.date].trends[periodDuration]
      for (const key of ['average', 'min', 'max', 'stdDev']) {
        var leanBestPeriodData = document.createElement('div');
        leanBestPeriodData.id = "leanWeightPeriodData";
        leanBestPeriodData.classList.add("column");
        var ul = document.createElement('ul');
        for (const [metric, stats] of Object.entries(statsData)) {
          if (metric.includes('Stats')) {
            var li = document.createElement('li');
            var aLeft = document.createElement('a');
            aLeft.classList.add("left");
            aLeft.appendChild(document.createTextNode(stats[key] ? parseFloat(stats[key].toFixed(1)).toLocaleString('en-US') : '-'));
            // var aRight = document.createElement('a');
            // aRight.classList.add("right");
            // aRight.appendChild(document.createTextNode('units'));
            li.appendChild(aLeft);
            // li.appendChild(aRight);
            ul.appendChild(li);
          }
        }
        leanBestPeriodData.appendChild(ul)
        allPeriodData.appendChild(leanBestPeriodData)
      }
    })
  }
  document.getElementById('allPeriodData').replaceWith(allPeriodData)





  // left most column with metrics names
  // foreach of best lean, best fat, recent lean, recent fat
    // 5 periods with 4 cols each
      // each col gets a header: name, start, finish, lean weight trend, fat percent trend 
      // 4 columns: Avg Min Max StdDev
      // rows of numbers

  var all1PeriodData = document.createElement('div');
  all1PeriodData.id = "allPeriodData";

  leanWeightBestDates.forEach(periodData => {
    all1PeriodData.appendChild(displayPeriodDetails(periodData.date, periodData.periodDuration))
    all1PeriodData.appendChild(displayStatsTable(periodData.date, periodData.periodDuration))
  })
  fatPercentBestDates.forEach(periodData => {
    all1PeriodData.appendChild(displayPeriodDetails(periodData.date, periodData.periodDuration))
    all1PeriodData.appendChild(displayStatsTable(periodData.date, periodData.periodDuration))
  })
  leanWeightRecentDates.forEach(periodData => {
    all1PeriodData.appendChild(displayPeriodDetails(periodData.date, periodData.periodDuration))
    all1PeriodData.appendChild(displayStatsTable(periodData.date, periodData.periodDuration))
  })
  fatPercentRecentDates.forEach(periodData => {
    all1PeriodData.appendChild(displayPeriodDetails(periodData.date, periodData.periodDuration))
    all1PeriodData.appendChild(displayStatsTable(periodData.date, periodData.periodDuration))
  })

  document.getElementById('periodData').replaceWith(all1PeriodData)
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
    var cells = []
    const row = table.insertRow();

    if (metric.includes('Stats')) {
      // Replace null with "-"
      const avg = stats.average !== null ? stats.average.toFixed(1) : "-";
      const min = stats.min !== null ? stats.min.toFixed(1) : "-";
      const max = stats.max !== null ? stats.max.toFixed(1) : "-";
      const stdDev = stats.stdDev !== null ? stats.stdDev.toFixed(1) : "-";

      cells = [metric, avg, min, max, stdDev];
    }
    // Add cells to the row
    cells.forEach(cellData => {
      const cell = document.createElement('td');
      cell.textContent = cellData;
      row.appendChild(cell);
    });
  }

  // Append the table to the body of the document
  return table;
}

function displayPeriodDetails(middleDate, periodDuration) {
  var startDate = getStartDateFromMidPoint(middleDate, periodDuration)
  var endDate = calculateEndDate(startDate, periodDuration)

  // Create a table element
  const table = document.createElement('table');
  table.style.float = 'left'

  // Create a header row
  const headerRow = table.insertRow();
  const headers = [` ${startDate} - ${endDate}`, periodDuration, middleDate];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    var chartLink = document.createElement('a');
    chartLink.href = `javascript:displayCharts('${startDate}', '${endDate}', ${periodDuration})`;
    chartLink.textContent = headerText
    th.appendChild(chartLink)
    headerRow.appendChild(th);
  });

  // Create a header row
  const headerRowA = table.insertRow();
  const headersA = ['Metric', 'Slope', 'Offset'];
  headersA.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRowA.appendChild(th);
  });

  var lineData = fitbitDatastore[middleDate].trends[periodDuration]

  // Iterate through the stats data and add rows to the table
  for (const [metric, line] of Object.entries(lineData)) {
    if (metric.includes('Line')) {
      const row = table.insertRow();
      // Replace null with "-"
      const slope = line.slope !== null ? line.slope.toFixed(1) : "-";
      const offset = line.offset !== null ? line.offset.toFixed(1) : "-";

      const cells = [metric, slope, offset];

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

function getStartDateFromMidPoint(middleDate, periodDuration) {
  var midDate = new Date(middleDate)
  var startDate = new Date(midDate)
  startDate.setDate(midDate.getDate() - Math.floor(periodDuration / 2));
  return startDate.toISOString().split('T')[0]
}
function getMidPoint() {
  var midDate  = new Date(document.getElementById('midPeriodDate').value) 
  return midDate.toISOString().split('T')[0]
}