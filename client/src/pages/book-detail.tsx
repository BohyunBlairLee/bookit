import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book, ReadingNote, ReadingStatus, UpdateBookStatus } from "@shared/schema";
import { ChevronLeft, Calendar, Plus, PencilLine, Trash2, ChevronDown, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HalfStarRating } from "@/lib/starRating";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface BookDetailProps {
  id: number;
}

export default function BookDetail({ id }: BookDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [completedDate, setCompletedDate] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [newQuote, setNewQuote] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showNoteTypeModal, setShowNoteTypeModal] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [activeNoteType, setActiveNoteType] = useState<'quote' | 'thought' | 'combined' | null>(null);
  
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
    if (activeNoteType === 'thought' && !newNote.trim()) return;
    if (activeNoteType === 'quote' && !newQuote.trim()) return;
    if (activeNoteType === 'combined' && (!newQuote.trim() || !newNote.trim())) return;
    
    let content = '';
    
    if (activeNoteType === 'quote') {
      content = `"${newQuote.trim()}"`;
    } else if (activeNoteType === 'thought') {
      content = newNote.trim();
    } else if (activeNoteType === 'combined') {
      content = `"${newQuote.trim()}"\n\n${newNote.trim()}`;
    } else {
      // 기본값 - 이전 방식과 호환
      content = newNote.trim();
    }
    
    addNoteMutation.mutate(content);
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
          <Link to="/" className="text-muted-foreground">
            <ChevronLeft size={24} />
          </Link>
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
          <Link to="/" className="text-muted-foreground">
            <ChevronLeft size={24} />
          </Link>
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
        <Link to="/" className="text-muted-foreground">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1"></div>
        <div className="relative">
          <button 
            className="bg-primary text-white rounded-full px-3 py-1 text-sm flex items-center"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            {book.status === ReadingStatus.READING ? '읽는 중' : 
             book.status === ReadingStatus.WANT ? '읽을 예정' : '완독!'} 
            <ChevronDown size={16} className="ml-1" />
          </button>
          
          {showStatusDropdown && (
            <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-lg py-1 z-10">
              <button 
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${book.status === ReadingStatus.READING ? 'font-semibold text-primary' : ''}`}
                onClick={() => {
                  handleStatusChange(ReadingStatus.READING);
                  setShowStatusDropdown(false);
                }}
              >
                읽는 중
              </button>
              <button 
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${book.status === ReadingStatus.WANT ? 'font-semibold text-primary' : ''}`}
                onClick={() => {
                  handleStatusChange(ReadingStatus.WANT);
                  setShowStatusDropdown(false);
                }}
              >
                읽을 예정
              </button>
              <button 
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${book.status === ReadingStatus.COMPLETED ? 'font-semibold text-primary' : ''}`}
                onClick={() => {
                  handleStatusChange(ReadingStatus.COMPLETED);
                  setShowStatusDropdown(false);
                }}
              >
                완독!
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center mt-6">
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="w-36 h-48 object-cover rounded-lg shadow-md"
        />
        <h2 className="text-xl font-bold mt-4">{book.title}</h2>
        <p className="text-muted-foreground mt-1">{book.author}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {book.completedDate ? new Date(book.completedDate).getFullYear() + '년 ' + (new Date(book.completedDate).getMonth() + 1) + '월' : 
            new Date(book.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
        </p>
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
        <div className="flex items-center mb-6">
          <span role="img" aria-label="메모장" className="mr-2">📝</span>
          <h3 className="text-lg font-bold">독서 노트</h3>
        </div>
        
        <button
          className="add-note-button"
          onClick={() => setShowNoteTypeModal(true)}
        >
          <PencilLine size={18} /> 독서 노트 +
        </button>
        
        {/* 노트 타입 선택 모달 */}
        {showNoteTypeModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowNoteTypeModal(false)}></div>
            <div className="note-type-modal">
              <button 
                className="note-type-option" 
                onClick={() => {
                  setActiveNoteType('quote');
                  setShowNoteTypeModal(false);
                  setIsAddingNote(true);
                }}
              >
                책 속 문장 수집하기
              </button>
              <button 
                className="note-type-option" 
                onClick={() => {
                  setActiveNoteType('thought');
                  setShowNoteTypeModal(false);
                  setIsAddingNote(true);
                }}
              >
                생각 메모하기
              </button>
              <button 
                className="note-type-option" 
                onClick={() => {
                  setActiveNoteType('combined');
                  setShowNoteTypeModal(false);
                  setIsAddingNote(true);
                }}
              >
                문장과 메모 함께 기록하기
              </button>
            </div>
          </>
        )}
        
        {/* 노트 입력 화면 */}
        {isAddingNote && activeNoteType && (
          <div className="note-input-screen">
            <div className="note-input-header">
              <button onClick={() => {
                setIsAddingNote(false);
                setActiveNoteType(null);
                setNewNote('');
                setNewQuote('');
              }}>
                <ChevronLeft size={24} />
              </button>
              <h2>
                {activeNoteType === 'quote' ? '책 속 문장 수집하기' : 
                 activeNoteType === 'thought' ? '생각 메모하기' : '문장과 메모 함께 기록하기'}
              </h2>
              <button 
                className="text-primary"
                onClick={() => {
                  if (addNoteMutation.isPending) return;
                  
                  if (activeNoteType === 'quote' && !newQuote.trim()) return;
                  if (activeNoteType === 'thought' && !newNote.trim()) return;
                  if (activeNoteType === 'combined' && (!newQuote.trim() || !newNote.trim())) return;
                  
                  handleAddNote();
                }}
              >
                저장
              </button>
            </div>
            
            <div className="note-input-content">
              {(activeNoteType === 'quote' || activeNoteType === 'combined') && (
                <>
                  {activeNoteType === 'quote' && <h3 className="text-lg font-bold mb-2">책 속 문장</h3>}
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg mb-4">
                    <textarea
                      className="w-full bg-transparent border-none resize-none focus:ring-0 p-0"
                      placeholder="인상깊었던 책 속 문장을 입력하세요..."
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      rows={4}
                      autoFocus={activeNoteType === 'quote'}
                    />
                    <div className="flex justify-end">
                      <button 
                        className="text-purple-600"
                        onClick={() => setShowCameraOptions(true)}
                      >
                        <Camera size={20} />
                      </button>
                      
                      {/* 카메라 옵션 모달 */}
                      {showCameraOptions && (
                        <>
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCameraOptions(false)}></div>
                          <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-1 z-50 w-48">
                            <button 
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                              onClick={() => {
                                toast({ 
                                  title: "카메라 기능", 
                                  description: "사진에서 추출 기능은 현재 개발 중입니다." 
                                });
                                setShowCameraOptions(false);
                              }}
                            >
                              사진에서 추출
                            </button>
                            <button 
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                              onClick={() => {
                                toast({ 
                                  title: "카메라 기능", 
                                  description: "카메라롤에서 추출 기능은 현재 개발 중입니다." 
                                });
                                setShowCameraOptions(false);
                              }}
                            >
                              카메라롤에서 추출
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {(activeNoteType === 'thought' || activeNoteType === 'combined') && (
                <>
                  {activeNoteType === 'thought' && <h3 className="text-lg font-bold mb-2">나의 생각</h3>}
                  {activeNoteType === 'combined' && <h3 className="text-lg font-bold mb-2">나의 생각</h3>}
                  <textarea
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 resize-none min-h-[150px]"
                    placeholder="독서 중 떠오른 생각을 기록해보세요..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={6}
                    autoFocus={activeNoteType === 'thought'}
                  />
                </>
              )}
            </div>
          </div>
        )}
        
        {isLoadingNotes ? (
          <p className="text-center py-4 mt-4">노트를 불러오는 중...</p>
        ) : notes.length === 0 && !isAddingNote ? (
          <div className="rounded-lg p-6 text-center mt-4">
            <p className="text-muted-foreground text-sm">
              아직 독서 노트가 없어요!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              읽으면서 인상깊었던 구절이나 생각을 기록해보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {notes.map((note) => (
              <div key={note.id} className="note-item">
                <div className="flex justify-between mb-2">
                  <div className="w-2 h-full"></div>
                  <p className="note-item-date">
                    {new Date(note.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-gray-800">{note.content}</p>
                <div className="flex justify-end mt-2">
                  <button 
                    className="text-red-400 hover:text-red-600" 
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}