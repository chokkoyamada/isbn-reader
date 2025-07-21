'use client'

import { ReadingMode } from '@/types'

interface ModeSelectorProps {
  selectedMode: ReadingMode
  onModeChange: (mode: ReadingMode) => void
}

export function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">
        読み取りモードを選択
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => onModeChange('ocr')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedMode === 'ocr'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium mb-1">OCRモード</div>
            <div className="text-sm text-gray-600">
              本のISBNテキストを読み取り
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onModeChange('barcode')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all duration-200 ${
            selectedMode === 'barcode'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium mb-1">バーコードモード</div>
            <div className="text-sm text-gray-600">
              ISBNバーコードを読み取り
            </div>
          </div>
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 text-center">
          {selectedMode === 'ocr' 
            ? '💡 本の表紙や裏表紙に記載されたISBNテキストを読み取ります'
            : '💡 本の裏表紙にあるISBNバーコードを読み取ります（より高精度）'
          }
        </p>
      </div>
    </div>
  )
}