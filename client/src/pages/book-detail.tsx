import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book, ReadingNote, ReadingStatus, ReadingStatusType, UpdateBookStatus } from "@shared/schema";
import { BookOpen, ChevronLeft, Calendar, Plus, PencilLine, PenTool, Quote, Trash2, ChevronDown, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HalfStarRating } from "@/lib/starRating";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api";
import { Link } from "wouter";

interface BookDetailProps {
  id: number;
}

// 이미지 편집기 컴포넌트 가져오기
import ImageEditor from "@/components/ImageEditor";

export default function BookDetail({ id }: BookDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [completedDate, setCompletedDate] = useState<string>("");
  const [newNote, setNewNote] = useState<string>("");
  const [newQuote, setNewQuote] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showNoteTypeModal, setShowNoteTypeModal] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [activeNoteType, setActiveNoteType] = useState<'quote' | 'thought' | 'combined' | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // 이미지 편집기 관련 상태
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  
  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/books/${id}`));
      if (!res.ok) throw new Error("Failed to fetch book");
      return res.json();
    }
  });
  
  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<ReadingNote[]>({
    queryKey: ["/api/books", id, "notes"],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/books/${id}/notes`));
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async (updateData: UpdateBookStatus) => {
      return apiRequest(
        'PATCH',
        `/api/books/${id}`,
        updateData
      );
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
      return apiRequest(
        'POST',
        `/api/books/${id}/notes`,
        { content }
      );
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
      return apiRequest(
        'DELETE',
        `/api/notes/${noteId}`
      );
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
      status: status as "want" | "reading" | "completed"
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
      status: book.status as "want" | "reading" | "completed",
      rating,
    });
  };
  
  const handleCompletedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompletedDate(e.target.value);
    
    if (!book || book.status !== ReadingStatus.COMPLETED) return;
    
    updateStatusMutation.mutate({
      id: book.id,
      status: ReadingStatus.COMPLETED,
      completedDate: new Date(e.target.value).toISOString(),
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
  
  // 이미지 파일에서 텍스트 추출 함수
  const extractTextFromImage = async (file: File) => {
    try {
      setIsProcessingImage(true);
      
      // FormData 객체 생성 및 이미지 파일 추가
      const formData = new FormData();
      formData.append("image", file);
      
      // 서버에 이미지 전송하여 텍스트 추출
      const response = await fetch(getApiUrl("/api/extract-text"), {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "이미지 처리 중 오류가 발생했습니다");
      }
      
      const data = await response.json();
      
      // 추출된 텍스트를 인용구 필드에 설정
      setNewQuote(data.processedText);
      
      toast({ 
        title: "텍스트 추출 완료", 
        description: "이미지에서 텍스트를 성공적으로 추출했습니다." 
      });
    } catch (error) {
      console.error("이미지 처리 오류:", error);
      toast({ 
        variant: "destructive", 
        title: "텍스트 추출 실패", 
        description: error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다" 
      });
    } finally {
      setIsProcessingImage(false);
      setShowCameraOptions(false);
    }
  };
  
  // 파일 선택 핸들러
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // 파일 입력 변경 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 선택한 이미지 설정 및 편집기 표시
      setSelectedImage(file);
      setShowImageEditor(true);
      setShowCameraOptions(false);
    }
  };
  
  // 이미지 편집기 취소 핸들러
  const handleCancelImageEdit = () => {
    setSelectedImage(null);
    setShowImageEditor(false);
  };
  
  // 이미지 편집기 확인 핸들러
  const handleConfirmImageEdit = (editedFile: File) => {
    // 편집된 이미지로 텍스트 추출
    extractTextFromImage(editedFile);
    setSelectedImage(null);
    setShowImageEditor(false);
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
      {/* 헤더 - 뒤로가기 + 상태 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-muted-foreground">
          <ChevronLeft size={24} />
        </Link>
        
        <div className="relative">
          <button 
            className="bg-primary text-white rounded-full px-4 py-1.5 text-sm flex items-center"
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
      
      {/* 책 표지 및 상세 정보 */}
      <div className="flex flex-col items-center">
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="w-32 h-48 object-cover rounded-lg shadow-md"
        />
        <h2 className="text-xl font-bold mt-5 text-center">{book.title}</h2>
        <p className="text-gray-600 mt-2 text-center">{book.author}</p>
        <p className="text-sm text-gray-500 mt-1 mb-3 text-center">
          {book.publisher} | {book.publishedDate 
            ? new Date(book.publishedDate).getFullYear() + '년 ' + (new Date(book.publishedDate).getMonth() + 1) + '월' 
            : '출판일 정보 없음'}
        </p>
      </div>
      
      {book.status === ReadingStatus.COMPLETED && (
        <div className="mt-6 space-y-5 bg-gray-50 rounded-xl p-5">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium mb-2 text-gray-600">평점</p>
            <HalfStarRating
              rating={book.rating || 0}
              max={5}
              onChange={handleRatingChange}
              size="lg"
              showValue
            />
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2 text-gray-500" />
              <span className="text-sm text-gray-600">완독일</span>
            </div>
            <input
              type="date"
              value={completedDate}
              onChange={handleCompletedDateChange}
              className="bg-white border border-gray-200 rounded text-sm px-2 py-1 text-gray-700"
            />
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span role="img" aria-label="메모장" className="mr-2">📝</span>
            <h3 className="text-lg font-bold">독서 노트</h3>
          </div>
        </div>
        
        <button
          className="w-full flex items-center justify-center bg-primary text-white py-3 rounded-full font-medium text-sm mb-6"
          onClick={() => setShowNoteTypeModal(true)}
        >
          <PencilLine size={16} className="mr-1.5" /> 독서 노트 +
        </button>
        
        {/* 노트 타입 선택 모달 */}
        {showNoteTypeModal && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowNoteTypeModal(false)}></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 z-50 shadow-lg transition-transform duration-300 transform translate-y-0 pb-8">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-5"></div>
              <h3 className="text-lg font-bold mb-5 text-center">기록 유형 선택</h3>
              
              <div className="space-y-3">
                <button 
                  className="flex items-center w-full p-4 rounded-lg bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors" 
                  onClick={() => {
                    setActiveNoteType('quote');
                    setShowNoteTypeModal(false);
                    setIsAddingNote(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Quote size={20} className="text-purple-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">책 속 문장 수집하기</h4>
                    <p className="text-xs text-gray-500 mt-1">인상깊은 책 속 구절을 저장합니다</p>
                  </div>
                </button>
                
                <button 
                  className="flex items-center w-full p-4 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors" 
                  onClick={() => {
                    setActiveNoteType('thought');
                    setShowNoteTypeModal(false);
                    setIsAddingNote(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <PenTool size={20} className="text-blue-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">생각 메모하기</h4>
                    <p className="text-xs text-gray-500 mt-1">책을 읽으며 떠오른 생각을 기록합니다</p>
                  </div>
                </button>
                
                <button 
                  className="flex items-center w-full p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 hover:from-purple-100 hover:to-blue-100 transition-colors" 
                  onClick={() => {
                    setActiveNoteType('combined');
                    setShowNoteTypeModal(false);
                    setIsAddingNote(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mr-3">
                    <BookOpen size={20} className="text-purple-700" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">문장과 메모 함께 기록하기</h4>
                    <p className="text-xs text-gray-500 mt-1">인용구와 생각을 함께 저장합니다</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
        
        {/* 노트 입력 화면 */}
        {isAddingNote && activeNoteType && (
          <div className="note-input-screen">
            <div className="flex items-center justify-between py-3 px-2 border-b border-gray-200 mb-4">
              <button 
                className="rounded-full p-2 hover:bg-gray-100"
                onClick={() => {
                  setIsAddingNote(false);
                  setActiveNoteType(null);
                  setNewNote('');
                  setNewQuote('');
                }}
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-base font-bold text-center">
                {activeNoteType === 'quote' 
                  ? <div className="flex items-center"><Quote size={16} className="text-purple-500 mr-1.5" /> 책 속 문장 수집하기</div> 
                  : activeNoteType === 'thought' 
                    ? <div className="flex items-center"><PenTool size={16} className="text-blue-500 mr-1.5" /> 생각 메모하기</div> 
                    : <div className="flex items-center"><BookOpen size={16} className="text-purple-700 mr-1.5" /> 문장과 메모 함께 기록하기</div>}
              </h2>
              <button 
                className={`rounded-full px-3 py-1 ${
                  (activeNoteType === 'quote' && newQuote.trim()) || 
                  (activeNoteType === 'thought' && newNote.trim()) || 
                  (activeNoteType === 'combined' && newQuote.trim() && newNote.trim())
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
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
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-5 bg-purple-500 rounded mr-2"></div>
                    <h3 className="text-base font-bold">책 속 문장</h3>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-md overflow-hidden">
                    <textarea
                      className="w-full bg-transparent border-none resize-none focus:ring-0 p-4"
                      placeholder="인상깊었던 책 속 문장을 입력하세요..."
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      rows={4}
                      autoFocus={activeNoteType === 'quote'}
                      style={{fontSize: '15px'}}
                    />
                    <div className="flex justify-between items-center px-4 py-2 border-t border-purple-100">
                      <p className="text-xs text-purple-500 italic">따옴표(")는 자동으로 추가됩니다</p>
                      <button 
                        className="text-purple-600 p-2 rounded-full hover:bg-purple-100"
                        onClick={() => setShowCameraOptions(true)}
                      >
                        <Camera size={18} />
                      </button>
                      
                      {/* 카메라 옵션 모달 */}
                      {showCameraOptions && (
                        <>
                          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowCameraOptions(false)}></div>
                          <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-1 z-50 w-56">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <h3 className="font-medium text-sm">텍스트 추출</h3>
                            </div>
                            <button 
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => {
                                toast({ 
                                  title: "카메라 기능", 
                                  description: "직접 촬영 기능은 현재 개발 중입니다." 
                                });
                                setShowCameraOptions(false);
                              }}
                            >
                              <Camera size={16} className="mr-2 text-gray-500" />
                              <span>사진 촬영하기</span>
                            </button>
                            <button 
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => {
                                handleFileSelect();
                                setShowCameraOptions(false);
                              }}
                            >
                              <BookOpen size={16} className="mr-2 text-gray-500" />
                              <span>카메라롤에서 가져오기</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {(activeNoteType === 'thought' || activeNoteType === 'combined') && (
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-5 bg-blue-500 rounded mr-2"></div>
                    <h3 className="text-base font-bold">나의 생각</h3>
                  </div>
                  <textarea
                    className="w-full bg-blue-50 border border-blue-100 rounded-lg p-4 resize-none min-h-[150px]"
                    placeholder="독서 중 떠오른 생각을 기록해보세요..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={6}
                    autoFocus={activeNoteType === 'thought'}
                    style={{fontSize: '15px'}}
                  />
                </div>
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
            <div className="flex items-center mb-3">
              <span role="img" aria-label="메모장" className="mr-2">📔</span>
              <p className="text-sm font-medium">독서 노트</p>
            </div>
            {notes.map((note) => {
              // 인용구 패턴을 확인 - 쌍따옴표로 시작하는지 검사
              const isQuote = note.content.trim().startsWith('"') && note.content.includes('"');
              
              // 인용구와 생각이 함께 있는 패턴 검사 (쌍따옴표로 시작하고 줄바꿈이 두 번 이상 있는 경우)
              const hasBoth = isQuote && note.content.includes('\n\n');
              
              // 내용 분리
              let quoteContent = '';
              let thoughtContent = '';
              
              if (hasBoth) {
                // 인용구와 생각이 함께 있는 경우
                const parts = note.content.split('\n\n');
                quoteContent = parts[0]; // 첫 부분은 인용구
                thoughtContent = parts.slice(1).join('\n\n'); // 나머지는 생각
              } else if (isQuote) {
                // 인용구만 있는 경우
                quoteContent = note.content;
              } else {
                // 생각만 있는 경우
                thoughtContent = note.content;
              }
              
              return (
                <div key={note.id} className="bg-white rounded-lg p-4 mb-5 relative shadow-sm border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <div className={`w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${quoteContent && thoughtContent ? 'bg-gradient-to-b from-purple-400 to-blue-400' : quoteContent ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                    <div className="flex items-center">
                      {quoteContent && <div className="w-3 h-3 rounded-full bg-purple-400 mr-1"></div>}
                      {thoughtContent && <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>}
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {new Date(note.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  
                  {/* 인용구 부분 */}
                  {quoteContent && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-4 bg-purple-400 rounded mr-2"></div>
                        <p className="text-xs font-medium text-purple-700">인용구</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-300 p-3 rounded-r-md">
                        <p className="whitespace-pre-wrap text-gray-800 italic">
                          {quoteContent}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* 생각 부분 */}
                  {thoughtContent && (
                    <div className={`${quoteContent ? 'mt-4' : ''}`}>
                      {quoteContent && (
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 bg-blue-400 rounded mr-2"></div>
                          <p className="text-xs font-medium text-blue-700">나의 생각</p>
                        </div>
                      )}
                      <div className={`${quoteContent ? 'bg-blue-50 border-l-4 border-blue-300 p-3 rounded-r-md' : ''}`}>
                        <p className="whitespace-pre-wrap text-gray-800">
                          {thoughtContent}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-3">
                    <button 
                      className="text-gray-400 hover:text-red-500 p-1" 
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 숨겨진 파일 입력 요소 */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* 이미지 편집기 */}
      {showImageEditor && selectedImage && (
        <ImageEditor 
          imageFile={selectedImage} 
          onCancel={handleCancelImageEdit} 
          onConfirm={handleConfirmImageEdit} 
        />
      )}
    </div>
  );
}