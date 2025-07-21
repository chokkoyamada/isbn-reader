export interface BookInfo {
  isbn: string
  title: string
  authors: string[]
  description?: string
  imageUrl?: string
  publishedDate?: string
  publisher?: string
  pageCount?: number
}

export interface OCRResult {
  text: string
  confidence: number
}

export interface ISBNValidationResult {
  isValid: boolean
  isbn?: string
  error?: string
}

export interface CameraPermissionResult {
  success: boolean
  stream?: MediaStream
  error?: string
}

export interface CaptureResult {
  success: boolean
  file?: File
  error?: string
}

export type ReadingMode = 'ocr' | 'barcode'

export interface BarcodeResult {
  isbn: string
  success: boolean
  error?: string
}