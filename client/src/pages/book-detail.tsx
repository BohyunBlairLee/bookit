import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book, ReadingNote, ReadingStatus, UpdateBookStatus } from "@shared/schema";
import { ChevronLeft, Calendar, Plus, Star, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HalfStarRating } from "@/lib/starRating";
import { apiRequest } from "@/lib/queryClient";

interface BookDetailProps {
  id: number;
}

export default function BookDetail({ id }: BookDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [completedDate, setCompletedDate] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    }
  });
  
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<ReadingNote[]>({
    queryKey: ["/api/books", id, "notes"],
    queryFn: async () => {
      const res = await fetch(`/api/books/${id}/notes`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async (updateData: UpdateBookStatus) => {
      return apiRequest(`/api/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      toast({ title: "상태가 업데이트되었습니다" });
    },
    onError: () => {
      toast({ 
        title: "오류가 발생했습니다", 
        description: "다시 시도해주세요",
        variant: "destructive" 
      });
    }
  });
  
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/books/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", id, "notes"] });
      setNewNote("");
      setIsAddingNote(false);
      toast({ title: "독서 노트가 추가되었습니다" });
    },
    onError: () => {
      toast({ 
        title: "오류가 발생했습니다", 
        description: "다시 시도해주세요",
        variant: "destructive" 
      });
    }
  });
  
  const removeNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books", id, "notes"] });
      toast({ title: "독서 노트가 삭제되었습니다" });
    },
    onError: () => {
      toast({ 
        title: "오류가 발생했습니다", 
        description: "다시 시도해주세요",
        variant: "destructive" 
      });
    }
  });
  
  useEffect(() => {
    if (book?.completedDate) {
      const date = new Date(book.completedDate);
      setCompletedDate(date.toISOString().split('T')[0]);
    } else {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    }
  }, [book]);
  
  const handleStatusChange = (status: string) => {
    if (!book) return;
    
    const updateData: UpdateBookStatus = {
      id: book.id,
      status: status as ReadingStatus[keyof typeof ReadingStatus]
    };
    
    // 완독 상태로 변경 시 별점과 완독일 추가
    if (status === ReadingStatus.COMPLETED) {
      updateData.completedDate = completedDate;
      updateData.rating = book.rating || 0;
    }
    
    updateStatusMutation.mutate(updateData);
  };
  
  const handleRatingChange = (rating: number) => {
    if (!book) return;
    
    updateStatusMutation.mutate({
      id: book.id,
      status: book.status as ReadingStatus[keyof typeof ReadingStatus],
      rating,
    });
  };
  
  const handleCompletedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompletedDate(e.target.value);
    
    if (!book || book.status !== ReadingStatus.COMPLETED) return;
    
    updateStatusMutation.mutate({
      id: book.id,
      status: ReadingStatus.COMPLETED,
      completedDate: e.target.value,
    });
  };
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNoteMutation.mutate(newNote);
  };
  
  const handleDeleteNote = (noteId: number) => {
    if (confirm("정말로 이 독서 노트를 삭제하시겠습니까?")) {
      removeNoteMutation.mutate(noteId);
    }
  };
  
  if (isLoadingBook) {
    return (
      <div className="page-container">
        <div className="mobile-header">
          <a href="/library" className="text-muted-foreground">
            <ChevronLeft size={24} />
          </a>
          <h1 className="text-lg font-medium">도서 정보</h1>
          <div></div>
        </div>
        <div className="flex justify-center items-center h-[70vh]">
          <p>도서 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!book) {
    return (
      <div className="page-container">
        <div className="mobile-header">
          <a href="/library" className="text-muted-foreground">
            <ChevronLeft size={24} />
          </a>
          <h1 className="text-lg font-medium">오류</h1>
          <div></div>
        </div>
        <div className="flex justify-center items-center h-[70vh]">
          <p>도서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page-container pb-20">
      <div className="mobile-header">
        <a href="/library" className="text-muted-foreground">
          <ChevronLeft size={24} />
        </a>
        <h1 className="text-lg font-medium">도서 정보</h1>
        <div></div>
      </div>
      
      <div className="book-detail-header">
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="book-detail-cover shadow-md"
        />
        <h2 className="text-xl font-bold mt-4">{book.title}</h2>
        <p className="text-muted-foreground mt-1">{book.author}</p>
      </div>
      
      <div className="status-button-group mt-6">
        <button 
          className={`status-button ${book.status === 'reading' ? 'active' : ''}`}
          onClick={() => handleStatusChange(ReadingStatus.READING)}
        >
          읽는 중
        </button>
        <button 
          className={`status-button ${book.status === 'want' ? 'active' : ''}`}
          onClick={() => handleStatusChange(ReadingStatus.WANT)}
        >
          읽을 예정
        </button>
        <button 
          className={`status-button ${book.status === 'completed' ? 'active' : ''}`}
          onClick={() => handleStatusChange(ReadingStatus.COMPLETED)}
        >
          완독!
        </button>
      </div>
      
      {book.status === ReadingStatus.COMPLETED && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-2">평점</p>
            <HalfStarRating
              rating={book.rating || 0}
              max={5}
              onChange={handleRatingChange}
              size="lg"
              showValue
            />
          </div>
          
          <div className="flex items-center justify-between bg-muted rounded-lg p-4">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-muted-foreground" />
              <span className="text-sm">완독일</span>
            </div>
            <input
              type="date"
              value={completedDate}
              onChange={handleCompletedDateChange}
              className="bg-transparent border border-input rounded text-sm px-2 py-1"
            />
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">독서 노트</h3>
          <button
            className="text-primary"
            onClick={() => setIsAddingNote(true)}
          >
            <Plus size={20} />
          </button>
        </div>
        
        {isAddingNote && (
          <div className="bg-muted rounded-lg p-4 mb-4">
            <textarea
              className="textarea-field"
              placeholder="독서 중 떠오른 생각을 기록해보세요..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                className="px-3 py-1 text-sm rounded-md bg-muted-foreground text-white"
                onClick={() => setIsAddingNote(false)}
              >
                취소
              </button>
              <button
                className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNoteMutation.isPending}
              >
                {addNoteMutation.isPending ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        )}
        
        {isLoadingNotes ? (
          <p className="text-center py-4">노트를 불러오는 중...</p>
        ) : notes.length === 0 ? (
          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm">
              아직 독서 노트가 없어요!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              읽으면서 인상깊었던 구절이나 생각을 기록해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-muted rounded-lg p-4">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <button 
                    className="text-muted-foreground" 
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}