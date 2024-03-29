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

function drawPeriodColumnOne() {
    var periodDuration = getPeriod();

    var columeOnePeriodData = document.createElement('div');
    columeOnePeriodData.id = "0";
    columeOnePeriodData.classList.add("column");
    var ul = document.createElement('ul');

    // Populate column 1 with the metric names
    var statsData = fitbitDatastore[leanWeightBestDates[0].date].trends[periodDuration]
    // Add period header info to column
    for (const info of ['startDate', 'endDate', 'periodDuration', 'lineType']) {
      var li = document.createElement('li');
      var aLeft = document.createElement('a');
      aLeft.classList.add("left");
      aLeft.appendChild(document.createTextNode(info));
      var aRight = document.createElement('a');
      aRight.classList.add("right");
      aRight.appendChild(document.createTextNode('units'));
      li.appendChild(aLeft);
      li.appendChild(aRight);
      ul.appendChild(li);
    }
    // Add period trends
    for (const [metric, stats] of Object.entries(statsData)) {
      if (metric.includes('Line')) {
        for (const key of ['slope', 'offset']) {
          var li = document.createElement('li');
          var aLeft = document.createElement('a');
          aLeft.classList.add("left");
          aLeft.appendChild(document.createTextNode(`${metric} ${key}`));
          var aRight = document.createElement('a');
          aRight.classList.add("right");
          aRight.appendChild(document.createTextNode('units'));
          li.appendChild(aLeft);
          li.appendChild(aRight);
          ul.appendChild(li);
        }
      }
    }
    // Add header for statistics
    var li = document.createElement('li');
    var aLeft = document.createElement('a');
    aLeft.classList.add("left");
    aLeft.appendChild(document.createTextNode('\u00A0'));
    // var aRight = document.createElement('a');
    // aRight.classList.add("right");
    // aRight.appendChild(document.createTextNode('units'));
    li.appendChild(aLeft);
    // li.appendChild(aRight);
    ul.appendChild(li);
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
    return columeOnePeriodData
}


function displayPeriods() {
  console.log("Display period data")
  var periodDuration = getPeriod();
  var colId = 0;
  var allPeriodData = document.createElement('div');
  allPeriodData.id = "allPeriodData";
 //allPeriodData.classList.add("container");


  // For all the interesting period groups
  for (const periodDates of [leanWeightBestDates, fatPercentBestDates, leanWeightRecentDates, fatPercentRecentDates]) { 

    var periodGroupData = document.createElement('div');
    periodGroupData.id = "periodGroupData";
    periodGroupData.classList.add("container");

    columeOnePeriodData = drawPeriodColumnOne();
    colId++

    periodGroupData.appendChild(columeOnePeriodData)


    // For each period
    periodDates.forEach(periodData => {
      // Get the start and end dates
      var startDate = getStartDateFromMidPoint(periodData.date, periodDuration)
      var endDate = calculateEndDate(startDate, periodDuration)
      // Create four columns for each period
      var statsData = fitbitDatastore[periodData.date].trends[periodDuration]
      for (const key of ['average', 'min', 'max', 'stdDev']) {
        var leanBestPeriodData = document.createElement('div');
        leanBestPeriodData.id = colId++;
        leanBestPeriodData.classList.add("column");
        var ul = document.createElement('ul');
        // Add period header info to column
        for (const info of [startDate, endDate, periodDuration, periodData.line.replace(/Line/, '')]) {
          var li = document.createElement('li');
          var aLeft = document.createElement('a');
          aLeft.classList.add("left");
          aLeft.appendChild(document.createTextNode(info));
          // var aRight = document.createElement('a');
          // aRight.classList.add("right");
          // aRight.appendChild(document.createTextNode('units'));
          li.appendChild(aLeft);
          // li.appendChild(aRight);
          ul.appendChild(li);
        }
        // Add period trend line data to the header of each column
        for (const [metric, stats] of Object.entries(statsData)) {
          if (metric.includes('Line')) {
            for (const key of ['slope', 'offset']) {
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
        }
        // Add header for statistics
        var li = document.createElement('li');
        var aLeft = document.createElement('a');
        aLeft.classList.add("left");
        aLeft.appendChild(document.createTextNode(key));
        leanBestPeriodData.style.display = 'none';
        if (key == 'average') {
          aLeft.href = `javascript:showHideCols(${colId}, ${colId+1}, ${colId+2})`;
          leanBestPeriodData.style.display = '';
        }
        // var aRight = document.createElement('a');
        // aRight.classList.add("right");
        // aRight.appendChild(document.createTextNode('units'));
        li.appendChild(aLeft);
        // li.appendChild(aRight);
        ul.appendChild(li);
        // Add period input statistics that is specific to this column
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
        periodGroupData.appendChild(leanBestPeriodData)
      }
    })
    allPeriodData.appendChild(periodGroupData)
  }
  document.getElementById('allPeriodData').replaceWith(allPeriodData)

}

function showHideCols(...colIds) {
  colIds.forEach( colId => {
    const column = document.getElementById(colId)
    const isVisible = column.style.display !== 'none';
    column.style.display = isVisible ? 'none' : '';
  })
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