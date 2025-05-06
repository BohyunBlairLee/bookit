import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookSearchResult } from "@shared/schema";
import { Search, X, Plus, Cat } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["/api/books/search", query],
    queryFn: async ({ queryKey }) => {
      const searchQuery = queryKey[1] as string;
      if (!searchQuery) return { results: [], total: 0 };
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to search books");
      return res.json();
    },
    enabled: false, // 자동 fetch 방지, 사용자가 검색 버튼을 클릭할 때만 실행
  });
  
  // API 응답 구조에 맞게 searchResults 추출
  const searchResults = data?.results || [];
  
  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    refetch();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const clearSearch = () => {
    setQuery("");
    setIsSearching(false);
  };
  
  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-xl font-bold">홈</h1>
        <button 
          className="text-black"
          onClick={() => setShowAddBookModal(true)}
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="relative mt-4">
        <input
          type="text"
          className="search-input pr-8"
          placeholder="책 제목, 작가로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {!isSearching && (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Cat size={48} className="text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            읽고 있는 책이 없어요!
            <br/>
            책을 추가하고 독서 기록을 시작하세요 :)
          </p>
          <button 
            className="purple-button mt-6 max-w-xs"
            onClick={() => setShowAddBookModal(true)}
          >
            책 추가하기
          </button>
        </div>
      )}
      
      {isSearching && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">책 검색 결과</h2>
          
          {isLoading ? (
            <div className="text-center py-6">
              <p>검색 중...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-6">
              <p className="text-destructive">검색 중 오류가 발생했습니다.</p>
              <button
                onClick={() => refetch()}
                className="text-primary text-sm mt-2"
              >
                다시 시도
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((book) => (
                <a
                  key={book.title + book.author}
                  href={`/search/details?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&coverUrl=${encodeURIComponent(book.coverUrl)}`}
                  className="book-item block"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      {book.publishedDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {book.publisher} | {book.publishedDate}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* 책 추가 모달 (검색 역할도 함께 수행) */}
      {showAddBookModal && (
        <div className="mobile-modal">
          <div className="mobile-modal-header">
            <button 
              className="text-muted-foreground"
              onClick={() => setShowAddBookModal(false)}
            >
              <X size={24} />
            </button>
            <h1 className="text-lg font-medium">책 추가하기</h1>
            <div className="w-6"></div> {/* 오른쪽 여백 맞추기용 */}
          </div>
          
          <div className="mobile-modal-content">
            <div className="relative mb-6">
              <input
                type="text"
                className="search-input pr-8"
                placeholder="책 제목, 작가로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              {query && (
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={clearSearch}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <button 
              className="purple-button mb-6"
              onClick={handleSearch}
              disabled={!query.trim()}
            >
              검색
            </button>
            
            {isLoading ? (
              <div className="text-center py-6">
                <p>검색 중...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-6">
                <p className="text-destructive">검색 중 오류가 발생했습니다.</p>
                <button
                  onClick={() => refetch()}
                  className="text-primary text-sm mt-2"
                >
                  다시 시도
                </button>
              </div>
            ) : searchResults.length === 0 && query ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">검색 결과가 없습니다.</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h2 className="text-lg font-medium mb-4">검색 결과</h2>
                <div className="space-y-4">
                  {searchResults.map((book) => (
                    <a
                      key={book.title + book.author}
                      href={`/search/details?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&coverUrl=${encodeURIComponent(book.coverUrl)}`}
                      className="book-item block"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="font-medium">{book.title}</h3>
                          <p className="text-sm text-muted-foreground">{book.author}</p>
                          {book.publishedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {book.publisher} | {book.publishedDate}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
