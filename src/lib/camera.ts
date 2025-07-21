import { CameraPermissionResult, CaptureResult } from '@/types'

export async function requestCameraPermission(): Promise<CameraPermissionResult> {
  try {
    // まず基本的な制約で試す
    let constraints: MediaStreamConstraints = {
      video: { 
        facingMode: 'environment', // 背面カメラを優先
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 }
      }
    }

    let stream: MediaStream | null = null

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch (envError) {
      console.log('環境カメラが利用できません、任意のカメラを試します:', envError)
      // 背面カメラが利用できない場合は任意のカメラを使用
      constraints = {
        video: { 
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      }
      stream = await navigator.mediaDevices.getUserMedia(constraints)
    }

    console.log('カメラストリーム取得成功:', stream)
    return {
      success: true,
      stream
    }
  } catch (error) {
    console.error('カメラアクセスエラー:', error)
    return {
      success: false,
      error: 'カメラへのアクセスが許可されませんでした'
    }
  }
}

export async function captureImageFromVideo(video: HTMLVideoElement): Promise<CaptureResult> {
  try {
    console.log('ビデオ要素の状態確認...')
    console.log('readyState:', video.readyState)
    console.log('videoWidth:', video.videoWidth, 'videoHeight:', video.videoHeight)

    // ビデオが準備できているかチェック
    if (video.readyState < 2) {
      return {
        success: false,
        error: 'ビデオが読み込まれていません'
      }
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return {
        success: false,
        error: 'ビデオの寸法を取得できません'
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    console.log('キャンバスサイズ設定:', canvas.width, 'x', canvas.height)

    const context = canvas.getContext('2d')
    if (!context) {
      return {
        success: false,
        error: 'キャンバスコンテキストの取得に失敗しました'
      }
    }

    // ビデオフレームをキャンバスに描画
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    console.log('キャンバスに描画完了')

    // キャンバスをBlobに変換
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Blob変換に失敗')
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

        console.log('ファイル作成成功:', file.name, file.size, 'bytes')
        resolve({
          success: true,
          file
        })
      }, 'image/jpeg', 0.9) // 品質90%
    })
  } catch (error) {
    console.error('撮影処理中のエラー:', error)
    return {
      success: false,
      error: '画像のキャプチャに失敗しました'
    }
  }
}