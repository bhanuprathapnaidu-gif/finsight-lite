import { MonthlyData } from '../types'

interface MonthlyTableProps {
  monthlyData: MonthlyData[]
}

export default function MonthlyTable({ monthlyData }: MonthlyTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Breakdown</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Month</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Credits</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Debits</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {monthlyData.map((month, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{month.month}</td>
                <td className="px-4 py-3 text-right text-green-600">
                  {formatCurrency(month.totalCredits)}
                </td>
                <td className="px-4 py-3 text-right text-red-600">
                  {formatCurrency(month.totalDebits)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-blue-600">
                  {formatCurrency(month.closingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}