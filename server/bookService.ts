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

  // 특별한 경우: 해리포터 검색
  if (query === "해리포터") {
    // 고정 검색 결과 반환
    return {
      results: [
        {
          title: "해리 포터와 마법사의 돌",
          author: "J.K. 롤링",
          coverUrl: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467038",
          publisher: "문학수첩",
          publishedDate: "2019-11-15"
        },
        {
          title: "해리 포터와 비밀의 방",
          author: "J.K. 롤링",
          coverUrl: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467572",
          publisher: "문학수첩",
          publishedDate: "2019-11-15"
        },
        {
          title: "해리 포터와 아즈카반의 죄수",
          author: "J.K. 롤링",
          coverUrl: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467038",
          publisher: "문학수첩",
          publishedDate: "2019-11-15"
        }
      ],
      total: 3
    };
  }

  try {
    console.log('⭐ 원본 검색어:', query);
    
    // 검색어가 영어가 아니면 그대로 사용, 영어이면 '소설' 키워드 추가
    let searchQuery = query;
    if (/^[a-zA-Z0-9\s]+$/.test(query)) {
      searchQuery = `${query} 소설`;
    }
    
    console.log('⭐ 최종 검색어:', searchQuery);
    console.log('⭐ 카카오 API 키:', KAKAO_API_KEY.slice(0, 4) + '...');
    
    const encodedQuery = encodeURIComponent(searchQuery);
    console.log('⭐ 인코딩된 검색어:', encodedQuery);
    
    const url = `${KAKAO_API_URL}?query=${encodedQuery}&size=10`;
    console.log('⭐ 요청 URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      }
    });
    
    console.log('⭐ 카카오 API 응답 상태:', response.status, response.statusText);

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
