'use client'

import Image from 'next/image'
import { BookInfo } from '@/types'
import { generateShareText, copyToClipboard, shareToX, shareToSlack } from '@/lib/share'
import { useState } from 'react'

interface BookDisplayProps {
  bookInfo: BookInfo
}

export function BookDisplay({ bookInfo }: BookDisplayProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopy = async () => {
    try {
      const shareText = generateShareText(bookInfo)
      await copyToClipboard(shareText)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('コピーに失敗しました:', error)
    }
  }

  const handleShareX = () => {
    const shareText = generateShareText(bookInfo)
    shareToX(shareText)
  }

  const handleShareSlack = () => {
    const shareText = generateShareText(bookInfo)
    shareToSlack(shareText)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {bookInfo.imageUrl && (
          <div className="flex-shrink-0">
            <Image
              src={bookInfo.imageUrl}
              alt={bookInfo.title}
              width={128}
              height={192}
              className="rounded shadow"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {bookInfo.title}
          </h2>
          
          {bookInfo.authors.length > 0 && (
            <p className="text-lg text-gray-600 mb-2">
              著者: {bookInfo.authors.join(', ')}
            </p>
          )}
          
          <p className="text-sm text-gray-500 mb-2">
            ISBN: {bookInfo.isbn}
          </p>
          
          {bookInfo.publisher && (
            <p className="text-sm text-gray-500 mb-2">
              出版社: {bookInfo.publisher}
            </p>
          )}
          
          {bookInfo.publishedDate && (
            <p className="text-sm text-gray-500 mb-2">
              発行年: {bookInfo.publishedDate}
            </p>
          )}
          
          {bookInfo.pageCount && (
            <p className="text-sm text-gray-500 mb-4">
              ページ数: {bookInfo.pageCount}
            </p>
          )}
          
          {bookInfo.description && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">概要</h3>
              <p className="text-sm text-gray-600 line-clamp-4">
                {bookInfo.description}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-800 mb-4">共有</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
          >
            {copySuccess ? '✅ コピー完了' : '📋 コピー'}
          </button>
          
          <button
            onClick={handleShareX}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors"
          >
            𝕏 X に投稿
          </button>
          
          <button
            onClick={handleShareSlack}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            💬 Slack で共有
          </button>
        </div>
      </div>
    </div>
  )
}