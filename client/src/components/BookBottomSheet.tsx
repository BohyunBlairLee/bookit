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
      console.log("Adding book:", newBook);
      const res = await apiRequest("POST", "/api/books", newBook);
      const data = await res.json();
      console.log("Response:", data);
      return data;
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
    onError: (error) => {
      console.error("Error adding book:", error);
      toast({
        title: "책을 추가하지 못했습니다",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const handleAddBook = () => {
    addBookMutation.mutate({
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      userId: 1,
      status: status as "want" | "reading" | "completed",
      publisher: book.publisher || "",
      publishedDate: book.publishedDate ? new Date(book.publishedDate) : undefined
    });
  };

  return (
    <SimpleBottomSheet open={open} onClose={onClose}>
      <div className="px-1 py-2">
        <div className="flex gap-5 mb-5">
          <div className="w-1/3 aspect-[3/4] overflow-hidden rounded-md flex-shrink-0">
            <img
              src={book.coverUrl}
              alt={`${book.title} 책 표지`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1 break-keep">{book.title}</h3>
            <div className="flex flex-col gap-2">
              <p className="text-gray-500 text-sm">{book.author}</p>
              {book.publisher && <p className="text-gray-500 text-xs">출판사: {book.publisher}</p>}
              {book.publishedDate && (
                <p className="text-gray-500 text-xs">
                  출판일: {new Date(book.publishedDate).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-gray-700">독서 상태</h4>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="독서 상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ReadingStatus.WANT}>읽을 예정</SelectItem>
                <SelectItem value={ReadingStatus.READING}>읽는 중</SelectItem>
                <SelectItem value={ReadingStatus.COMPLETED}>완독!</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90"
          onClick={handleAddBook}
          disabled={addBookMutation.isPending}
        >
          {addBookMutation.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
          ) : (
            <Plus className="h-5 w-5 mr-2" />
          )}
          내 서재에 추가하기
        </Button>
      </div>
    </SimpleBottomSheet>
  );
}