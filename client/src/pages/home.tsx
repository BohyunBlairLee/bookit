import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookSearchResult, ReadingStatus, Book } from "@shared/schema";
import { X, Plus, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import BookBottomSheet from "@/components/BookBottomSheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api";
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from "wouter";
import { CapacitorHttp } from "@capacitor/core";

// 책 아이템 컴포넌트 (바텀시트 상태 처리를 위해 분리)
function BookItem({ book }: { book: BookSearchResult }) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add book mutation - 클릭시 바로 추가 동작 제거
  const addBookMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/books", {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        status: ReadingStatus.WANT,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책이 내 서재에 추가되었습니다!",
        description: `"${book.title}"이(가) 내 서재에 추가되었습니다.`,
      });
    },
    onError: (error) => {
      toast({
        title: "책을 추가하지 못했습니다",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  return (
    <div>
      <div
        onClick={() => setShowBottomSheet(true)}
        className="book-item block cursor-pointer"
      >
        <div className="flex items-start gap-4">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-28 h-40 object-cover rounded-md flex-shrink-0"
          />
          <div className="pt-2">
            <h3 className="font-bold text-base">{book.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{book.author}</p>
            {book.publishedDate && (
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {book.publisher} | {book.publishedDate}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <BookBottomSheet 
        book={book}
        open={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      />
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 책 검색 쿼리
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
      const res = await apiRequest("GET", `/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data;
    },
    enabled: false, // 자동 fetch 방지, 사용자가 검색 버튼을 클릭할 때만 실행
  });
  
  // 내 책 목록 가져오기
  const { data: myBooks, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/books'],
    queryFn: async () => {
      const res = await CapacitorHttp.get({
        url: getApiUrl('/api/books'),
      });
      if (res.status < 200 || res.status >= 300) throw new Error('Failed to fetch books');
      return res.data;
    }
  });
  
  // 읽고 있는 책만 필터링
  const readingBooks = myBooks ? myBooks.filter((book: Book) => book.status === ReadingStatus.READING) : [];
  
  // 캐러셀 코드
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);
  
  // API 응답 구조에 맞게 searchResults 추출
  const searchResults = data?.results || [];
  
  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    refetch();
  };
  
  const clearSearch = () => {
    setQuery("");
    setIsSearching(false);
  };
  
  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-2xl font-bold">홈</h1>
        <button 
          className="text-black"
          onClick={() => setShowAddBookModal(true)}
        >
          <Plus size={24} />
        </button>
      </div>
      
      {!isSearching && (
        <>
          {isLoadingBooks ? (
            <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : readingBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <span className="text-5xl mb-4">🐱</span>
              <p className="text-center text-muted-foreground">
                읽고 있는 책이 없어요!
              </p>
              <p className="text-center text-muted-foreground">
                책을 추가하고
              </p>
              <p className="text-center text-muted-foreground">
                독서 기록을 시작하세요 :)
              </p>
              <button
                className="bg-primary text-white rounded-full px-12 py-3 font-medium mt-6"
                onClick={() => setShowAddBookModal(true)}
              >
                책 추가하기
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-orange-500 mr-1">🔥</span>
                  <h2 className="text-lg font-bold">읽는 중</h2>
                </div>
                <div className="book-counter">
                  {currentIndex + 1}권 / {readingBooks.length}권
                </div>
              </div>

              <div className="reading-book-carousel">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {readingBooks.map((book: Book) => (
                      <div className="flex-[0_0_100%]" key={book.id}>
                        <div className="reading-book-container">
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="reading-book-cover"
                          />
                          <h3 className="book-title">{book.title}</h3>
                          <p className="book-author">{book.author}</p>
                          <p className="book-info">
                            {book.publisher} | {
                              book.publishedDate 
                                ? new Date(book.publishedDate).getFullYear() + '년 ' + 
                                  (new Date(book.publishedDate).getMonth() + 1) + '월'
                                : ''
                            }
                          </p>
                          <Link to={`/book/${book.id}`}>
                            <button className="continue-reading-button">
                              독서 기록하기
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {readingBooks.length > 1 && (
                  <div className="carousel-arrows">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
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
              {searchResults.map((book: BookSearchResult) => (
                <BookItem key={book.title + book.author} book={book} />
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
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-medium">책 추가</h1>
            <button className="text-muted-foreground">
              <SlidersHorizontal size={20} />
            </button>
          </div>

          <form className="px-4 pt-2 pb-2 bg-white" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]" />
              <input
                type="search"
                className="w-full bg-[var(--surface)] rounded-[10px] pl-10 pr-10 py-3 text-sm placeholder:text-[var(--text-placeholder)]"
                placeholder="책 제목, 작가로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]"
                  onClick={clearSearch}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>

          <div className="mobile-modal-content">
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
              <div className="space-y-4">
                {searchResults.map((book: BookSearchResult) => (
                  <BookItem key={book.title + book.author} book={book} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
