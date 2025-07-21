'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    if (!file.type.startsWith('image/') || (!file.type.includes('jpeg') && !file.type.includes('png'))) {
      setError('JPG、PNG形式のファイルを選択してください')
      return
    }

    setError('')
    onImageSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="text-center">
          <div className="mb-4">
            📷
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            画像をドラッグ&ドロップまたはクリックして選択
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG形式をサポート
          </p>
        </div>
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
    </div>
  )
}