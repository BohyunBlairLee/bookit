import { useQuery } from "@tanstack/react-query";
import { Book, ReadingStatus } from "@shared/schema";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookCard from "@/components/BookCard";

type FilterStatus = "all" | "want" | "reading" | "completed";

export default function MyLibrary() {
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  
  // 모든 책을 가져오는 쿼리
  const { data: books = [], isLoading, error } = useQuery<Book[]>({
    queryKey: ['/api/books'],
    enabled: activeTab === "all"
  });

  // 특정 독서 상태별 책을 가져오는 쿼리
  const { data: filteredBooks = [] } = useQuery<Book[]>({
    queryKey: ['/api/books', { status: activeTab }],
    enabled: activeTab !== "all"
  });

  // 현재 탭에 따라 보여줄 책 결정
  const booksToShow: Book[] = activeTab === "all" ? books : filteredBooks;

  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterStatus);
  };

  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-xl font-bold">나의 책장</h1>
      </div>
      
      <div className="filter-button-group">
        <button 
          className={`filter-button ${activeTab === "all" ? "active" : ""}`}
          onClick={() => handleTabChange("all")}
        >
          전체
        </button>
        <button 
          className={`filter-button ${activeTab === "want" ? "active" : ""}`}
          onClick={() => handleTabChange("want")}
        >
          읽을 예정
        </button>
        <button 
          className={`filter-button ${activeTab === "reading" ? "active" : ""}`}
          onClick={() => handleTabChange("reading")}
        >
          읽는 중
        </button>
        <button 
          className={`filter-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => handleTabChange("completed")}
        >
          완독
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center mt-8">
          <p>로딩 중...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center mt-8">
          <p className="text-destructive">오류가 발생했습니다.</p>
        </div>
      ) : booksToShow.length === 0 ? (
        <div className="flex flex-col justify-center items-center mt-12">
          <p className="text-muted-foreground mb-4">아직 책이 없습니다.</p>
          <a href="/" className="purple-button w-40">
            책 추가하기
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4 pb-20">
          {booksToShow.map((book: Book) => (
            <BookCard 
              key={book.id} 
              book={book}
            />
          ))}
        </div>
      )}
    </div>
  );
}