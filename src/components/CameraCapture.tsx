'use client'

import { useState, useRef, useEffect } from 'react'
import { requestCameraPermission, captureImageFromVideo } from '@/lib/camera'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string>('')
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // コンポーネントのアンマウント時にストリームを停止
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    setError('')
    setIsCapturing(true)

    try {
      const result = await requestCameraPermission()
      
      if (!result.success || !result.stream) {
        setError(result.error || 'カメラの起動に失敗しました')
        setIsCapturing(false)
        return
      }

      streamRef.current = result.stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream
        
        // ビデオメタデータ読み込み完了を待つ
        await new Promise<void>((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded')
              resolve()
            }
            videoRef.current.onerror = (err) => {
              console.error('Video error:', err)
              reject(err)
            }
            // フォールバック：3秒でタイムアウト
            setTimeout(resolve, 3000)
          } else {
            reject(new Error('Video element not found'))
          }
        })
        
        setIsActive(true)
        console.log('Camera started successfully')
      }
    } catch (err) {
      console.error('Camera start error:', err)
      setError('カメラの起動中にエラーが発生しました')
      // ストリームを停止
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    } finally {
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsActive(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current) {
      console.error('Video element not found')
      setError('カメラが準備できていません')
      return
    }

    if (!streamRef.current) {
      console.error('Stream not found')
      setError('カメラストリームが見つかりません')
      return
    }

    setIsCapturing(true)
    setError('')

    try {
      console.log('Starting photo capture...')
      console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
      
      const result = await captureImageFromVideo(videoRef.current)
      
      if (result.success && result.file) {
        console.log('Photo captured successfully:', result.file.name, result.file.size, 'bytes')
        stopCamera()
        onCapture(result.file)
      } else {
        console.error('Capture failed:', result.error)
        setError(result.error || '撮影に失敗しました')
      }
    } catch (err) {
      console.error('Capture error:', err)
      setError('撮影中にエラーが発生しました')
    } finally {
      setIsCapturing(false)
    }
  }

  const retakePhoto = () => {
    setError('')
    startCamera()
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">📷 カメラで撮影</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="✕"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {!isActive ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                  📷
                </div>
              </div>
              <button
                onClick={startCamera}
                disabled={isCapturing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium"
              >
                {isCapturing ? '起動中...' : '📷 カメラを起動'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                  style={{ minHeight: '256px' }}
                />
                {/* プレビュー確認用のオーバーレイ */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  プレビュー中
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600 mb-2">
                ISBNが写るように本を画面に映してください
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg font-medium shadow-lg"
                >
                  {isCapturing ? '撮影中...' : '📸 撮影する'}
                </button>
                
                <button
                  onClick={retakePhoto}
                  disabled={isCapturing}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg"
                >
                  🔄 再起動
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}