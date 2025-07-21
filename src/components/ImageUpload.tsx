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
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!file.type.startsWith('image/') || !allowedTypes.includes(file.type)) {
      setError('JPG、PNG、HEIC、WebP形式のファイルを選択してください')
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
        className={`w-full p-8 bg-white border-2 border-dashed rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/heic,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
              📁
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            画像をアップロード
          </h3>
          <p className="text-sm text-gray-500 mb-1">
            クリックして選択またはドラッグ&ドロップ
          </p>
          <div className="text-xs text-gray-400">
            JPG, PNG, HEIC, WebP対応
          </div>
        </div>
      </button>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  )
}