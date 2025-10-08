'use client'

import { jsPDF } from 'jspdf'
import { AnalysisResult } from '../types'

interface ReportGeneratorProps {
  data: AnalysisResult
}

export default function ReportGenerator({ data }: ReportGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.setTextColor(59, 130, 246)
    doc.text('FinSight Lite', 20, 20)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Bank Statement Analysis Report', 20, 30)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`File: ${data.fileName}`, 20, 40)
    doc.text(`Analysis Date: ${data.analysisDate}`, 20, 45)
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Financial Summary', 20, 60)
    
    doc.setFontSize(10)
    const summaryData = [
      ['Average Balance', formatCurrency(data.summary.averageBalance)],
      ['Total Income', formatCurrency(data.summary.totalIncome)],
      ['Total Expenses', formatCurrency(data.summary.totalExpenses)],
      ['Highest Inflow', formatCurrency(data.summary.highestInflow)],
      ['Lowest Balance', formatCurrency(data.summary.lowestBalance)],
      ['Irregular Transactions', data.summary.irregularTransactions.toString()],
    ]
    
    let yPos = 70
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}:`, 20, yPos)
      doc.text(value, 100, yPos)
      yPos += 7
    })
    
    doc.setFontSize(14)
    doc.text('Monthly Breakdown', 20, yPos + 10)
    
    doc.setFontSize(9)
    yPos += 20
    doc.text('Month', 20, yPos)
    doc.text('Credits', 70, yPos)
    doc.text('Debits', 110, yPos)
    doc.text('Balance', 150, yPos)
    
    yPos += 7
    data.monthlyData.forEach((month) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(month.month, 20, yPos)
      doc.text(formatCurrency(month.totalCredits), 70, yPos)
      doc.text(formatCurrency(month.totalDebits), 110, yPos)
      doc.text(formatCurrency(month.closingBalance), 150, yPos)
      yPos += 6
    })
    
    doc.setFontSize(8)
    doc.setTextColor(200, 100, 0)
    const disclaimer = 'Indicative financial summary only. Underwriter validation required.'
    doc.text(disclaimer, 20, 285)
    
    doc.save(`FinSight_Report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Generate Report</h3>
      <p className="text-gray-600 mb-6">
        Download a comprehensive PDF report for underwriting review
      </p>
      <button
        onClick={generatePDF}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
      >
        📄 Download PDF Report
      </button>
    </div>
  )
}