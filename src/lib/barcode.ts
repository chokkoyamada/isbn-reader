import { BrowserBarcodeReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library'
import { BarcodeResult } from '@/types'

export async function readBarcodeFromImage(imageFile: File): Promise<BarcodeResult> {
  try {
    const reader = new BrowserBarcodeReader()
    
    // ファイルをImageElementに変換
    const imageUrl = URL.createObjectURL(imageFile)
    const image = new Image()
    
    return new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          URL.revokeObjectURL(imageUrl)
          
          // バーコード読み取り実行
          const result = await reader.decodeFromImageElement(image)
          
          // バーコード値を取得
          const barcodeText = result.getText()
          
          // ISBNかどうかチェック（EAN-13形式で978または979で始まる）
          if (barcodeText.length === 13 && (barcodeText.startsWith('978') || barcodeText.startsWith('979'))) {
            resolve({
              isbn: barcodeText,
              success: true
            })
          } else {
            resolve({
              isbn: '',
              success: false,
              error: 'ISBNバーコードが検出されませんでした'
            })
          }
        } catch (error) {
          if (error instanceof NotFoundException) {
            resolve({
              isbn: '',
              success: false,
              error: 'バーコードが見つかりませんでした'
            })
          } else if (error instanceof ChecksumException) {
            resolve({
              isbn: '',
              success: false,
              error: 'バーコードが破損しています'
            })
          } else if (error instanceof FormatException) {
            resolve({
              isbn: '',
              success: false,
              error: 'サポートされていないバーコード形式です'
            })
          } else {
            resolve({
              isbn: '',
              success: false,
              error: 'バーコード読み取りエラー'
            })
          }
        }
      }
      
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        resolve({
          isbn: '',
          success: false,
          error: '画像の読み込みに失敗しました'
        })
      }
      
      image.src = imageUrl
    })
  } catch (error) {
    return {
      isbn: '',
      success: false,
      error: error instanceof Error ? error.message : 'バーコード読み取りに失敗しました'
    }
  }
}