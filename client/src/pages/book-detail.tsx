import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book, ReadingNote, ReadingStatus, UpdateBookStatus } from "@shared/schema";
import { ChevronLeft, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api";
import { useLocation } from "wouter";
import { CapacitorHttp } from "@capacitor/core";
import ReadingNoteModal from "@/components/ReadingNoteModal";

interface BookDetailProps {
  id: number;
}

export default function BookDetail({ id }: BookDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: ["/api/books", id],
    queryFn: async () => {
      const res = await CapacitorHttp.get({
        url: getApiUrl(`/api/books/${id}`),
      });
      if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch book");
      return res.data;
    }
  });

  const { data: notes = [], isLoading: isLoadingNotes } = useQuery<ReadingNote[]>({
    queryKey: ["/api/books", id, "notes"],
    queryFn: async () => {
      const res = await CapacitorHttp.get({
        url: getApiUrl(`/api/books/${id}/notes`),
      });
      if (res.status < 200 || res.status >= 300) throw new Error("Failed to fetch notes");
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (updateData: UpdateBookStatus) => {
      return apiRequest("PATCH", `/api/books/${id}`, updateData);
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

  const removeNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest("DELETE", `/api/notes/${noteId}`);
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

  const handleStatusChange = (status: string) => {
    if (!book) return;

    const updateData: UpdateBookStatus = {
      id: book.id,
      status: status as "want" | "reading" | "completed"
    };

    if (status === ReadingStatus.COMPLETED) {
      updateData.completedDate = new Date().toISOString();
      updateData.rating = book.rating || 0;
    }

    updateStatusMutation.mutate(updateData);
    setShowStatusDropdown(false);
  };

  const handleDeleteNote = (noteId: number) => {
    if (confirm("정말로 이 독서 노트를 삭제하시겠습니까?")) {
      removeNoteMutation.mutate(noteId);
    }
  };

  const handleGoBack = () => {
    // 히스토리가 있으면 뒤로가기, 없으면 홈으로
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  if (isLoadingBook) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center p-4">
          <button onClick={handleGoBack} className="text-muted-foreground">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex justify-center items-center h-[80vh]">
          <p>도서 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center p-4">
          <button onClick={handleGoBack} className="text-muted-foreground">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex justify-center items-center h-[80vh]">
          <p>도서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    if (book.status === ReadingStatus.READING) return "읽는 중";
    if (book.status === ReadingStatus.WANT) return "읽을 예정";
    return "완독!";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 - 뒤로가기 + 상태 버튼 */}
      <div className="flex items-center justify-between p-4">
        <button onClick={handleGoBack} className="text-muted-foreground">
          <ChevronLeft size={24} />
        </button>

        <div className="relative">
          <button
            className="bg-primary text-white rounded-full px-4 py-1.5 text-sm flex items-center"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            {getStatusText()} <ChevronDown size={16} className="ml-1" />
          </button>

          {showStatusDropdown && (
            <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-lg py-1 z-10">
              <button
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  book.status === ReadingStatus.READING ? "font-semibold text-primary" : ""
                }`}
                onClick={() => handleStatusChange(ReadingStatus.READING)}
              >
                읽는 중
              </button>
              <button
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  book.status === ReadingStatus.WANT ? "font-semibold text-primary" : ""
                }`}
                onClick={() => handleStatusChange(ReadingStatus.WANT)}
              >
                읽을 예정
              </button>
              <button
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  book.status === ReadingStatus.COMPLETED ? "font-semibold text-primary" : ""
                }`}
                onClick={() => handleStatusChange(ReadingStatus.COMPLETED)}
              >
                완독!
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 책 정보 섹션 */}
      <div className="flex flex-col items-center px-4 mt-8">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-40 h-56 object-cover rounded-lg shadow-md"
        />
        <h2 className="text-xl font-bold mt-6 text-center">{book.title}</h2>
        <p className="text-gray-600 mt-2 text-center">{book.author}</p>
        <p className="text-sm text-gray-500 mt-1 text-center">
          {book.publisher} |{" "}
          {book.publishedDate
            ? new Date(book.publishedDate).getFullYear() + "년 " +
              (new Date(book.publishedDate).getMonth() + 1) + "월"
            : "출판일 정보 없음"}
        </p>
      </div>

      {/* 독서 노트 추가 버튼 */}
      <div className="px-4 mt-8">
        <button
          className="w-full flex items-center justify-center bg-primary text-white py-4 rounded-full font-medium text-base"
          onClick={() => setShowNoteModal(true)}
        >
          독서 노트 +
        </button>
      </div>

      {/* 독서 노트 섹션 */}
      <div className="px-4 mt-8">
        <div className="flex items-center mb-4">
          <span role="img" aria-label="메모장" className="mr-2">
            📝
          </span>
          <h3 className="text-lg font-bold">독서 노트</h3>
        </div>

        {isLoadingNotes ? (
          <p className="text-center py-6 text-muted-foreground">노트를 불러오는 중...</p>
        ) : notes.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-muted-foreground text-sm">독서 노트가 비었어요!</p>
            <p className="text-muted-foreground text-sm mt-1">
              수집하고 싶은 문장과 나의 생각을 남겨보세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const isQuote = note.content.trim().startsWith('"') && note.content.includes('"');
              const hasBoth = isQuote && note.content.includes("\n\n");

              let quoteContent = "";
              let thoughtContent = "";

              if (hasBoth) {
                const parts = note.content.split("\n\n");
                quoteContent = parts[0];
                thoughtContent = parts.slice(1).join("\n\n");
              } else if (isQuote) {
                quoteContent = note.content;
              } else {
                thoughtContent = note.content;
              }

              return (
                <div
                  key={note.id}
                  className="bg-white rounded-lg p-4 relative shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between mb-2">
                    <div
                      className={`w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${
                        quoteContent && thoughtContent
                          ? "bg-gradient-to-b from-purple-400 to-blue-400"
                          : quoteContent
                          ? "bg-purple-400"
                          : "bg-blue-400"
                      }`}
                    ></div>
                    <div className="flex items-center">
                      {quoteContent && <div className="w-3 h-3 rounded-full bg-purple-400 mr-1"></div>}
                      {thoughtContent && <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>}
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {new Date(note.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>

                  {quoteContent && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-1 h-4 bg-purple-400 rounded mr-2"></div>
                        <p className="text-xs font-medium text-purple-700">인용구</p>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-300 p-3 rounded-r-md">
                        <p className="whitespace-pre-wrap text-gray-800 italic">{quoteContent}</p>
                      </div>
                    </div>
                  )}

                  {thoughtContent && (
                    <div className={`${quoteContent ? "mt-4" : ""}`}>
                      {quoteContent && (
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 bg-blue-400 rounded mr-2"></div>
                          <p className="text-xs font-medium text-blue-700">나의 생각</p>
                        </div>
                      )}
                      <div
                        className={`${
                          quoteContent ? "bg-blue-50 border-l-4 border-blue-300 p-3 rounded-r-md" : ""
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-gray-800">{thoughtContent}</p>
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

      {/* 독서 노트 모달 */}
      <ReadingNoteModal
        bookId={id}
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        onNoteAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/books", id, "notes"] });
        }}
      />
    </div>
  );
}
