'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/ImageUpload'
import { BookDisplay } from '@/components/BookDisplay'
import { CameraCapture } from '@/components/CameraCapture'
import { performOCR, extractISBNFromText } from '@/lib/ocr'
import { getBookInfoByISBN } from '@/lib/googleBooks'
import { BookInfo } from '@/types'

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null)
  const [error, setError] = useState<string>('')
  const [showCamera, setShowCamera] = useState(false)

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true)
    setError('')
    setBookInfo(null)

    try {
      // OCR処理
      const ocrResult = await performOCR(file)
      
      // ISBN抽出
      const isbnResult = extractISBNFromText(ocrResult.text)
      
      if (!isbnResult.isValid || !isbnResult.isbn) {
        throw new Error(isbnResult.error || 'ISBNの抽出に失敗しました')
      }

      // 本の情報を取得
      const bookData = await getBookInfoByISBN(isbnResult.isbn)
      setBookInfo(bookData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📚 ISBN Reader
          </h1>
          <p className="text-xl text-gray-600">
            画像からISBNを読み取って本の情報を取得・共有
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <ImageUpload onImageSelect={handleImageSelect} />
            
            <div className="flex items-center space-x-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-500 text-sm">または</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            
            <button
              onClick={() => setShowCamera(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2"
            >
              <span>📷</span>
              <span>カメラで撮影</span>
            </button>
          </div>

          {isProcessing && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">
                画像を処理中...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {bookInfo && (
            <BookDisplay bookInfo={bookInfo} />
          )}
        </div>

        {showCamera && (
          <CameraCapture
            onCapture={handleImageSelect}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </main>
  )
}