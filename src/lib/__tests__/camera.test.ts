import { requestCameraPermission, captureImageFromVideo } from '../camera'

// Navigator.mediaDevicesをモック化
const mockGetUserMedia = jest.fn()
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
})

// HTMLCanvasElementをモック化
const mockToBlob = jest.fn()
const mockGetContext = jest.fn()

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: mockGetContext,
})

Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  writable: true,
  value: mockToBlob,
})

describe('カメラ機能', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requestCameraPermission', () => {
    test('カメラアクセス許可が成功する', async () => {
      const mockStream = {
        getTracks: jest.fn(() => [
          { stop: jest.fn() }
        ])
      }
      mockGetUserMedia.mockResolvedValue(mockStream)

      const result = await requestCameraPermission()

      expect(result.success).toBe(true)
      expect(result.stream).toBe(mockStream)
      expect(result.error).toBeUndefined()
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 }
        }
      })
    })

    test('カメラアクセス許可が拒否された場合エラーを返す', async () => {
      const mockError = new Error('Permission denied')
      mockGetUserMedia.mockRejectedValue(mockError)

      const result = await requestCameraPermission()

      expect(result.success).toBe(false)
      expect(result.stream).toBeUndefined()
      expect(result.error).toBe('カメラへのアクセスが許可されませんでした')
    })

    test('カメラが利用できない場合エラーを返す', async () => {
      const mockError = new Error('No camera available')
      mockGetUserMedia.mockRejectedValue(mockError)

      const result = await requestCameraPermission()

      expect(result.success).toBe(false)
      expect(result.error).toBe('カメラへのアクセスが許可されませんでした')
    })
  })

  describe('captureImageFromVideo', () => {
    test('ビデオ要素から画像を正しくキャプチャできる', async () => {
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 2
      } as HTMLVideoElement

      const mockContext = {
        drawImage: jest.fn(),
      }
      mockGetContext.mockReturnValue(mockContext)

      const mockBlob = new Blob(['fake image'], { type: 'image/jpeg' })
      mockToBlob.mockImplementation((callback: BlobCallback) => {
        callback(mockBlob)
      })

      const result = await captureImageFromVideo(mockVideo)

      expect(result.success).toBe(true)
      expect(result.file).toBeInstanceOf(File)
      expect(result.file?.name).toMatch(/^captured-image-.*\.jpg$/)
      expect(result.file?.type).toBe('image/jpeg')
      expect(result.error).toBeUndefined()

      expect(mockGetContext).toHaveBeenCalledWith('2d')
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideo, 0, 0, 1920, 1080)
      expect(mockToBlob).toHaveBeenCalled()
    })

    test('Canvas作成に失敗した場合エラーを返す', async () => {
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 2
      } as HTMLVideoElement

      mockGetContext.mockReturnValue(null)

      const result = await captureImageFromVideo(mockVideo)

      expect(result.success).toBe(false)
      expect(result.file).toBeUndefined()
      expect(result.error).toBe('キャンバスコンテキストの取得に失敗しました')
    })

    test('Blob変換に失敗した場合エラーを返す', async () => {
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 2
      } as HTMLVideoElement

      const mockContext = {
        drawImage: jest.fn(),
      }
      mockGetContext.mockReturnValue(mockContext)

      mockToBlob.mockImplementation((callback: BlobCallback) => {
        callback(null)
      })

      const result = await captureImageFromVideo(mockVideo)

      expect(result.success).toBe(false)
      expect(result.file).toBeUndefined()
      expect(result.error).toBe('画像のキャプチャに失敗しました')
    })
  })
})