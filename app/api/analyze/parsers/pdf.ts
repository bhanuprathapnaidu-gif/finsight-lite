import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  try {
    // Import pdfjs-dist (serverless compatible)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js')
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    })
    
    const pdf = await loadingTask.promise
    
    let allText = ''
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      
      for (const item of textContent.items) {
        if ('str' in item) {
          allText += item.str + ' '
        }
      }
      allText += '\n'
    }
    
    console.log('PDF extracted, text length:', allText.length)
    console.log('First 500 chars:', allText.substring(0, 500))
    
    const transactions: Transaction[] = []
    const lines = allText.split('\n')
    
    // Date pattern for DD/MM/YYYY format
    const datePattern = /(\d{2}\/\d{2}\/\d{4})/
    
    for (const line of lines) {
      if (!line || line.trim().length < 10) continue
      
      const dateMatch = line.match(datePattern)
      if (!dateMatch) continue
      
      // Extract all numbers (amounts)
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
      
      // Kotak format: if 3+ amounts, likely withdrawal, deposit, balance
      if (amounts.length >= 3) {
        debit = amounts[amounts.length - 3]
        credit = amounts[amounts.length - 2]
      } else if (amounts.length === 2) {
        // Determine debit/credit from keywords
        const lowerLine = line.toLowerCase()
        if (lowerLine.includes('deposit') || 
            lowerLine.includes('credit') || 
            lowerLine.includes('cr') ||
            lowerLine.includes('salary') ||
            lowerLine.includes('interest')) {
          credit = amounts[0]
        } else {
          debit = amounts[0]
        }
      }
      
      const description = line
        .substring(dateMatch.index! + 10, Math.min(line.length, dateMatch.index! + 80))
        .trim()
        .substring(0, 100)
      
      transactions.push({
        date,
        description,
        debit,
        credit,
        balance,
      })
    }
    
    console.log('Transactions found:', transactions.length)
    
    if (transactions.length === 0) {
      throw new Error('No transactions found. The PDF may be in an unsupported format.')
    }
    
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
