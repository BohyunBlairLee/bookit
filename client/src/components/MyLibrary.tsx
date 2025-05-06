import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book, ReadingStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import BookCard from "./BookCard";
import { Skeleton } from "@/components/ui/skeleton";

type FilterStatus = "all" | "want" | "reading" | "completed";

export default function MyLibrary() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Fetch books query
  const { data: books, isLoading } = useQuery({
    queryKey: ['/api/books', filterStatus !== "all" ? filterStatus : null],
    queryFn: undefined,
  });

  // Get query param for API based on filter
  const getQueryParam = () => {
    if (filterStatus === "all") return null;
    return filterStatus;
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-primary">내 서재</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="text-sm text-primary font-medium flex items-center"
          >
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            필터
          </Button>
          <div className="flex rounded-md overflow-hidden">
            <Button 
              variant={filterStatus === "all" ? "default" : "outline"}
              className={filterStatus === "all" ? "bg-secondary text-white" : ""}
              onClick={() => setFilterStatus("all")}
            >
              모든 책
            </Button>
            <Button 
              variant={filterStatus === "reading" ? "default" : "outline"}
              className={filterStatus === "reading" ? "bg-secondary text-white" : ""}
              onClick={() => setFilterStatus("reading")}
            >
              읽는 중
            </Button>
            <Button 
              variant={filterStatus === "completed" ? "default" : "outline"}
              className={filterStatus === "completed" ? "bg-accent text-white" : ""}
              onClick={() => setFilterStatus("completed")}
            >
              완독!
            </Button>
          </div>
        </div>
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
          {books && books.length > 0 ? (
            books.map((book: Book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">
                {filterStatus === "all" 
                  ? "아직 책이 없습니다. 책을 검색하여 추가해보세요."
                  : filterStatus === "reading"
                    ? "읽고 있는 책이 없습니다."
                    : filterStatus === "completed"
                      ? "완독한 책이 없습니다."
                      : "읽을 예정인 책이 없습니다."}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
