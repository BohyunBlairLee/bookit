// A collection of book covers that can be used for mock books
const BOOK_COVERS = [
  "https://images.unsplash.com/photo-1629992101753-56d196c8aabb",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
  "https://images.unsplash.com/photo-1589998059171-988d887df646",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  "https://images.unsplash.com/photo-1476275466078-4007374efbbe",
  "https://images.unsplash.com/photo-1603284569248-821525309698",
  "https://images.unsplash.com/photo-1531928351158-2f736078e0a1"
];

// Korean books for search results
const KOREAN_BOOKS = [
  { title: "82년생 김지영", author: "조남주", coverUrl: BOOK_COVERS[0] },
  { title: "위저드 베이커리", author: "구병모", coverUrl: BOOK_COVERS[1] },
  { title: "어떻게 살 것인가", author: "유시민", coverUrl: BOOK_COVERS[2] },
  { title: "파친코", author: "이민진", coverUrl: BOOK_COVERS[3] },
  { title: "부의 추월차선", author: "엠제이 드마코", coverUrl: BOOK_COVERS[4] },
  { title: "사피엔스", author: "유발 하라리", coverUrl: BOOK_COVERS[5] },
  { title: "데미안", author: "헤르만 헤세", coverUrl: BOOK_COVERS[1] },
  { title: "아침 명상의 힘", author: "할 엘로드", coverUrl: BOOK_COVERS[2] },
  { title: "코스모스", author: "칼 세이건", coverUrl: BOOK_COVERS[5] },
  { title: "멋진 신세계", author: "올더스 헉슬리", coverUrl: BOOK_COVERS[6] },
  { title: "이기적 유전자", author: "리처드 도킨스", coverUrl: BOOK_COVERS[7] },
  { title: "나미야 잡화점의 기적", author: "히가시노 게이고", coverUrl: BOOK_COVERS[0] }
];

/**
 * Search for books by query string
 * @param query - The search query
 * @returns Array of matching books
 */
export function searchBooks(query: string) {
  if (!query || query.trim() === '') {
    return { results: [], total: 0 };
  }

  const normalizedQuery = query.toLowerCase();
  const results = KOREAN_BOOKS.filter(book => 
    book.title.toLowerCase().includes(normalizedQuery) || 
    book.author.toLowerCase().includes(normalizedQuery)
  ).map((book, index) => ({
    id: `search-${index}`,
    ...book
  }));

  return {
    results,
    total: results.length
  };
}

/**
 * Get random book cover URL
 */
export function getRandomBookCover() {
  const randomIndex = Math.floor(Math.random() * BOOK_COVERS.length);
  return BOOK_COVERS[randomIndex];
}
