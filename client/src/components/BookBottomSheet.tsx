import { useState } from "react";
import { BookSearchResult, ReadingStatus } from "@shared/schema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/lib/starRating";
import { format } from "date-fns";
import SimpleBottomSheet from "./SimpleBottomSheet";

interface BookBottomSheetProps {
  book: BookSearchResult;
  open: boolean;
  onClose: () => void;
}

export default function BookBottomSheet({ book, open, onClose }: BookBottomSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<string>(ReadingStatus.WANT);
  const [rating, setRating] = useState<number>(3.5);
  const [completedDate, setCompletedDate] = useState<string>("2025. 4. 3.");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  
  const addBookMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/books", {
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        publisher: book.publisher,
        publishedDate: book.publishedDate,
        status,
        ...(status === ReadingStatus.COMPLETED && {
          rating,
          completedDate
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "책이 내 서재에 추가되었습니다!",
        description: `"${book.title}"이(가) 내 서재에 추가되었습니다.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "책을 추가하지 못했습니다",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const handleAddBook = () => {
    addBookMutation.mutate();
  };
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };
  
  const renderDatePicker = () => {
    // 현재 날짜 기준 달력 표시
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // 달력의 월, 일 설정
    const daysInMonth = new Array(30).fill(0).map((_, i) => i + 1);
    
    // 선택된 날짜 (기본값: 3일)
    const selectedDay = 3;
    
    return (
      <div className="calendar-modal absolute top-0 left-0 right-0 bg-white shadow-lg rounded-xl p-4 z-10">
        <div className="calendar-header flex justify-between items-center mb-2">
          <button className="text-primary hover:bg-gray-100 p-1 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-medium">{year}년 {month}월</h3>
          <button className="text-primary hover:bg-gray-100 p-1 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="calendar-grid">
          <div className="grid grid-cols-7 text-center mb-2">
            <div className="text-gray-500 text-sm">일</div>
            <div className="text-gray-500 text-sm">월</div>
            <div className="text-gray-500 text-sm">화</div>
            <div className="text-gray-500 text-sm">수</div>
            <div className="text-gray-500 text-sm">목</div>
            <div className="text-gray-500 text-sm">금</div>
            <div className="text-gray-500 text-sm">토</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* 시작 요일만큼 빈 칸 추가 (예: 월요일 시작이면 일요일에 빈칸) */}
            <div></div>
            
            {daysInMonth.map((day) => (
              <button
                key={day}
                className={`aspect-square flex items-center justify-center rounded-full text-sm
                  ${day === selectedDay ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                onClick={() => {
                  setCompletedDate(`${year}. ${month}. ${day}.`);
                  setShowCalendar(false);
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <SimpleBottomSheet open={open} onClose={onClose} title="책 추가하기">
      <div className="flex mb-3">
        <img 
          src={book.coverUrl}
          alt={book.title}
          className="w-20 h-28 rounded-md object-cover mr-4"
        />
        <div>
          <h2 className="text-lg font-medium">{book.title}</h2>
          <p className="text-gray-500 text-sm">{book.author}</p>
          {book.publisher && book.publishedDate && (
            <p className="text-gray-500 text-xs mt-1">
              {book.publisher} | {book.publishedDate}
            </p>
          )}
        </div>
      </div>
      
      {/* 상태 선택 버튼 */}
      <div className="status-buttons grid grid-cols-3 gap-3 my-4">
        <button 
          className={`status-button rounded-full py-3 ${status === ReadingStatus.READING ? 'bg-primary text-white font-bold shadow-md' : 'bg-gray-100'}`}
          onClick={() => handleStatusChange(ReadingStatus.READING)}
        >
          읽는 중
        </button>
        <button 
          className={`status-button rounded-full py-3 ${status === ReadingStatus.WANT ? 'bg-primary text-white font-bold shadow-md' : 'bg-gray-100'}`}
          onClick={() => handleStatusChange(ReadingStatus.WANT)}
        >
          읽을 예정
        </button>
        <button 
          className={`status-button rounded-full py-3 ${status === ReadingStatus.COMPLETED ? 'bg-primary text-white font-bold shadow-md' : 'bg-gray-100'}`}
          onClick={() => handleStatusChange(ReadingStatus.COMPLETED)}
        >
          완독!
        </button>
      </div>
      
      {/* 상태 라벨 표시 */}
      <div className="mb-4">
        <p className={`font-semibold text-lg text-center ${
          status === ReadingStatus.READING ? 'text-primary' : 
          status === ReadingStatus.WANT ? 'text-primary' : 
          status === ReadingStatus.COMPLETED ? 'text-primary' : ''
        }`}>
          {status === ReadingStatus.READING ? '읽는 중' : 
           status === ReadingStatus.WANT ? '읽을 예정' : 
           status === ReadingStatus.COMPLETED ? '완독!' : ''}
        </p>
      </div>
      
      {/* 완독 상태일 때만 표시될 별점과 날짜 선택 */}
      {status === ReadingStatus.COMPLETED && (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="font-medium">평점</p>
              <p className="text-primary font-bold">{rating.toFixed(1)}</p>
            </div>
            <div className="flex justify-start my-2">
              <StarRating
                rating={rating}
                onChange={setRating}
                size="lg"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">완독일</p>
              <button 
                className="bg-gray-100 px-4 py-1 rounded-md"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {completedDate}
              </button>
            </div>
            
            {showCalendar && renderDatePicker()}
          </div>
        </>
      )}
      
      {/* 책 추가하기 버튼 */}
      <button
        className="w-full bg-primary text-white py-4 rounded-full font-medium text-base mt-4 mb-2"
        onClick={handleAddBook}
        disabled={addBookMutation.isPending}
      >
        {addBookMutation.isPending ? "추가 중..." : "책 추가하기"}
      </button>
    </SimpleBottomSheet>
  );
}