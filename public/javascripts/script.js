// create vote chart class
class VoteChart {
  constructor() {
    // data values for chart
    this.chartData = [0, 0, 0];
    // instantiate a new chart
    this.chart = this.barChart();
  }

  // method to create a new chart
  barChart() {
    let context = document.getElementById('voteChart').getContext('2d');

    return new Chart(context, {
      type: 'bar',
      data: {
        labels: ['Cake', 'Pie'],
        datasets: [
          {
            label: '# of Votes',

            data: this.chartData,
            backgroundColor: [
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1,
            barPercentage: 0.4,
          },
        ],
      },
      options: {
        legend: {
          labels: {
            fontColor: 'black',
            fontSize: 18,
            boxWidth: 0,
          },
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  // method to destroy and re-render chart with new values
  updateChart(data) {
    this.chart.destroy();
    this.chartData = Object.values(data);
    this.barChart();
  }
}

// instantiate chart
let bchart = new VoteChart();

// function to update stats and summary on page
const updateSummaryStats = (data) => {
  const totalCountElement = document.querySelector('.total-count');
  const chartData = Object.values(data);

  const totalCount = chartData.reduce((acc, curr) => acc + curr, 0);
  totalCountElement.innerText = totalCount;

  for (const item in data) {
    const parent = document.querySelector(`.${item}-summary`);
    const element = parent.querySelector('h1');
    element.innerText = data[item];
  }
};

// connect to Sync Service
let syncClient = new Twilio.Sync.Client(token, { logLevel: 'info' });

syncClient.on('connectionStateChanged', (state) => {
  if (state != 'connected') {
    console.log(`Sync not connected: ${state}`);
  } else {
    console.log('Sync is connected');
  }
});

// Open SportsPoll document
syncClient.document('CakeVsPie').then((document) => {
  console.log('CakeVsPie Document Loaded');

  let data = document.value;

  //render chart with sync document data
  bchart.updateChart(data);

  // display stats and summary
  updateSummaryStats(data);

  // update chart when there's an update to the sync document
  document.on('updated', (event) => {
    console.log('Received Document update event. New value:', event.value);
    bchart.updateChart(event.value);
    updateSummaryStats(event.value);
  });
});
