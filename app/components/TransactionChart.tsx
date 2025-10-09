'use client'

import { useEffect, useRef } from 'react'
import { MonthlyData } from '../types'

interface TransactionChartProps {
  monthlyData: MonthlyData[]
}

export default function TransactionChart({ monthlyData }: TransactionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true

    const loadChart = async () => {
      if (!chartRef.current || !mounted) return

      // Dynamically import Chart.js to avoid SSR issues
      const ChartJS = (await import('chart.js')).Chart
      const {
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        Title,
        Tooltip,
        Legend,
      } = await import('chart.js')

      // Register components
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

      // Destroy previous chart if exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      const ctx = chartRef.current.getContext('2d')
      if (!ctx) return

      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
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
        },
        options: {
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
                callback: function (tickValue) {
                  const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue as string)
                  return '₹' + (value / 1000).toFixed(0) + 'K'
                },
              },
            },
          },
        },
      })
    }

    loadChart()

    return () => {
      mounted = false
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [monthlyData])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div style={{ height: '400px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}
