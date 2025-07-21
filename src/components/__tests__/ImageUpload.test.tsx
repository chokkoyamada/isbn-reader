import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageUpload } from '../ImageUpload'

describe('ImageUploadコンポーネント', () => {
  const mockOnImageSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ファイル選択エリアが正しく表示される', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    
    expect(screen.getByText('画像をアップロード')).toBeInTheDocument()
    expect(screen.getByText('クリックして選択またはドラッグ&ドロップ')).toBeInTheDocument()
    expect(screen.getByText('JPG, PNG, HEIC, WebP対応')).toBeInTheDocument()
  })

  test('ファイル入力でイベントが正しく発火される', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    
    const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, {
      target: { files: [file] }
    })

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file)
    })
  })

  test('無効なファイル形式の場合エラーメッセージを表示する', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    
    const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['dummy'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, {
      target: { files: [invalidFile] }
    })

    await waitFor(() => {
      expect(screen.getByText('JPG、PNG、HEIC、WebP形式のファイルを選択してください')).toBeInTheDocument()
    })
    
    expect(mockOnImageSelect).not.toHaveBeenCalled()
  })

  test('ドラッグ&ドロップでファイルを選択できる', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    
    const dropZone = screen.getByRole('button')
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    })

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file)
    })
  })

  test('複数ファイル選択時は最初のファイルのみ処理する', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    
    const fileInput = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement
    const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' })
    const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, {
      target: { files: [file1, file2] }
    })

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file1)
      expect(mockOnImageSelect).toHaveBeenCalledTimes(1)
    })
  })
})