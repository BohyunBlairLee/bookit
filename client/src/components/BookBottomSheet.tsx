import { useState } from "react";
import { Button } from "@/components/ui/button";
import SimpleBottomSheet from "./SimpleBottomSheet";
import { Plus } from "lucide-react";
import { BookSearchResult, ReadingStatus } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookBottomSheetProps {
  book: BookSearchResult;
  open: boolean;
  onClose: () => void;
}

export default function BookBottomSheet({ book, open, onClose }: BookBottomSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>(ReadingStatus.WANT);

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (newBook: any) => {
      console.log("Adding book:", JSON.stringify(newBook, null, 2));
      
      try {
        const res = await apiRequest("POST", "/api/books", newBook);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error response:", JSON.stringify(errorData, null, 2));
          throw new Error(errorData.message || "Failed to add book");
        }
        const data = await res.json();
        console.log("Success response:", JSON.stringify(data, null, 2));
        return data;
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책이 내 서재에 추가되었습니다",
        description: `"${book.title}"이(가) 내 서재에 추가되었습니다.`,
        variant: "default",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error adding book:", error);
      toast({
        title: "책을 추가하지 못했습니다",
        description: error.message || String(error),
        variant: "destructive",
      });
    }
  });

  const handleAddBook = () => {
    // 출판일 처리 로직 변경 - null로 전송하여 서버 오류 회피
    const bookData = {
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      userId: 1,
      status: status as "want" | "reading" | "completed",
      publisher: book.publisher || "",
      publishedDate: null // 출판일은 일단 null로 전송
    };
    
    console.log("북데이터 전송:", JSON.stringify(bookData, null, 2));
    addBookMutation.mutate(bookData);
  };

  return (
    <SimpleBottomSheet open={open} onClose={onClose}>
      <div className="p-4">
        <div className="flex flex-row gap-4 mb-4">
          <div className="w-28 h-40 overflow-hidden rounded-lg flex-shrink-0">
            <img
              src={book.coverUrl}
              alt={`${book.title} 책 표지`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{book.title}</h3>
            <p className="text-gray-500 text-sm mb-1">{book.author}</p>
            {book.publisher && book.publishedDate && (
              <p className="text-gray-500 text-xs mb-2">
                {book.publisher} | {new Date(book.publishedDate).toLocaleDateString('ko-KR', {year: "numeric", month: "long"})}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-2 mb-4">
          <Button
            className={`flex-1 rounded-lg py-3 ${status === ReadingStatus.READING ? 'bg-[#7950F2] text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStatus(ReadingStatus.READING)}
          >
            읽는 중
          </Button>
          <Button
            className={`flex-1 rounded-lg py-3 ${status === ReadingStatus.WANT ? 'bg-[#7950F2] text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStatus(ReadingStatus.WANT)}
          >
            읽을 예정
          </Button>
          <Button
            className={`flex-1 rounded-lg py-3 ${status === ReadingStatus.COMPLETED ? 'bg-[#7950F2] text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setStatus(ReadingStatus.COMPLETED)}
          >
            완독!
          </Button>
        </div>
        
        <Button 
          className="w-full bg-[#7950F2] hover:bg-[#7950F2]/90 py-5 rounded-lg text-white"
          onClick={handleAddBook}
          disabled={addBookMutation.isPending}
        >
          {addBookMutation.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          책 추가하기
        </Button>
      </div>
    </SimpleBottomSheet>
  );
}