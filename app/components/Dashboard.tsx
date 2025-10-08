'use client'

import { AnalysisResult } from '../types'
import SummaryCards from './SummaryCards'
import TransactionChart from './TransactionChart'
import MonthlyTable from './MonthlyTable'
import ReportGenerator from './ReportGenerator'

interface DashboardProps {
  data: AnalysisResult
  onReset: () => void
}

export default function Dashboard({ data, onReset }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
          <p className="text-sm text-gray-600">
            File: {data.fileName} | Analyzed: {data.analysisDate}
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Upload New File
        </button>
      </div>

      <SummaryCards summary={data.summary} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionChart monthlyData={data.monthlyData} />
        <MonthlyTable monthlyData={data.monthlyData} />
      </div>

      <ReportGenerator data={data} />
    </div>
  )
}