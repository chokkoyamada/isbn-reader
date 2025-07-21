import { generateShareText, copyToClipboard, shareToX, shareToSlack } from '../share'
import { BookInfo } from '@/types'

// Navigator APIをモック化
const mockClipboard = {
  writeText: jest.fn(),
}
Object.assign(navigator, {
  clipboard: mockClipboard,
})

// window.openをモック化
const mockOpen = jest.fn()
Object.assign(window, { open: mockOpen })

describe('共有機能', () => {
  const mockBookInfo: BookInfo = {
    isbn: '9784123456789',
    title: 'サンプル書籍',
    authors: ['著者名1', '著者名2'],
    description: '書籍の説明文',
    publishedDate: '2023-01-01',
    publisher: '出版社名'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateShareText', () => {
    test('本の情報から共有用テキストを生成できる', () => {
      const result = generateShareText(mockBookInfo)
      
      expect(result).toContain('サンプル書籍')
      expect(result).toContain('著者名1, 著者名2')
      expect(result).toContain('ISBN: 9784123456789')
      expect(result).toContain('出版社: 出版社名')
      expect(result).toContain('発行年: 2023-01-01')
    })

    test('著者が一人の場合正しくテキストを生成する', () => {
      const bookWithSingleAuthor = { ...mockBookInfo, authors: ['単独著者'] }
      const result = generateShareText(bookWithSingleAuthor)
      
      expect(result).toContain('単独著者')
      expect(result).not.toContain(', ')
    })

    test('オプション情報がない場合は省略する', () => {
      const minimalBook: BookInfo = {
        isbn: '9784123456789',
        title: 'ミニマル書籍',
        authors: ['著者名']
      }
      
      const result = generateShareText(minimalBook)
      
      expect(result).toContain('ミニマル書籍')
      expect(result).toContain('著者名')
      expect(result).toContain('ISBN: 9784123456789')
      expect(result).not.toContain('出版社:')
      expect(result).not.toContain('発行年:')
    })
  })

  describe('copyToClipboard', () => {
    test('テキストをクリップボードにコピーできる', async () => {
      const testText = 'コピーするテキスト'
      mockClipboard.writeText.mockResolvedValue(undefined)

      await copyToClipboard(testText)

      expect(mockClipboard.writeText).toHaveBeenCalledWith(testText)
    })

    test('コピーが失敗した場合エラーを投げる', async () => {
      const testText = 'コピーするテキスト'
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'))

      await expect(copyToClipboard(testText)).rejects.toThrow('Clipboard error')
    })
  })

  describe('shareToX', () => {
    test('X（Twitter）共有URLを正しく生成して新しいウィンドウを開く', () => {
      const testText = 'Xに共有するテキスト'
      
      shareToX(testText)

      const expectedUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(testText)}`
      expect(mockOpen).toHaveBeenCalledWith(expectedUrl, '_blank')
    })
  })

  describe('shareToSlack', () => {
    test('Slack共有URLを正しく生成して新しいウィンドウを開く', () => {
      const testText = 'Slackに共有するテキスト'
      
      shareToSlack(testText)

      const expectedUrl = `https://slack.com/intl/ja-jp/shared?text=${encodeURIComponent(testText)}`
      expect(mockOpen).toHaveBeenCalledWith(expectedUrl, '_blank')
    })
  })
})