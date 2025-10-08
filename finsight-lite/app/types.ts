export interface Transaction {
  date: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface MonthlyData {
  month: string
  totalCredits: number
  totalDebits: number
  closingBalance: number
  transactionCount: number
}

export interface AnalysisResult {
  transactions: Transaction[]
  monthlyData: MonthlyData[]
  summary: {
    averageBalance: number
    totalIncome: number
    totalExpenses: number
    highestInflow: number
    lowestBalance: number
    irregularTransactions: number
  }
  fileName: string
  analysisDate: string
}