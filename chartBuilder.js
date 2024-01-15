// chartBuilder.js

let weightChart;
let fatPercentChart;

function createWeightChart(datastore, startDate, endDate) {
  const dates = Object.keys(datastore);
  
  // Filter dates based on the provided startDate and endDate
  const filteredDates = dates.filter(date => date >= startDate && date <= endDate);

  // Extract data for the filtered dates
  const bodyWeightData = filteredDates.map(date => datastore[date].bodyWeight);
  const bodyWeightAvgData = filteredDates.map(date => datastore[date].bodyWeightAvg);
  const leanWeightData = filteredDates.map(date => datastore[date].leanWeight);
  const leanWeightAvgData = filteredDates.map(date => datastore[date].leanWeightAvg);

  // Combine data into datasets for weight chart
  const weightDatasets = [
    {
      label: 'Body Weight',
      data: bodyWeightData,
      borderColor: 'blue',
      backgroundColor: 'transparent',
      fill: false,
    },
    {
      label: 'Body Weight Avg',
      data: bodyWeightAvgData,
      borderColor: 'green',
      backgroundColor: 'transparent',
      fill: false,
    },
    {
      label: 'Lean Weight',
      data: leanWeightData,
      borderColor: 'purple',
      backgroundColor: 'transparent',
      fill: false,
    },
    {
      label: 'Lean Weight Avg',
      data: leanWeightAvgData,
      borderColor: 'orange',
      backgroundColor: 'transparent',
      fill: false,
    },
  ];

  // Create a new canvas element for weight chart
  const newWeightCanvas = document.createElement('canvas');
  newWeightCanvas.id = 'weightChart';

  // Create weight chart
  const weightCtx = newWeightCanvas.getContext('2d');
  weightChart = new Chart(weightCtx, {
    type: 'line',
    data: {
      labels: filteredDates,
      datasets: weightDatasets,
    },
    options: {
      scales: {
        x: {
          type: 'time', // Use time scale for x-axis
          time: {
            unit: 'day', // Adjust based on your data granularity
          },
        },
      },
    },
  });

  // Replace existing weight chart area with the new one
  const weightChartArea = document.getElementById('weightChartArea');
  weightChartArea.replaceChildren(newWeightCanvas);
}

function createFatPercentChart(datastore, startDate, endDate) {
  const dates = Object.keys(datastore);
  
  // Filter dates based on the provided startDate and endDate
  const filteredDates = dates.filter(date => date >= startDate && date <= endDate);

  // Assuming you have already extracted the arrays into the datastore
  const fatPercentData = filteredDates.map(date => datastore[date].fatPercent);
  const fatPercentAvgData = filteredDates.map(date => datastore[date].fatPercentAvg);

  // Combine data into datasets for fat percent chart
  const fatPercentDatasets = [
    {
      label: 'Fat Percent',
      data: fatPercentData,
      borderColor: 'gray',
      backgroundColor: 'transparent',
      fill: false,
    },
    {
      label: 'Fat Percent Avg',
      data: fatPercentAvgData,
      borderColor: 'red',
      backgroundColor: 'transparent',
      fill: false,
    },
  ];

  // Create a new canvas element for fat percent chart
  const newFatPercentCanvas = document.createElement('canvas');
  newFatPercentCanvas.id = 'fatPercentChart';

  // Create fat percent chart
  const fatPercentCtx = newFatPercentCanvas.getContext('2d');
  fatPercentChart = new Chart(fatPercentCtx, {
    type: 'line',
    data: {
      labels: filteredDates,
      datasets: fatPercentDatasets,
    },
    options: {
      scales: {
        x: {
          type: 'time', // Use time scale for x-axis
          time: {
            unit: 'day', // Adjust based on your data granularity
          },
        },
      },
    },
  });

  // Replace existing fat percent chart area with the new one
  const fatPercentChartArea = document.getElementById('fatPercentChartArea');
  fatPercentChartArea.replaceChildren(newFatPercentCanvas);
}


