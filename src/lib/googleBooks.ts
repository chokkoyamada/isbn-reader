import axios from 'axios'
import { BookInfo } from '@/types'

export async function getBookInfoByISBN(isbn: string): Promise<BookInfo> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )

    if (response.data.totalItems === 0) {
      throw new Error('書籍が見つかりませんでした')
    }

    const volumeInfo = response.data.items[0].volumeInfo

    return {
      isbn,
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description,
      publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher,
      pageCount: volumeInfo.pageCount,
      imageUrl: volumeInfo.imageLinks?.thumbnail
    }
  } catch (error) {
    throw error
  }
}