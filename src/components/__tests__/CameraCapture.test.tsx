import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { CameraCapture } from '../CameraCapture'

// react-webcamをモック化
jest.mock('react-webcam', () => {
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      if (ref) {
        ref.current = {
          getScreenshot: jest.fn()
        }
      }
      return <div data-testid="webcam">Mocked Webcam</div>
    })
  }
})

// OCRをモック化
jest.mock('@/lib/ocr', () => ({
  performOCR: jest.fn().mockResolvedValue({ text: '' }),
  extractISBNFromText: jest.fn().mockReturnValue({ isValid: false }),
}))

describe('CameraCaptureコンポーネント', () => {
  const mockOnCapture = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('初期状態で適切な要素が表示される', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    expect(screen.getByText('📷 ISBN撮影')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '📷 カメラを起動' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument()
  })

  test('カメラ起動ボタンをクリックするとカメラが起動する', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    const startButton = screen.getByRole('button', { name: '📷 カメラを起動' })
    fireEvent.click(startButton)

    expect(screen.getByTestId('webcam')).toBeInTheDocument()
    expect(screen.getByText('📷 背面')).toBeInTheDocument()
  })

  test('前面・背面カメラ切り替えボタンが動作する', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    // カメラを起動
    const startButton = screen.getByRole('button', { name: '📷 カメラを起動' })
    fireEvent.click(startButton)

    // 切り替えボタンをクリック
    const switchButton = screen.getByText('📷 背面')
    fireEvent.click(switchButton)
    
    expect(screen.getByText('🤳 前面')).toBeInTheDocument()
  })

  test('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: '閉じる' })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('撮影ボタンが表示される', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    // カメラを起動
    const startButton = screen.getByRole('button', { name: '📷 カメラを起動' })
    fireEvent.click(startButton)

    // 撮影ボタンが表示されることを確認
    expect(screen.getByRole('button', { name: /撮影する/ })).toBeInTheDocument()
  })

  test('停止ボタンが動作する', () => {
    render(<CameraCapture onCapture={mockOnCapture} onClose={mockOnClose} />)
    
    // カメラを起動
    const startButton = screen.getByRole('button', { name: '📷 カメラを起動' })
    fireEvent.click(startButton)

    // 停止ボタンをクリック
    const stopButton = screen.getByText('📴 停止')
    fireEvent.click(stopButton)
    
    // 起動ボタンが再び表示される
    expect(screen.getByRole('button', { name: '📷 カメラを起動' })).toBeInTheDocument()
  })
})