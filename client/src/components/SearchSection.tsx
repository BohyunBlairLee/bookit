import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookSearchResult } from "@shared/schema";
import BookBottomSheet from "./BookBottomSheet";

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  
  // Debounce search input
  const timeoutRef = useRef<number | null>(null);
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(e.target.value);
    }, 500) as unknown as number;
  };

  // Handle search button click
  const handleSearchButton = () => {
    setDebouncedQuery(searchQuery);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDebouncedQuery(searchQuery);
    }
  };

  // Search query
  const { data, isLoading } = useQuery({
    queryKey: ['/api/books/search', debouncedQuery],
    queryFn: undefined,
    enabled: debouncedQuery.length > 0,
  });

  // Safely access the data with correct typing
  const searchResults: BookSearchResult[] = data && typeof data === 'object' && 'results' in data ? data.results as BookSearchResult[] : [];
  const totalResults: number = data && typeof data === 'object' && 'total' in data ? data.total as number : 0;

  return (
    <>
      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-primary">책 검색</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="책 제목, 저자를 검색해보세요"
                  className="w-full py-6 px-4 pr-10"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 text-gray-400 hover:text-secondary"
                  onClick={handleSearchButton}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <Button 
              className="bg-secondary text-white py-3 px-6 hover:bg-secondary/90"
              onClick={handleSearchButton}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>검색</span>
            </Button>
          </div>
        </div>
      </section>

      {debouncedQuery && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">검색 결과</h2>
            <span className="text-gray-500">총 {totalResults}건</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((book: BookSearchResult) => (
                <div 
                  key={book.id || `${book.title}-${book.author}`}
                  className="book-card bg-white rounded-lg shadow-md overflow-hidden transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedBook(book);
                    setBottomSheetOpen(true);
                  }}
                >
                  <div className="relative pb-[140%]">
                    <img 
                      src={book.coverUrl}
                      alt={`${book.title} 책 표지`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 text-primary line-clamp-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-1">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {book.publisher || "출판사 정보 없음"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-secondary hover:text-primary hover:bg-secondary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBook(book);
                          setBottomSheetOpen(true);
                        }}
                      >
                        자세히
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && debouncedQuery && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {selectedBook && (
        <BookBottomSheet 
          book={selectedBook}
          open={bottomSheetOpen}
          onClose={() => {
            setBottomSheetOpen(false);
            setSelectedBook(null);
          }}
        />
      )}
    </>
  );
}
