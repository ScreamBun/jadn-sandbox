import {
  Chart as ChartJS, ArcElement, Legend, Tooltip
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';


const initState = {
  labels: [''],
  datasets: [{}]
};

const options = {
  maintainAspectRatio : false,
  plugins: {
    legend: {
      display: false
    }
  }
};

const data = {
  labels: ['Success', 'Expected Failure', 'Skipped', 'Unexpected Success', 'Failure', 'Error'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
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
};

const ConformanceChart = (props: any) => {
  ChartJS.register(ArcElement, Tooltip, Legend);

  const [chartData, setChartData]  = useState(initState);

     useEffect(() => {
        setChartData(data);
      }, []);

      return (
        <Pie data={ chartData } options={ options } />
      );

};

export default ConformanceChart;