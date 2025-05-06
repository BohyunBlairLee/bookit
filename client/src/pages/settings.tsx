import { ChevronLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="page-container">
      <div className="mobile-header">
        <h1 className="text-xl font-bold">설정</h1>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium">앱 정보</h3>
          <p className="text-sm text-muted-foreground mt-1">버전 1.0.0</p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium">테마</h3>
          <div className="mt-2">
            <label className="flex items-center justify-between">
              <span>다크 모드</span>
              <input type="checkbox" className="toggle" />
            </label>
          </div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium">프로필</h3>
          <p className="text-sm text-muted-foreground mt-1">독서 기록 관리</p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium">도움말</h3>
          <p className="text-sm text-muted-foreground mt-1">자주 묻는 질문과 지원</p>
        </div>
      </div>
    </div>
  );
}