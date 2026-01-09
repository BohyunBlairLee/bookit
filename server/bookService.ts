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
  { title: "82년생 김지영", author: "조남주", coverUrl: DEFAULT_BOOK_COVERS[0], publisher: "민음사", publishedDate: "2016-10-14" },
  { title: "파친코", author: "이민진", coverUrl: DEFAULT_BOOK_COVERS[1], publisher: "문학사상", publishedDate: "2017-11-22" },
  { title: "사피엔스", author: "유발 하라리", coverUrl: DEFAULT_BOOK_COVERS[2], publisher: "김영사", publishedDate: "2015-11-24" },
  { title: "미드나잇 라이브러리", author: "매트 헤이그", coverUrl: DEFAULT_BOOK_COVERS[3], publisher: "인플루엔셜", publishedDate: "2021-03-31" },
  { title: "달러구트 꿈 백화점", author: "이미예", coverUrl: DEFAULT_BOOK_COVERS[4], publisher: "팩토리나인", publishedDate: "2020-07-08" },
  { title: "아몬드", author: "손원평", coverUrl: DEFAULT_BOOK_COVERS[5], publisher: "창비", publishedDate: "2017-03-31" },
  { title: "채식주의자", author: "한강", coverUrl: DEFAULT_BOOK_COVERS[6], publisher: "창비", publishedDate: "2007-10-30" },
  { title: "소년이 온다", author: "한강", coverUrl: DEFAULT_BOOK_COVERS[7], publisher: "창비", publishedDate: "2014-05-19" },
  { title: "트렌드 코리아 2024", author: "김난도", coverUrl: DEFAULT_BOOK_COVERS[0], publisher: "미래의창", publishedDate: "2023-10-12" },
  { title: "불편한 편의점", author: "김호연", coverUrl: DEFAULT_BOOK_COVERS[1], publisher: "나무옆의자", publishedDate: "2021-04-20" },
  { title: "죽고 싶지만 떡볶이는 먹고 싶어", author: "백세희", coverUrl: DEFAULT_BOOK_COVERS[2], publisher: "혼", publishedDate: "2018-05-23" },
  { title: "언어의 온도", author: "이기주", coverUrl: DEFAULT_BOOK_COVERS[3], publisher: "말글터", publishedDate: "2016-08-22" },
  { title: "1Q84", author: "무라카미 하루키", coverUrl: DEFAULT_BOOK_COVERS[4], publisher: "문학동네", publishedDate: "2009-05-29" },
  { title: "해리 포터와 마법사의 돌", author: "J.K. 롤링", coverUrl: DEFAULT_BOOK_COVERS[5], publisher: "문학수첩", publishedDate: "1999-12-06" },
  { title: "데미안", author: "헤르만 헤세", coverUrl: DEFAULT_BOOK_COVERS[6], publisher: "민음사", publishedDate: "2000-04-10" },
  { title: "어린왕자", author: "생텍쥐페리", coverUrl: DEFAULT_BOOK_COVERS[7], publisher: "문학동네", publishedDate: "2007-01-25" },
  { title: "나미야 잡화점의 기적", author: "히가시노 게이고", coverUrl: DEFAULT_BOOK_COVERS[0], publisher: "현대문학", publishedDate: "2012-12-19" },
  { title: "멈추지 마라", author: "양주진", coverUrl: DEFAULT_BOOK_COVERS[1], publisher: "더퀘스트", publishedDate: "2022-04-25" },
  { title: "완득이", author: "김려령", coverUrl: DEFAULT_BOOK_COVERS[2], publisher: "창비", publishedDate: "2008-06-30" },
  { title: "호밀밭의 파수꾼", author: "J.D. 샐린저", coverUrl: DEFAULT_BOOK_COVERS[3], publisher: "민음사", publishedDate: "2001-05-20" }
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
    console.log('⭐ 원본 검색어:', query);
    
    // 검색어가 영어가 아니면 그대로 사용, 영어이면 '소설' 키워드 추가
    let searchQuery = query;
    if (/^[a-zA-Z0-9\s]+$/.test(query)) {
      searchQuery = `${query} 소설`;
    }
    
    console.log('⭐ 최종 검색어:', searchQuery);
    console.log('⭐ 카카오 API 키:', KAKAO_API_KEY.slice(0, 4) + '...');
    
    // URL 인코딩 - Buffer를 사용해 한글을 정확히 인코딩
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
    console.error('❌ Error searching books:', error);
    console.log('⚠️ Kakao API 호출 실패. Fallback 데이터 사용 중...');

    // Fallback to mock data if the API call fails
    const lowerQuery = query.toLowerCase();
    const filteredBooks = FALLBACK_KOREAN_BOOKS.filter(book =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.publisher?.toLowerCase().includes(lowerQuery)
    );

    console.log(`📚 Fallback 검색 결과: ${filteredBooks.length}건`);

    return {
      results: filteredBooks.length > 0 ? filteredBooks : FALLBACK_KOREAN_BOOKS.slice(0, 10),
      total: filteredBooks.length > 0 ? filteredBooks.length : FALLBACK_KOREAN_BOOKS.length,
      error: 'Kakao API 키가 설정되지 않았습니다. 샘플 데이터를 표시합니다.'
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