function createCombinedChart(datastore, startDate, endDate) {
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

  // Combine data into datasets
  const datasets = [
    {
      label: 'Body Weight',
      data: bodyWeightData,
      borderWidth: 1,
      borderColor: 'blue',
      backgroundColor: 'transparent',
      fill: false,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Body Weight Avg',
      data: bodyWeightAvgData,
      borderColor: 'green',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Lean Weight',
      data: leanWeightData,
      borderWidth: 1,
      borderColor: 'purple',
      backgroundColor: 'transparent',
      fill: false,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Lean Weight Avg',
      data: leanWeightAvgData,
      borderColor: 'orange',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisBodyWeight', // Specify y-axis ID
    },
    {
      label: 'Fat Percent',
      data: fatPercentData,
      borderWidth: 1,
      borderColor: 'gray',
      backgroundColor: 'transparent',
      fill: false,
      yAxisID: 'yAxisFatPercent', // Specify a different y-axis ID
    },
    {
      label: 'Fat Percent Avg',
      data: fatPercentAvgData,
      borderColor: 'red',
      backgroundColor: 'transparent',
      fill: false,
      pointRadius: 0,
      yAxisID: 'yAxisFatPercent', // Specify a different y-axis ID
    },
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

// // chartBuilder.js

// let weightChart;

// function createChart(datastore) {

//   // Assuming you have already extracted the arrays into the datastore
//   const dates = Object.keys(datastore);
//   const bodyWeightData = dates.map(date => datastore[date].bodyWeight);
//   const bodyWeightAvgData = dates.map(date => datastore[date].bodyWeightAvg);
//   const fatPercentData = dates.map(date => datastore[date].LeanPercent);
//   const fatPercentAvgData = dates.map(date => datastore[date].fatPercentAvg);
//   const leanWeightData = dates.map(date => datastore[date].leanWeight);
//   const leanWeightAvgData = dates.map(date => datastore[date].leanWeightAvg);

//   // Combine data into datasets
//   const datasets = [
//     {
//       label: 'Body Weight',
//       data: bodyWeightData,
//       borderColor: 'blue',
//       backgroundColor: 'transparent',
//       fill: false,
//     },
//     {
//       label: 'Body Weight Avg',
//       data: bodyWeightAvgData,
//       borderColor: 'green',
//       backgroundColor: 'transparent',
//       fill: false,
//     },
//     {
//       label: 'Lean Weight',
//       data: leanWeightData,
//       borderColor: 'purple',
//       backgroundColor: 'transparent',
//       fill: false,
//     },
//     {
//       label: 'Lean Weight Avg',
//       data: leanWeightAvgData,
//       borderColor: 'orange',
//       backgroundColor: 'transparent',
//       fill: false,
//     },
//     {
//       label: 'Fat Percent',
//       data: fatPercentData,
//       borderColor: 'gray',
//       backgroundColor: 'transparent',
//       fill: false,
//     },    
//     {
//       label: 'Fat Percent Avg',
//       data: fatPercentAvgData,
//       borderColor: 'red',
//       backgroundColor: 'transparent',
//       fill: false,
//     },
//   ];

//   // if (weightChart) {
//   //   // Use the existing chart before creating a new one
//   //   weightChart.destroy();
//   // }
//   // else {
//     // Create a new canvas element
//     const newCanvas = document.createElement('canvas');
//     newCanvas.id = 'weightChart';

//     // Create chart
//     const ctx = newCanvas.getContext('2d');
//     weightChart = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: dates,
//         datasets: datasets,
//       },
//       options: {
//         scales: {
//           x: {
//             type: 'time', // Use time scale for x-axis
//             time: {
//               unit: 'day', // Adjust based on your data granularity
//             },
//           },
//         },
//       },
//     });
//   //}
//     newDiv = document.createElement('div')
//     newDiv.id = "weightChartArea"
//     newDiv.appendChild(newCanvas)
//     document.getElementById('weightChartArea').replaceWith(newDiv)
// }