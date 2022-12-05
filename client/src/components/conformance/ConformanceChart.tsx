import {
  Chart as ChartJS, ArcElement, Legend, Tooltip
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';
import {
  isEmpty, omitBy, startsWith, values
} from 'lodash';


const initStats: number[] = [0, 0, 0, 0, 0, 0];
const OMIT_STAT_TOTAL = 'total';

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
  let statsArray: number[] = initStats;
  if (testStats && !isEmpty(testStats) && !isEmpty(testStats.overall)) {

    // TODO: Move to a util?
    const filteredObject = omitBy(testStats.overall, (_value, key) => {
      return startsWith(key, OMIT_STAT_TOTAL);
    });

    statsArray = values(filteredObject);
  }
  return statsArray;
};


const ConformanceChart = (props: any) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const { testStats } = props;

  const [dailyData, setDailyData] = useState(initStats);

  useEffect(() => {
    const arr: number[] = gatherStats(testStats);
    setDailyData(arr);
  }, [testStats]);

  return (
    <div>

      <Pie
        data={{
        labels: ['Error', 'Failure', 'Success', 'Expected Failure', 'Skipped', 'Unexpected Success' ],
        datasets: [
          {
            label: 'Results',
            data: dailyData.map((data) => data ),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 206, 86, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }
        ]
      }}
        options={ options }
      />

    </div>
  );

};

export default ConformanceChart;
