import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book, ReadingStatus } from "@shared/schema";
import { Plus, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FilterStatus = "all" | "want" | "reading" | "completed";

export default function MyLibrary() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const { toast } = useToast();
  
  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: [
      "/api/books", 
      filterStatus !== "all" ? filterStatus : undefined
    ],
    queryFn: async ({ queryKey }) => {
      const status = queryKey[1];
      const url = status ? `/api/books?status=${status}` : '/api/books';
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch books");
      return res.json();
    }
  });

  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-xl font-bold">나의 책장</h1>
        <button className="text-primary">
          <Plus size={24} />
        </button>
      </div>
      
      <div className="filter-button-group">
        <button 
          className={`filter-button ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          전체
        </button>
        <button 
          className={`filter-button ${filterStatus === "reading" ? "active" : ""}`}
          onClick={() => setFilterStatus("reading")}
        >
          읽는 중
        </button>
        <button 
          className={`filter-button ${filterStatus === "want" ? "active" : ""}`}
          onClick={() => setFilterStatus("want")}
        >
          읽을 예정
        </button>
        <button 
          className={`filter-button ${filterStatus === "completed" ? "active" : ""}`}
          onClick={() => setFilterStatus("completed")}
        >
          완독!
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-center">
          <p>책을 불러오는 중...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">읽고 있는 책이 없어요!</p>
          <p className="text-muted-foreground">책을 추가하고 독서 기록을 시작하세요 :)</p>
          <button className="purple-button mt-4" onClick={() => window.location.href = "/"}>
            책 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-4">
          {books.map((book) => (
            <a key={book.id} href={`/books/${book.id}`} className="flex flex-col items-center">
              <div className="w-full h-40 overflow-hidden rounded-lg mb-2">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium text-sm line-clamp-1 text-center">{book.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 text-center">{book.author}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}