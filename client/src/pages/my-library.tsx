import { useQuery } from "@tanstack/react-query";
import { Book, ReadingStatus } from "@shared/schema";
import { useState } from "react";
import BookThumbnail from "@/components/BookThumbnail";
import { Plus } from "lucide-react";
import { Link } from "wouter";

type FilterStatus = "all" | "want" | "reading" | "completed";

export default function MyLibrary() {
  const [activeTab, setActiveTab] = useState<FilterStatus>("all");
  
  // 모든 책을 가져오는 쿼리
  const { data: books = [], isLoading, error } = useQuery<Book[]>({
    queryKey: ['/api/books']
  });

  // 현재 탭에 따라 보여줄 책 필터링
  const booksToShow = books.filter(book => {
    if (activeTab === "all") return true;
    if (activeTab === "want") return book.status === ReadingStatus.WANT;
    if (activeTab === "reading") return book.status === ReadingStatus.READING;
    if (activeTab === "completed") return book.status === ReadingStatus.COMPLETED;
    return false;
  });

  const filterLabels = {
    all: "전체",
    reading: "읽는 중",
    want: "읽을 예정",
    completed: "완독!"
  };

  return (
    <div className="page-container">
      <div className="mobile-header flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">나의 책장</h1>
        <Link to="/">
          <button className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100">
            <Plus className="w-5 h-5" />
          </button>
        </Link>
      </div>
      
      {/* 필터 탭 */}
      <div className="filter-tabs flex rounded-full bg-gray-100 p-1 mb-6">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button 
            key={key}
            className={`flex-1 py-2 px-4 rounded-full text-sm transition-all
              ${activeTab === key 
                ? 'bg-primary text-white font-bold shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab(key as FilterStatus)}
          >
            {label}
          </button>
        ))}
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
          <p className="text-muted-foreground mb-4">
            {activeTab === "all" 
              ? "아직 책이 없습니다." 
              : `${filterLabels[activeTab]} 상태인 책이 없습니다.`}
          </p>
          <Link to="/" className="bg-primary text-white py-3 px-6 rounded-full font-medium">
            책 추가하기
          </Link>
        </div>
      ) : (
        <div className="book-grid mt-4">
          {booksToShow.map((book: Book) => (
            <BookThumbnail 
              key={book.id} 
              book={book}
            />
          ))}
        </div>
      )}
    </div>
  );
}