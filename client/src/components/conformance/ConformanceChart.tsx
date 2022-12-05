import {
  Chart as ChartJS, ArcElement, Legend, Tooltip
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React, { useState, useEffect, useMemo } from 'react';
import { isEmpty, omitBy, startsWith, values } from 'lodash';

// TODO: Move into an exteranl class
class Stats {
  total = 0;
  error = 0;
  failure = 0;
  success = 0;
  expected_failure = 0;
  skipped = 0;
  unexpected_success = 0;
}

const options = {
  maintainAspectRatio : false,
  plugins: {
    legend: {
      display: false
    }
  }
};

// TODO: Need a test result class
const gatherStats = (testStats: any) => {
  let statsArray: number[] = [1, 1, 1, 1, 1, 1];
  if (testStats && !isEmpty(testStats)) {

    // TODO: Move to a util?
    const filteredObject = omitBy(testStats.overall, (_value, key) => {
      return !startsWith(key, 'total');
    });

    statsArray = values(filteredObject);
  }
  // setDailyData(statsArray);
  return statsArray;
};


const ConformanceChart = (props: any) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const { testStats } = props;

  const [dailyData, setDailyData] = useState([0]);

  // const gatherStats = () => {
  //   let statsArray: number[] = [0, 0, 0, 0, 0, 0];
  //   if (testStats && !isEmpty(testStats)) {
  //     // TODO: Replace 1s with actual values
  //     statsArray = values(testStats);
  //   }
  //   setDailyData(statsArray);
  // };

  useEffect(() => {
    setDailyData(gatherStats(testStats));
  }, [testStats]);

  return (
    <Pie
      data={{
      labels: ['Success', 'Expected Failure', 'Skipped', 'Unexpected Success', 'Failure', 'Error'],
      datasets: [
        {
          label: 'Results',
          data: dailyData.map((data) => data),
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
      ]
    }}
      options={ options }
    />
  );

};

export default ConformanceChart;
