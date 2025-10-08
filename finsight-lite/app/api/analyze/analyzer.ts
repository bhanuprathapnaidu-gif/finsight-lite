import { Transaction, MonthlyData, AnalysisResult } from '@/app/types'

export function analyzeTransactions(
  transactions: Transaction[],
  fileName: string
): AnalysisResult {
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  const monthlyMap = new Map<string, MonthlyData>()
  
  transactions.forEach(txn => {
    const date = new Date(txn.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthLabel,
        totalCredits: 0,
        totalDebits: 0,
        closingBalance: 0,
        transactionCount: 0,
      })
    }
    
    const monthData = monthlyMap.get(monthKey)!
    monthData.totalCredits += txn.credit
    monthData.totalDebits += txn.debit
    monthData.closingBalance = txn.balance
    monthData.transactionCount++
  })
  
  const monthlyData = Array.from(monthlyMap.values())
  
  const totalIncome = transactions.reduce((sum, txn) => sum + txn.credit, 0)
  const totalExpenses = transactions.reduce((sum, txn) => sum + txn.debit, 0)
  const averageBalance = transactions.reduce((sum, txn) => sum + txn.balance, 0) / transactions.length
  const highestInflow = Math.max(...transactions.map(txn => txn.credit))
  const lowestBalance = Math.min(...transactions.map(txn => txn.balance))
  
  const avgCredit = totalIncome / transactions.filter(t => t.credit > 0).length
  const irregularTransactions = transactions.filter(
    txn => txn.credit > avgCredit * 3 || txn.debit > avgCredit * 3
  ).length
  
  return {
    transactions,
    monthlyData,
    summary: {
      averageBalance,
      totalIncome,
      totalExpenses,
      highestInflow,
      lowestBalance,
      irregularTransactions,
    },
    fileName,
    analysisDate: new Date().toLocaleDateString('en-IN'),
  }
}