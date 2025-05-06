import { useState } from "react";
import { 
  BookSearchResult, 
  Book, 
  ReadingStatus,
  InsertBook,
  UpdateBookStatus
} from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Check } from "lucide-react";
import { StarRating } from "@/lib/starRating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BookDetailDialog from "./BookDetailDialog";

interface BookCardProps {
  book: BookSearchResult | Book;
  isSearchResult?: boolean;
}

export default function BookCard({ book, isSearchResult = false }: BookCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [status, setStatus] = useState<string>(
    (book as Book).status || ReadingStatus.WANT
  );

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (newBook: InsertBook) => {
      const res = await apiRequest("POST", "/api/books", newBook);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책이 내 서재에 추가되었습니다!",
        description: `"${book.title}"이(가) 내 서재에 추가되었습니다.`,
        variant: "default",
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

  // Update book status mutation
  const updateBookMutation = useMutation({
    mutationFn: async (updateData: UpdateBookStatus) => {
      const res = await apiRequest("PATCH", `/api/books/${updateData.id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "독서 상태가 업데이트되었습니다",
        variant: "default",
      });
    }
  });

  // Handle book addition from search results
  const handleAddBook = () => {
    if (isSearchResult) {
      addBookMutation.mutate({
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        userId: 1,
        status,
      });
    }
  };

  // Handle status change for library books
  const handleStatusChange = (value: string) => {
    setStatus(value);
    
    if (!isSearchResult && 'id' in book && typeof book.id === 'number') {
      const updateData = {
        id: book.id,
        status: value as "want" | "reading" | "completed",
      };
      
      // 완독 상태로 변경할 때는 필수 필드 추가
      if (value === 'completed') {
        const typedBook = book as Book;
        updateBookMutation.mutate({
          id: updateData.id,
          status: 'completed',
          rating: typedBook.rating || 0,
          completedDate: new Date().toISOString()
        });
      } else {
        updateBookMutation.mutate(updateData);
      }
    }
  };

  // Determine which type of card to render based on status and isSearchResult
  const renderCard = () => {
    if (isSearchResult) {
      return renderSearchResultCard();
    } else if ((book as Book).status === ReadingStatus.COMPLETED) {
      return renderCompletedCard();
    } else if ((book as Book).status === ReadingStatus.READING) {
      return renderReadingCard();
    } else {
      return renderPlannedCard();
    }
  };

  // Render a search result card
  const renderSearchResultCard = () => (
    <div className="book-card bg-white rounded-lg shadow-md overflow-hidden transition-all">
      <div className="relative pb-[140%]">
        <img 
          src={book.coverUrl}
          alt={`${book.title} 책 표지`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-primary">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{book.author}</p>
        <div className="flex justify-between items-center">
          <Select 
            value={status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="독서 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ReadingStatus.WANT}>읽을 예정</SelectItem>
                <SelectItem value={ReadingStatus.READING}>읽는 중</SelectItem>
                <SelectItem value={ReadingStatus.COMPLETED}>완독!</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-secondary hover:text-primary"
            onClick={handleAddBook}
            disabled={addBookMutation.isPending}
          >
            {addBookMutation.isPending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  // Render a completed book card
  const renderCompletedCard = () => {
    const typedBook = book as Book;
    return (
      <div 
        className="book-card bg-white rounded-lg shadow-md overflow-hidden transition-all cursor-pointer"
        onClick={() => setShowDetailDialog(true)}
      >
        <div className="relative pb-[140%]">
          <img 
            src={book.coverUrl}
            alt={`${book.title} 책 표지`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-primary">{book.title}</h3>
            <div className="px-2 py-1 bg-accent rounded-full text-xs text-white font-medium">완독!</div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{book.author}</p>
          <div className="mb-2">
            <StarRating 
              rating={typedBook.rating || 0} 
              readOnly 
              size="sm"
            />
          </div>
          <p className="text-xs text-gray-500">
            완독일: {typedBook.completedDate 
              ? new Date(typedBook.completedDate).toLocaleDateString('ko-KR') 
              : '기록 없음'}
          </p>
        </div>
      </div>
    );
  };

  // Render a reading book card
  const renderReadingCard = () => {
    const typedBook = book as Book;
    return (
      <div 
        className="book-card bg-white rounded-lg shadow-md overflow-hidden transition-all cursor-pointer"
        onClick={() => setShowDetailDialog(true)}
      >
        <div className="relative pb-[140%]">
          <img 
            src={book.coverUrl}
            alt={`${book.title} 책 표지`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-primary">{book.title}</h3>
            <div className="px-2 py-1 bg-secondary rounded-full text-xs text-white font-medium">읽는 중</div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{book.author}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-secondary h-2 rounded-full" 
              style={{ width: `${typedBook.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{typedBook.progress || 0}% 읽음</p>
        </div>
      </div>
    );
  };

  // Render a planned book card
  const renderPlannedCard = () => (
    <div 
      className="book-card bg-white rounded-lg shadow-md overflow-hidden transition-all cursor-pointer"
      onClick={() => setShowDetailDialog(true)}
    >
      <div className="relative pb-[140%]">
        <img 
          src={book.coverUrl}
          alt={`${book.title} 책 표지`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-primary">{book.title}</h3>
          <div className="px-2 py-1 bg-gray-400 rounded-full text-xs text-white font-medium">읽을 예정</div>
        </div>
        <p className="text-gray-600 text-sm mb-2">{book.author}</p>
        <Button 
          variant="outline" 
          className="w-full mt-2 py-5 text-sm text-secondary border-secondary hover:bg-secondary/10"
          onClick={(e) => {
            e.stopPropagation();
            if (!isSearchResult && 'id' in book && typeof book.id === 'number') {
              updateBookMutation.mutate({
                id: book.id,
                status: ReadingStatus.READING,
              });
            }
          }}
          disabled={updateBookMutation.isPending}
        >
          {updateBookMutation.isPending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent mr-2" />
          ) : (
            <BookOpen className="mr-2 h-4 w-4" />
          )}
          읽기 시작하기
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {renderCard()}
      
      {!isSearchResult && 'id' in book && (
        <BookDetailDialog
          book={book as Book}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}
    </>
  );
}
