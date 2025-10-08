import { NextRequest, NextResponse } from 'next/server'
import { parseCSV } from './parsers/csv'
import { parsePDF } from './parsers/pdf'
import { analyzeTransactions } from './analyzer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'csv'
    
    let transactions
    if (fileType === 'pdf') {
      transactions = await parsePDF(buffer)
    } else {
      transactions = await parseCSV(buffer.toString('utf-8'))
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found in file' },
        { status: 400 }
      )
    }

    const analysisResult = analyzeTransactions(transactions, file.name)
    
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    )
  }
}