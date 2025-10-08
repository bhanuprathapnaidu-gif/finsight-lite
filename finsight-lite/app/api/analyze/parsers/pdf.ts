import pdf from 'pdf-parse'
import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  const data = await pdf(buffer)
  const text = data.text
  
  const transactions: Transaction[] = []
  const lines = text.split('\n')
  
  const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/
  const amountPattern = /[\d,]+\.\d{2}/g
  
  for (const line of lines) {
    const dateMatch = line.match(datePattern)
    if (!dateMatch) continue
    
    const amounts = line.match(amountPattern)
    if (!amounts || amounts.length < 2) continue
    
    const parseAmount = (str: string) => parseFloat(str.replace(/,/g, ''))
    
    const date = normalizeDate(dateMatch[1])
    const description = line.substring(0, 50).trim()
    
    let debit = 0, credit = 0, balance = 0
    
    if (amounts.length >= 3) {
      debit = parseAmount(amounts[0])
      credit = parseAmount(amounts[1])
      balance = parseAmount(amounts[2])
    } else if (amounts.length === 2) {
      const txnAmount = parseAmount(amounts[0])
      balance = parseAmount(amounts[1])
      
      if (line.toLowerCase().includes('cr') || line.toLowerCase().includes('credit')) {
        credit = txnAmount
      } else {
        debit = txnAmount
      }
    }
    
    transactions.push({
      date,
      description,
      debit,
      credit,
      balance,
    })
  }
  
  return transactions
}

function normalizeDate(dateStr: string): string {
  const parts = dateStr.split(/[/-]/)
  if (parts.length === 3) {
    let [day, month, year] = parts
    if (year.length === 2) {
      year = '20' + year
    }
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return dateStr
}