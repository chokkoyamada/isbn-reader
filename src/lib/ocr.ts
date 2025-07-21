import Tesseract from 'tesseract.js'
import { OCRResult, ISBNValidationResult } from '@/types'

export async function performOCR(imageFile: File): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(imageFile, 'jpn+eng')
    return {
      text: result.data.text,
      confidence: result.data.confidence
    }
  } catch (error) {
    throw error
  }
}

export function extractISBNFromText(text: string): ISBNValidationResult {
  // より広範囲なISBN検索パターン
  const isbnPattern = /ISBN[:\s]*[\d-\sX]+/gi

  const matches = text.match(isbnPattern)

  if (!matches) {
    return {
      isValid: false,
      error: 'ISBNが見つかりませんでした'
    }
  }

  // 最初のマッチを処理
  const isbnMatch = matches[0]
  
  // ISBNから数字とXのみ抽出
  const cleanISBN = isbnMatch.replace(/[^\dX]/gi, '').toUpperCase()

  // 長さチェック
  if (cleanISBN.length === 13) {
    // ISBN-13の場合978または979で始まることを確認
    if (!cleanISBN.startsWith('978') && !cleanISBN.startsWith('979')) {
      return {
        isValid: false,
        error: '有効なISBN形式ではありません'
      }
    }
  } else if (cleanISBN.length === 10) {
    // ISBN-10の場合は10桁であればOK
  } else {
    return {
      isValid: false,
      error: '有効なISBN形式ではありません'
    }
  }

  return {
    isValid: true,
    isbn: cleanISBN
  }
}