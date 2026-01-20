import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BookCard from "./BookCard";
import { BookSearchResult } from "@shared/schema";
import { getApiUrl } from "@/lib/api";
import { CapacitorHttp } from '@capacitor/core';

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Debounce search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      setDebouncedQuery(e.target.value);
    }, 500);
    setSearchTimeout(timeout);
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
    queryFn: async () => {
      // Capacitor HTTP를 사용하여 네이티브 HTTP 요청
      const response = await CapacitorHttp.post({
        url: getApiUrl('/api/books/search'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: { query: debouncedQuery },
      });

      if (response.status !== 200) {
        throw new Error('검색에 실패했습니다');
      }
      return response.data;
    },
    enabled: debouncedQuery.length > 0,
  });

  const searchResults = data?.results || [];
  const totalResults = data?.total || 0;

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
                <BookCard 
                  key={book.id || `${book.title}-${book.author}`}
                  book={book}
                  isSearchResult
                />
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
    </>
  );
}
