import { useRef } from 'react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  isLoading: boolean
}

export default function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Bank Statement</h2>
        <p className="text-gray-600">Support for PDF and CSV formats</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-3 border-dashed border-blue-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Analyzing your statement...</p>
          </div>
        ) : (
          <>
            <svg
              className="w-16 h-16 mx-auto mb-4 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg text-gray-700 mb-2">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">PDF or CSV files (Max 10MB)</p>
          </>
        )}
      </div>
<p className="text-sm text-gray-500">PDF or CSV files (Max 10MB)</p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">What we analyze:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Monthly income and expense patterns</li>
          <li>✓ Average balance and cash flow trends</li>
          <li>✓ Irregular transaction detection</li>
          <li>✓ Financial stability indicators</li>
        </ul>
      </div>
    </div>
  )
}

