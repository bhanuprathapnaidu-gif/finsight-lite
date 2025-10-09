import pdf from 'pdf-parse'
import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  try {
    const data = await pdf(buffer)
    const text = data.text
    
    console.log('PDF extracted, text length:', text.length)
    
    const transactions: Transaction[] = []
    const lines = text.split('\n')
    
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/
    
    for (const line of lines) {
      if (!line || line.trim().length < 10) continue
      
      const dateMatch = line.match(datePattern)
      if (!dateMatch) continue
      
      const numberPattern = /\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g
      const numbers = line.match(numberPattern)
      
      if (!numbers || numbers.length < 1) continue
      
      const amounts = numbers
        .map(n => parseFloat(n.replace(/,/g, '')))
        .filter(a => !isNaN(a) && a > 0)
      
      if (amounts.length === 0) continue
      
      const date = normalizeDate(dateMatch[1])
      const balance = amounts[amounts.length - 1]
      
      let debit = 0
      let credit = 0
      
      if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3]
        credit = amounts[amounts.length - 2]
      } else if (amounts.length === 2) {
        const lowerLine = line.toLowerCase()
        if (lowerLine.includes('deposit') || 
            lowerLine.includes('credit') || 
            lowerLine.includes('cr') ||
            lowerLine.includes('neft') ||
            lowerLine.includes('upi')) {
          credit = amounts[0]
        } else {
          debit = amounts[0]
        }
      }
      
      const description = line.substring(dateMatch.index! + 10, Math.min(line.length, dateMatch.index! + 100)).trim()
      
      transactions.push({
        date,
        description,
        debit,
        credit,
        balance,
      })
    }
    
    console.log('Transactions parsed:', transactions.length)
    
    if (transactions.length === 0) {
      throw new Error('No transactions found in PDF')
    }
    
    return transactions
    
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    throw new Error('PDF parsing failed: ' + error.message)
  }
}

function normalizeDate(dateStr: string): string {
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return dateStr
}
