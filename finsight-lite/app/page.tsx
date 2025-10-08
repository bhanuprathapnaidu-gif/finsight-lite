'use client'

import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import { AnalysisResult } from './types'

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data: AnalysisResult = await response.json()
      setAnalysisData(data)
    } catch (error) {
      console.error('Error analyzing file:', error)
      alert('Failed to analyze file. Please ensure it is a valid bank statement.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setAnalysisData(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {!analysisData ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <Dashboard data={analysisData} onReset={handleReset} />
        )}
      </div>

      <footer className="mt-16 pb-8 text-center text-sm text-gray-600">
        <p className="font-semibold text-amber-700 bg-amber-50 inline-block px-4 py-2 rounded-lg">
          ⚠️ Indicative financial summary only. Underwriter validation required.
        </p>
      </footer>
    </main>
  )
}