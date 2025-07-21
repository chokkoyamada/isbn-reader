import { CameraPermissionResult, CaptureResult } from '@/types'

export async function requestCameraPermission(): Promise<CameraPermissionResult> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // 背面カメラを優先
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })

    return {
      success: true,
      stream
    }
  } catch (error) {
    return {
      success: false,
      error: 'カメラへのアクセスが許可されませんでした'
    }
  }
}

export async function captureImageFromVideo(video: HTMLVideoElement): Promise<CaptureResult> {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return {
        success: false,
        error: '画像のキャプチャに失敗しました'
      }
    }

    // ビデオフレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // キャンバスをBlobに変換
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({
            success: false,
            error: '画像のキャプチャに失敗しました'
          })
          return
        }

        // BlobをFileオブジェクトに変換
        const timestamp = new Date().getTime()
        const file = new File([blob], `captured-image-${timestamp}.jpg`, {
          type: 'image/jpeg'
        })

        resolve({
          success: true,
          file
        })
      }, 'image/jpeg', 0.9) // 品質90%
    })
  } catch (error) {
    return {
      success: false,
      error: '画像のキャプチャに失敗しました'
    }
  }
}