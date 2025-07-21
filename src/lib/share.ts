import { BookInfo } from '@/types'

export function generateShareText(bookInfo: BookInfo): string {
  const parts = [
    `📚 ${bookInfo.title}`,
    `👤 ${bookInfo.authors.join(', ')}`,
    `🔖 ISBN: ${bookInfo.isbn}`
  ]

  if (bookInfo.publisher) {
    parts.push(`📖 出版社: ${bookInfo.publisher}`)
  }

  if (bookInfo.publishedDate) {
    parts.push(`📅 発行年: ${bookInfo.publishedDate}`)
  }

  return parts.join('\n')
}

export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    throw error
  }
}

export function shareToX(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export function shareToSlack(text: string): void {
  const url = `https://slack.com/intl/ja-jp/shared?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}