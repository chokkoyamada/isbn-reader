import { performOCR, extractISBNFromText } from '../ocr'
import { OCRResult, ISBNValidationResult } from '@/types'

// Tesseract.jsをモック化
jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}))

import Tesseract from 'tesseract.js'

const mockRecognize = Tesseract.recognize as jest.MockedFunction<typeof Tesseract.recognize>

describe('OCR機能', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('performOCR', () => {
    test('画像ファイルからテキストを正しく抽出できる', async () => {
      const mockImageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      const mockOCRResult = {
        data: {
          text: 'ISBN 978-4-12-345678-9 書籍タイトル',
          confidence: 85
        }
      }

      mockRecognize.mockResolvedValue(mockOCRResult as any)

      const result: OCRResult = await performOCR(mockImageFile)

      expect(result.text).toBe('ISBN 978-4-12-345678-9 書籍タイトル')
      expect(result.confidence).toBe(85)
      expect(mockRecognize).toHaveBeenCalledWith(mockImageFile, 'jpn+eng')
    })

    test('OCR処理が失敗した場合エラーを投げる', async () => {
      const mockImageFile = new File([''], 'test.jpg', { type: 'image/jpeg' })
      mockRecognize.mockRejectedValue(new Error('OCR failed'))

      await expect(performOCR(mockImageFile)).rejects.toThrow('OCR failed')
    })
  })

  describe('extractISBNFromText', () => {
    test('ISBN-13形式を正しく抽出できる', () => {
      const text = 'このテキストにはISBN 978-4-12-345678-9が含まれています'
      const result: ISBNValidationResult = extractISBNFromText(text)

      expect(result.isValid).toBe(true)
      expect(result.isbn).toBe('9784123456789')
      expect(result.error).toBeUndefined()
    })

    test('ISBN-10形式を正しく抽出できる', () => {
      const text = 'ISBN: 4-12-345678-X'
      const result: ISBNValidationResult = extractISBNFromText(text)

      expect(result.isValid).toBe(true)
      expect(result.isbn).toBe('412345678X')
      expect(result.error).toBeUndefined()
    })

    test('複数のISBNがある場合最初のものを抽出する', () => {
      const text = 'ISBN 978-4-12-345678-9 と ISBN 978-4-98-765432-1'
      const result: ISBNValidationResult = extractISBNFromText(text)

      expect(result.isValid).toBe(true)
      expect(result.isbn).toBe('9784123456789')
    })

    test('ISBNが見つからない場合エラーを返す', () => {
      const text = 'このテキストにはISBNが含まれていません'
      const result: ISBNValidationResult = extractISBNFromText(text)

      expect(result.isValid).toBe(false)
      expect(result.isbn).toBeUndefined()
      expect(result.error).toBe('ISBNが見つかりませんでした')
    })

    test('無効なISBN形式の場合エラーを返す', () => {
      const text = 'ISBN 123-4-56-789012-3'
      const result: ISBNValidationResult = extractISBNFromText(text)

      expect(result.isValid).toBe(false)
      expect(result.isbn).toBeUndefined()
      expect(result.error).toBe('有効なISBN形式ではありません')
    })
  })
})