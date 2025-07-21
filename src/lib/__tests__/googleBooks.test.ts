import { getBookInfoByISBN } from '../googleBooks'
import { BookInfo } from '@/types'

// axiosをモック化
jest.mock('axios')
import axios from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Google Books API連携', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getBookInfoByISBN', () => {
    test('正常なISBNで本の情報を取得できる', async () => {
      const mockResponse = {
        data: {
          totalItems: 1,
          items: [
            {
              volumeInfo: {
                title: 'サンプル書籍',
                authors: ['著者名'],
                description: '書籍の説明文',
                publishedDate: '2023-01-01',
                publisher: '出版社名',
                pageCount: 300,
                imageLinks: {
                  thumbnail: 'https://example.com/image.jpg'
                },
                industryIdentifiers: [
                  {
                    type: 'ISBN_13',
                    identifier: '9784123456789'
                  }
                ]
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result: BookInfo = await getBookInfoByISBN('9784123456789')

      expect(result.isbn).toBe('9784123456789')
      expect(result.title).toBe('サンプル書籍')
      expect(result.authors).toEqual(['著者名'])
      expect(result.description).toBe('書籍の説明文')
      expect(result.publishedDate).toBe('2023-01-01')
      expect(result.publisher).toBe('出版社名')
      expect(result.pageCount).toBe(300)
      expect(result.imageUrl).toBe('https://example.com/image.jpg')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:9784123456789`
      )
    })

    test('書籍が見つからない場合エラーを投げる', async () => {
      const mockResponse = {
        data: {
          totalItems: 0,
          items: []
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      await expect(getBookInfoByISBN('9999999999999')).rejects.toThrow(
        '書籍が見つかりませんでした'
      )
    })

    test('API呼び出しが失敗した場合エラーを投げる', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'))

      await expect(getBookInfoByISBN('9784123456789')).rejects.toThrow(
        'Network Error'
      )
    })

    test('著者情報がない場合空配列を返す', async () => {
      const mockResponse = {
        data: {
          totalItems: 1,
          items: [
            {
              volumeInfo: {
                title: 'タイトルのみの書籍',
                industryIdentifiers: [
                  {
                    type: 'ISBN_13',
                    identifier: '9784123456789'
                  }
                ]
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result: BookInfo = await getBookInfoByISBN('9784123456789')

      expect(result.authors).toEqual([])
      expect(result.title).toBe('タイトルのみの書籍')
    })

    test('画像URLがない場合undefinedを返す', async () => {
      const mockResponse = {
        data: {
          totalItems: 1,
          items: [
            {
              volumeInfo: {
                title: '画像なしの書籍',
                authors: ['著者名'],
                industryIdentifiers: [
                  {
                    type: 'ISBN_13',
                    identifier: '9784123456789'
                  }
                ]
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result: BookInfo = await getBookInfoByISBN('9784123456789')

      expect(result.imageUrl).toBeUndefined()
    })
  })
})