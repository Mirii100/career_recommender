import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GradesChartProps {
  data: { subject: string; points: number }[];
}

const GradesChart: React.FC<GradesChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.subject),
    datasets: [
      {
        label: 'Points per Subject',
        data: data.map(d => d.points),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Subject Performance (by Points)',
      },
    },
    scales: {
        y: {
            max: 12,
            ticks: {
                stepSize: 1
            }
        }
    }
  };

  return <Bar options={options} data={chartData} />;
};

export default GradesChart;
