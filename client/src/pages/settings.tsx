import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Info, Moon, Sun, Trash } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: !isDarkMode ? "다크 모드가 활성화되었습니다" : "라이트 모드가 활성화되었습니다",
      description: "변경된 설정이 적용되었습니다.",
    });
  };
  
  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    toast({
      title: !isNotificationsEnabled ? "알림이 활성화되었습니다" : "알림이 비활성화되었습니다",
      description: "변경된 설정이 적용되었습니다.",
    });
  };
  
  const clearData = () => {
    // 사용자에게 데이터 삭제 확인
    if (window.confirm("정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      // 여기서 모든 책과 기록을 삭제하는 API 호출을 할 수 있음
      // 현재는 토스트 메시지만 표시
      toast({
        title: "모든 데이터가 삭제되었습니다",
        description: "앱 데이터가 초기화되었습니다.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-xl font-bold">설정</h1>
      </div>
      
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">앱 테마</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              <span>{isDarkMode ? "다크 모드" : "라이트 모드"}</span>
            </div>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode} 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium">알림</h2>
          <div className="flex items-center justify-between">
            <span>알림 활성화</span>
            <Switch 
              checked={isNotificationsEnabled} 
              onCheckedChange={toggleNotifications} 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium">앱 정보</h2>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Info size={18} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">버전: 1.0.0</span>
            </div>
            <p className="text-sm text-muted-foreground">
              이 앱은 독서 활동을 기록하고 관리하기 위한 개인용 앱입니다.
            </p>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h2 className="text-lg font-medium">데이터 관리</h2>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={clearData}
          >
            <Trash size={16} className="mr-2" />
            모든 데이터 삭제
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            주의: 이 작업은 모든 독서 기록과 메모를 영구적으로 삭제합니다.
          </p>
        </div>
      </div>
    </div>
  );
}