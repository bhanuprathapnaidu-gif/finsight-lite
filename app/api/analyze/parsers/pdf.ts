import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  try {
    const pdf = (await import('pdf-parse')).default
    const data = await pdf(buffer)
    const text = data.text
    
    console.log('PDF text extracted, length:', text.length)
    console.log('First 500 chars:', text.substring(0, 500))
    
    if (!text || text.length < 50) {
      throw new Error('PDF appears to be empty or unreadable')
    }
    
    const transactions: Transaction[] = []
    const lines = text.split('\n')
    
    console.log('Total lines:', lines.length)
    
    // Look for lines with dates in DD/MM/YYYY format
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/
    
    let transactionCount = 0
    
    for (const line of lines) {
      if (!line || line.trim().length < 10) continue
      
      const dateMatch = line.match(datePattern)
      if (!dateMatch) continue
      
      // Extract all numbers (amounts)
      const numberPattern = /\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g
      const numbers = line.match(numberPattern)
      
      if (!numbers || numbers.length < 1) continue
      
      const amounts = numbers.map(n => parseFloat(n.replace(/,/g, ''))).filter(a => !isNaN(a) && a > 0)
      
      if (amounts.length === 0) continue
      
      const date = normalizeDate(dateMatch[1])
      const balance = amounts[amounts.length - 1]
      
      let debit = 0
      let credit = 0
      
      // Simple heuristic: if there are 3+ amounts, first two might be withdrawal/deposit
      if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3]
        credit = amounts[amounts.length - 2]
      } else if (amounts.length === 2) {
        // Check keywords to determine debit/credit
        if (line.toLowerCase().includes('deposit') || 
            line.toLowerCase().includes('credit') || 
            line.toLowerCase().includes('salary')) {
          credit = amounts[0]
        } else {
          debit = amounts[0]
        }
      }
      
      const description = line.substring(dateMatch.index! + 10, Math.min(line.length, dateMatch.index! + 60)).trim()
      
      transactions.push({
        date,
        description,
        debit,
        credit,
        balance,
      })
      
      transactionCount++
    }
    
    console.log('Transactions found:', transactionCount)
    
    return transactions
  } catch (error: any) {
    console.error('PDF parsing error:', error)
    throw new Error(`PDF parsing failed: ${error.message}`)
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
