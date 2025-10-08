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
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Income',
        data: monthlyData.map(d => d.totalCredits),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        type: 'bar' as const,
        label: 'Expenses',
        data: monthlyData.map(d => d.totalDebits),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Balance',
        data: monthlyData.map(d => d.closingBalance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Financial Overview',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 1000).toFixed(0) + 'K'
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ height: '400px' }}>
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  )
}