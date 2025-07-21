'use client'

import { useState } from 'react'
import { BookDisplay } from '@/components/BookDisplay'
import { CameraCapture } from '@/components/CameraCapture'
import { ModeSelector } from '@/components/ModeSelector'
import { performOCR, extractISBNFromText } from '@/lib/ocr'
import { readBarcodeFromImage } from '@/lib/barcode'
import { getBookInfoByISBN } from '@/lib/googleBooks'
import { BookInfo, ReadingMode } from '@/types'

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null)
  const [error, setError] = useState<string>('')
  const [showCamera, setShowCamera] = useState(false)
  const [readingMode, setReadingMode] = useState<ReadingMode>('barcode')

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true)
    setError('')
    setBookInfo(null)

    try {
      let isbn: string

      if (readingMode === 'barcode') {
        // バーコード読み取り処理
        const barcodeResult = await readBarcodeFromImage(file)
        
        if (!barcodeResult.success || !barcodeResult.isbn) {
          throw new Error(barcodeResult.error || 'バーコードの読み取りに失敗しました')
        }
        
        isbn = barcodeResult.isbn
      } else {
        // OCR処理
        const ocrResult = await performOCR(file)
        
        // ISBN抽出
        const isbnResult = extractISBNFromText(ocrResult.text)
        
        if (!isbnResult.isValid || !isbnResult.isbn) {
          throw new Error(isbnResult.error || 'ISBNの抽出に失敗しました')
        }
        
        isbn = isbnResult.isbn
      }

      // 本の情報を取得
      const bookData = await getBookInfoByISBN(isbn)
      setBookInfo(bookData)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '処理中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
            📚 ISBN Reader
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            写真からISBNを読み取って本の詳細情報を自動取得・共有
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <ModeSelector 
            selectedMode={readingMode} 
            onModeChange={setReadingMode} 
          />
          
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setShowCamera(true)}
              className="w-full max-w-md px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-xl">📱</span>
              <span>カメラで撮影</span>
            </button>
          </div>

          {isProcessing && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  画像を解析中...
                </p>
                <p className="text-sm text-gray-500">
                  {readingMode === 'barcode' 
                    ? 'バーコードを読み取って本の情報を検索しています'
                    : 'OCRでISBNを読み取って本の情報を検索しています'
                  }
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    読み取りに失敗しました
                  </h3>
                  <p className="text-red-700 text-sm">{error}</p>
                  <div className="mt-4 text-xs text-red-600">
                    💡 ヒント: {readingMode === 'barcode' 
                      ? 'ISBNバーコードがはっきり見えるように撮影し直してください'
                      : 'ISBNテキストがはっきり見えるように撮影し直してください'
                    }
                  </div>
                </div>
              </div>
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