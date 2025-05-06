import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book, ReadingStatus, UpdateBookStatus } from "@shared/schema";
import { StarRating } from "@/lib/starRating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface BookDetailDialogProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookDetailDialog({ book, open, onOpenChange }: BookDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for form
  const [status, setStatus] = useState<string>(book.status);
  const [rating, setRating] = useState<number>(book.rating || 0);
  const [completedDate, setCompletedDate] = useState<Date | undefined>(
    book.completedDate ? new Date(book.completedDate) : undefined
  );
  const [progress, setProgress] = useState<number>(book.progress || 0);
  const [notes, setNotes] = useState<string>(book.notes || "");

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async (updateData: UpdateBookStatus) => {
      const res = await apiRequest("PATCH", `/api/books/${updateData.id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책 정보가 업데이트되었습니다",
        variant: "default",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "업데이트 실패",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Remove book mutation
  const removeBookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책이 삭제되었습니다",
        variant: "default",
      });
      onOpenChange(false);
    }
  });

  // Handle form submission
  const handleSave = () => {
    updateBookMutation.mutate({
      id: book.id,
      status: status as (typeof ReadingStatus)[keyof typeof ReadingStatus],
      rating,
      completedDate: completedDate ? completedDate.toISOString() : undefined,
      progress,
      notes,
    });
  };

  // Handle book deletion
  const handleDelete = () => {
    if (confirm("정말로 이 책을 삭제하시겠습니까?")) {
      removeBookMutation.mutate(book.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start mb-2">
            <DialogTitle className="text-2xl font-bold text-primary">책 상세</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img 
              src={book.coverUrl}
              alt={`${book.title} 책 표지`}
              className="w-full rounded-lg shadow-md"
            />
          </div>

          <div className="md:w-2/3">
            <h3 className="text-2xl font-bold text-primary mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-4">{book.author}</p>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">읽기 상태</h4>
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant={status === ReadingStatus.WANT ? "secondary" : "outline"}
                  onClick={() => setStatus(ReadingStatus.WANT)}
                  className={status === ReadingStatus.WANT ? "text-white font-bold shadow-md" : ""}
                >
                  읽을 예정
                </Button>
                <Button 
                  variant={status === ReadingStatus.READING ? "secondary" : "outline"}
                  onClick={() => setStatus(ReadingStatus.READING)}
                  className={status === ReadingStatus.READING ? "text-white font-bold shadow-md" : ""}
                >
                  읽는 중
                </Button>
                <Button 
                  variant={status === ReadingStatus.COMPLETED ? "default" : "outline"}
                  className={status === ReadingStatus.COMPLETED ? "bg-accent hover:bg-accent/90 text-white font-bold shadow-md" : ""}
                  onClick={() => {
                    setStatus(ReadingStatus.COMPLETED);
                    // 기본값 설정
                    if (!completedDate) {
                      setCompletedDate(new Date());
                    }
                  }}
                >
                  완독!
                </Button>
              </div>
            </div>
            
            {/* 상태 라벨 표시 */}
            <div className="mb-6">
              <p className={`font-semibold text-center ${
                status === ReadingStatus.READING ? 'text-primary' : 
                status === ReadingStatus.WANT ? 'text-primary' : 
                status === ReadingStatus.COMPLETED ? 'text-primary' : ''
              }`}>
                {status === ReadingStatus.READING ? '읽는 중' : 
                 status === ReadingStatus.WANT ? '읽을 예정' : 
                 status === ReadingStatus.COMPLETED ? '완독!' : ''}
              </p>
            </div>

            {status === ReadingStatus.READING && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">읽기 진행률</h4>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              </div>
            )}

            {status === ReadingStatus.COMPLETED && (
              <>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">평점</h4>
                  <StarRating 
                    rating={rating} 
                    onChange={setRating} 
                    size="lg"
                  />
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">완독일</h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !completedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {completedDate ? (
                          format(completedDate, 'PPP', { locale: ko })
                        ) : (
                          <span>날짜 선택</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={completedDate}
                        onSelect={setCompletedDate}
                        initialFocus
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">메모</h4>
              <Textarea 
                className="w-full"
                rows={4}
                placeholder="이 책에 대한 생각을 기록해보세요"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={removeBookMutation.isPending}
              >
                {removeBookMutation.isPending ? "삭제 중..." : "삭제하기"}
              </Button>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateBookMutation.isPending}
                >
                  {updateBookMutation.isPending ? "저장 중..." : "저장하기"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
