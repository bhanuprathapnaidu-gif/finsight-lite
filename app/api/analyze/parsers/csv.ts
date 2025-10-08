import Papa from 'papaparse'
import { Transaction } from '@/app/types'

export async function parseCSV(content: string): Promise<Transaction[]> {
  const result = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })

  const transactions: Transaction[] = []
  
  result.data.forEach((row: any) => {
    const date = row.Date || row.date || row['Transaction Date'] || row['Txn Date'] || ''
    const description = row.Description || row.description || row.Narration || row.narration || row.Particulars || ''
    const debit = parseFloat(row.Debit || row.debit || row['Withdrawal Amt.'] || row.Withdrawal || 0)
    const credit = parseFloat(row.Credit || row.credit || row['Deposit Amt.'] || row.Deposit || 0)
    const balance = parseFloat(row.Balance || row.balance || row['Closing Balance'] || 0)

    if (date) {
      transactions.push({
        date: normalizeDate(date),
        description: description.toString(),
        debit: isNaN(debit) ? 0 : debit,
        credit: isNaN(credit) ? 0 : credit,
        balance: isNaN(balance) ? 0 : balance,
      })
    }
  })

  return transactions
}

function normalizeDate(dateStr: string): string {
  const parts = dateStr.split(/[/-]/)
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return dateStr
}