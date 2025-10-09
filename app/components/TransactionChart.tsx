'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { MonthlyData } from '../types'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface TransactionChartProps {
  monthlyData: MonthlyData[]
}

export default function TransactionChart({ monthlyData }: TransactionChartProps) {
  const chartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        type: 'bar',
        label: 'Income',
        data: monthlyData.map((d) => d.totalCredits),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        order: 2,
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: monthlyData.map((d) => d.totalDebits),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        order: 2,
      },
      {
        type: 'line',
        label: 'Balance',
        data: monthlyData.map((d) => d.closingBalance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        order: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Financial Overview',
        font: { 
          size: 16, 
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: any) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue)
            return '₹' + (value / 1000).toFixed(0) + 'K'
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ height: '400px' }}>
        <Chart type="bar" data={chartData as any} options={options as any} />
      </div>
    </div>
  )
}
