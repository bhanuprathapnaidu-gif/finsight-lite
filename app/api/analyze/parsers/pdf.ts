import { Transaction } from '@/app/types'

export async function parsePDF(buffer: Buffer): Promise<Transaction[]> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js')
    
    // Disable worker to avoid serverless issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableWorker: true,
    })
    
    const pdf = await loadingTask.promise
    
    let allText = ''
    
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
    
    console.log('PDF extracted successfully, text length:', allText.length)
    
    const transactions: Transaction[] = []
    const lines = allText.split('\n')
    
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
