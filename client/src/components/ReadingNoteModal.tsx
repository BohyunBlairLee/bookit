import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, BookOpen, Pencil, Type } from "lucide-react";
import { insertReadingNoteSchema } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api";
import { CapacitorHttp } from "@capacitor/core";

interface ReadingNoteModalProps {
  bookId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded?: () => void;
}

export default function ReadingNoteModal({
  bookId,
  open,
  onOpenChange,
  onNoteAdded,
}: ReadingNoteModalProps) {
  const [activeTab, setActiveTab] = useState<string>("quote");
  const [quoteText, setQuoteText] = useState<string>("");
  const [thoughtText, setThoughtText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setQuoteText("");
    setThoughtText("");
    setActiveTab("quote");
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // 파일을 base64로 변환
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // data:image/...;base64, 부분 제거
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await CapacitorHttp.post({
        url: getApiUrl("/api/extract-text"),
        headers: { "Content-Type": "application/json" },
        data: { imageBase64: base64 },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.data?.message || "이미지 업로드 중 오류가 발생했습니다");
      }

      // 추출된 텍스트를 인용구 필드에 설정
      setQuoteText(response.data.processedText);

      toast({
        title: "텍스트 추출 완료",
        description: "이미지에서 텍스트를 추출했습니다.",
      });
    } catch (error) {
      console.error("이미지 처리 오류:", error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error instanceof Error ? error.message : "이미지 처리 중 오류가 발생했습니다",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const saveNote = async () => {
    try {
      setIsSubmitting(true);

      // content 조합: 인용구는 큰따옴표로 감싸고, 생각과 함께일 때 \n\n으로 구분
      const quote = activeTab !== "thought" ? quoteText : "";
      const thought = activeTab !== "quote" ? thoughtText : "";
      let content = "";
      if (quote && thought) {
        content = `"${quote}"\n\n${thought}`;
      } else if (quote) {
        content = `"${quote}"`;
      } else {
        content = thought;
      }

      const note = {
        bookId,
        content,
      };

      const response = await CapacitorHttp.post({
        url: getApiUrl(`/api/books/${bookId}/notes`),
        headers: {
          "Content-Type": "application/json",
        },
        data: note,
      });

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data;
        throw new Error(errorData?.message || "노트 저장 중 오류가 발생했습니다");
      }

      toast({
        title: "노트 저장 완료",
        description: "독서 노트가 저장되었습니다.",
      });

      resetForm();
      onOpenChange(false);
      onNoteAdded?.();
    } catch (error) {
      console.error("노트 저장 오류:", error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: error instanceof Error ? error.message : "노트 저장 중 오류가 발생했습니다",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-[90%] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center">독서 노트 추가하기</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quote" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>책 속 문장</span>
            </TabsTrigger>
            <TabsTrigger value="thought" className="flex items-center gap-1">
              <Pencil className="w-4 h-4" />
              <span>생각 메모</span>
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center gap-1">
              <Type className="w-4 h-4" />
              <span>함께 기록</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="quote" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">책 속 문장</label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    title="사진에서 텍스트 가져오기"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {isUploading ? "처리 중..." : "사진 업로드"}
                  </Button>
                </div>
              </div>
              <Textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="책에서 인상 깊었던 문장을 입력하세요"
                className="min-h-[150px]"
                disabled={isUploading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="thought" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">생각 메모</label>
              <Textarea
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="책을 읽으며 떠오른 생각을 자유롭게 적어보세요"
                className="min-h-[150px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="combined" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">책 속 문장</label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    title="사진에서 텍스트 가져오기"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {isUploading ? "처리 중..." : "사진 업로드"}
                  </Button>
                </div>
              </div>
              <Textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="책에서 인상 깊었던 문장을 입력하세요"
                className="min-h-[100px]"
                disabled={isUploading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">생각 메모</label>
              <Textarea
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="책을 읽으며 떠오른 생각을 자유롭게 적어보세요"
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 숨겨진 파일 업로드 인풋 */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <Button 
            onClick={saveNote} 
            disabled={
              isSubmitting || 
              (activeTab === "quote" && !quoteText) || 
              (activeTab === "thought" && !thoughtText) || 
              (activeTab === "combined" && (!quoteText || !thoughtText))
            }
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}