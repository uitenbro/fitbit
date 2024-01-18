// chartBuilder.js

let weightChart;
let fatPercentChart;

function createCombinedChart(datastore, startDate, endDate, bestDatesArray = fatPercentBestDates) {
  // Assuming you have already extracted the arrays into the datastore
  const dates = Object.keys(datastore);

  // Filter dates based on the provided startDate and endDate
  const filteredDates = dates.filter(date => date >= startDate && date <= endDate);

  const bodyWeightData = filteredDates.map(date => datastore[date].bodyWeight);
  const bodyWeightAvgData = filteredDates.map(date => datastore[date].bodyWeightAvg);

  const leanWeightData = filteredDates.map(date => datastore[date].leanWeight);
  const leanWeightAvgData = filteredDates.map(date => datastore[date].leanWeightAvg);

  const fatPercentData = filteredDates.map(date => datastore[date].fatPercent);
  const fatPercentAvgData = filteredDates.map(date => datastore[date].fatPercentAvg);

  const bestDatesData = bestDatesArray.filter(entry => filteredDates.includes(entry.date));

  // Combine data into datasets
  const datasets = [
    {
      label: 'Body Weight',
      data: bodyWeightData,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 255, 0.75)', 
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Body Weight Avg',
      data: bodyWeightAvgData,
      borderColor: 'rgba(0, 0, 255, 1.0)', 
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Lean Weight',
      data: leanWeightData,
      borderWidth: 1,
      borderColor: 'rgba(200, 0, 0, 0.75)',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Lean Weight Avg',
      data: leanWeightAvgData,
      borderColor: 'rgba(200, 0, 0, 1.0)', 
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Fat Percent',
      data: fatPercentData,
      borderWidth: 1,
      borderColor: 'rgba(0, 128, 0, 0.75)',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisFatPercent', // Specify a different y-axis ID
    },
    {
      label: 'Fat Percent Avg',
      data: fatPercentAvgData,
      borderColor: 'rgba(0, 128, 0, 1.0',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisFatPercent', // Specify a different y-axis ID
    },
    // Add lines from bestDatesArray
    ...bestDatesData.map(lineData => {
      let yAxisID;
      if (lineData.line === 'leanWeightLine') {
        yAxisID = 'yAxisBodyWeight';
        bestLabel = 'Lean Weight';
      } else if (lineData.line === 'fatPercentLine') {
        yAxisID = 'yAxisFatPercent';
        bestLabel = 'Fat Percent';
      }

      return {
        label: `${bestLabel} ${lineData.date}`,
        data: lineData.linePoints.map(point => ({
              x: point.date,
              y: point.value,
        })),
        borderColor: 'rgba(0, 0, 0, 0.75',  // Adjust color as needed
        backgroundColor: 'transparent',
        borderWidth: 6,
        fill: false,
        pointRadius: 0,
        yAxisID: yAxisID,  // Set y-axis based on lineData.line
      };
    }),
  ];

  // Create a new canvas element
  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'weightChart';

  // Create chart
  const ctx = newCanvas.getContext('2d');
  const combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: filteredDates,
      datasets: datasets,
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'yyyy MMM dd', // Use the desired format here
            },
          },

        },
        yAxisBodyWeight: {
            type: 'linear',
            position: 'left',
            ticks: {
              count: 8,
            }
        },
        yAxisFatPercent: {
            type: 'linear',
            position: 'right',
            ticks: {
              count: (context) => {
                return context.chart.config.options.scales.yAxisBodyWeight.ticks.count
              },
            },
        },
      },
    }
  });

  // Replace existing fat percent chart area with the new one
  const weightChartArea = document.getElementById('weightChartArea');
  weightChartArea.replaceChildren(newCanvas);
}
