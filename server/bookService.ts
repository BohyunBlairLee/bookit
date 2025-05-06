import fetch from 'node-fetch';
import { BookSearchResult } from '@shared/schema';

// A collection of book covers that can be used for default book covers
const DEFAULT_BOOK_COVERS = [
  "https://images.unsplash.com/photo-1629992101753-56d196c8aabb",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
  "https://images.unsplash.com/photo-1589998059171-988d887df646",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe",
  "https://images.unsplash.com/photo-1603284569248-821525309698",
  "https://images.unsplash.com/photo-1531928351158-2f736078e0a1"
];

// Fallback Korean books in case the API fails
const FALLBACK_KOREAN_BOOKS = [
  { title: "82년생 김지영", author: "조남주", coverUrl: DEFAULT_BOOK_COVERS[0] },
  { title: "파친코", author: "이민진", coverUrl: DEFAULT_BOOK_COVERS[3] },
  { title: "사피엔스", author: "유발 하라리", coverUrl: DEFAULT_BOOK_COVERS[5] }
];

// Kakao Books API URL
const KAKAO_API_URL = 'https://dapi.kakao.com/v3/search/book';
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || '';

/**
 * Search for books using Kakao Books API
 * @param query - The search query
 * @returns Array of matching books
 */
export async function searchBooks(query: string) {
  if (!query || query.trim() === '') {
    return { results: [], total: 0 };
  }

  try {
    // 검색어가 한글이 아니면 '소설'로 기본 검색 (테스트용)
    const searchQuery = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query) ? query : `${query} 소설`;
    
    const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(searchQuery)}&size=10`, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch data from Kakao Books API');
    }

    const data = await response.json() as {
      documents: Array<{
        title: string;
        authors: string[];
        thumbnail: string;
        publisher: string;
        datetime: string;
      }>;
      meta: {
        total_count: number;
      };
    };
    
    const results: BookSearchResult[] = data.documents.map((book) => ({
      title: book.title,
      author: book.authors.join(', '),
      coverUrl: book.thumbnail || getRandomBookCover(),
      publisher: book.publisher,
      publishedDate: book.datetime?.split('T')[0],
    }));

    return {
      results,
      total: data.meta.total_count
    };
  } catch (error) {
    console.error('Error searching books:', error);
    
    // Fallback to mock data if the API call fails
    return {
      results: FALLBACK_KOREAN_BOOKS.filter(book => 
        book.title.includes(query) || book.author.includes(query)
      ),
      total: FALLBACK_KOREAN_BOOKS.length,
      error: 'API error, showing fallback results'
    };
  }
}

/**
 * Get random book cover URL
 */
export function getRandomBookCover() {
  const randomIndex = Math.floor(Math.random() * DEFAULT_BOOK_COVERS.length);
  return DEFAULT_BOOK_COVERS[randomIndex];
}
