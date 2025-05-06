import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MyLibrary from "@/pages/my-library";
import SettingsPage from "@/pages/settings";
import BookDetail from "@/pages/book-detail";
import BottomNav from "./BottomNav";
import { ChevronLeft } from "lucide-react";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/library" component={MyLibrary} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/book/:id">
          {(params) => <BookDetail id={Number(params.id)} />}
        </Route>
        <Route path="/search/details">
          {(params) => {
            // wouter에서는 두번째 매개변수로 location을 제공합니다
            const location = (window as any).location;
            // URL에서 쿼리 파라미터 파싱
            const searchParams = new URLSearchParams(location.search);
            const title = searchParams.get('title') || '';
            const author = searchParams.get('author') || '';
            const coverUrl = searchParams.get('coverUrl') || '';
            const publisher = searchParams.get('publisher') || '';
            const publishedDate = searchParams.get('publishedDate') || '';
            
            return (
              <div className="page-container">
                <div className="mobile-header">
                  <Link to="/" className="text-muted-foreground">
                    <ChevronLeft size={24} />
                  </Link>
                  <h1 className="text-lg font-medium">검색 결과</h1>
                  <div></div>
                </div>
                
                <div className="book-detail">
                  <div className="book-detail-header">
                    <img 
                      src={coverUrl} 
                      alt={title} 
                      className="book-detail-cover"
                    />
                    <h2 className="text-xl font-bold mt-4">{title}</h2>
                    <p className="text-muted-foreground mt-1">{author}</p>
                    {publisher && publishedDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {publisher} | {publishedDate}
                      </p>
                    )}
                  </div>
                  
                  <div className="px-4 pt-4">
                    <h3 className="text-lg font-medium mb-3">독서 상태 선택</h3>
                    <div className="status-button-group">
                      <button 
                        className="status-button"
                        onClick={() => {
                          // 책 추가 API 호출 (읽을 예정)
                          fetch('/api/books', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title,
                              author,
                              coverUrl,
                              publisher,
                              publishedDate,
                              status: 'want'
                            })
                          }).then(res => {
                            if (res.ok) window.location.href = '/library';
                          });
                        }}
                      >
                        읽을 예정
                      </button>
                      <button 
                        className="status-button"
                        onClick={() => {
                          // 책 추가 API 호출 (읽는 중)
                          fetch('/api/books', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title,
                              author,
                              coverUrl,
                              publisher,
                              publishedDate,
                              status: 'reading'
                            })
                          }).then(res => {
                            if (res.ok) window.location.href = '/library';
                          });
                        }}
                      >
                        읽는 중
                      </button>
                      <button 
                        className="status-button"
                        onClick={() => {
                          // 책 추가 API 호출 (완독)
                          fetch('/api/books', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title,
                              author,
                              coverUrl,
                              publisher,
                              publishedDate,
                              status: 'completed',
                              rating: 0,
                              completedAt: new Date().toISOString().split('T')[0]
                            })
                          }).then(res => {
                            if (res.ok) window.location.href = '/library';
                          });
                        }}
                      >
                        완독!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-background">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
