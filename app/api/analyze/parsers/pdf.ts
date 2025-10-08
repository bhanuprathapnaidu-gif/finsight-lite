import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  // Dynamic import to avoid build-time issues with pdf-parse
  const pdf = (await import('pdf-parse')).default
  
  const data = await pdf(buffer)
  const text = data.text
  
  const transactions: Transaction[] = []
  const lines = text.split('\n')
  
  // More flexible date pattern for Kotak format (DD/MM/YYYY with optional time)
  const datePattern = /(\d{2}\/\d{2}\/\d{4})/
  const amountPattern = /(?:^|[\s,])(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:[\s,]|$)/g
  
  let inTransactionSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect when we've reached the transaction section
    if (line.includes('Date') && line.includes('Description') && line.includes('Balance')) {
      inTransactionSection = true
      continue
    }
    
    // Skip header and non-transaction lines
    if (!inTransactionSection || !line || line.length < 10) continue
    
    const dateMatch = line.match(datePattern)
    if (!dateMatch) continue
    
    // Extract all numbers from the line
    const amounts: number[] = []
    let match
    const amountRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g
    
    while ((match = amountRegex.exec(line)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) {
        amounts.push(amount)
      }
    }
    
    if (amounts.length < 1) continue
    
    const date = normalizeDate(dateMatch[1])
    
    // Get description - text between date and first amount
    const dateEndPos = line.indexOf(dateMatch[1]) + dateMatch[1].length
    const firstAmountPos = line.indexOf(amounts[0].toLocaleString('en-IN'))
    let description = line.substring(dateEndPos, firstAmountPos > dateEndPos ? firstAmountPos : line.length)
    description = description.trim().substring(0, 100)
    
    // Kotak format: Last amount is always balance
    // If 3 amounts: withdrawal, deposit, balance
    // If 2 amounts: transaction amount, balance
    // If 1 amount: balance only
    
    let debit = 0
    let credit = 0
    let balance = amounts[amounts.length - 1] // Last amount is always balance
    
    if (amounts.length === 3) {
      // Has both withdrawal and deposit
      debit = amounts[0]
      credit = amounts[1]
    } else if (amounts.length === 2) {
      // Has one transaction amount and balance
      const txnAmount = amounts[0]
      
      // Determine if it's debit or credit based on keywords
      const lowerLine = line.toLowerCase()
      if (lowerLine.includes('deposit') || lowerLine.includes('credit') || 
          lowerLine.includes('cr') || lowerLine.includes('salary') ||
          lowerLine.includes('interest')) {
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
  // Handle DD/MM/YYYY format from Kotak
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return dateStr
}
