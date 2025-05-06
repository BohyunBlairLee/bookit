import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { Home as HomeIcon, Book, Settings, ChevronLeft } from "lucide-react";

const BottomNav = () => {
  const [location] = useLocation();
  const shouldShowNav = !location.includes("/books/") && !location.includes("/search");

  if (!shouldShowNav) return null;

  return (
    <div className="bottom-nav">
      <a href="/" className={`bottom-nav-item ${location === "/" ? "active" : ""}`}>
        <HomeIcon size={20} />
        <span className="text-xs mt-1">홈</span>
      </a>
      <a href="/library" className={`bottom-nav-item ${location === "/library" ? "active" : ""}`}>
        <Book size={20} />
        <span className="text-xs mt-1">내 서재</span>
      </a>
      <a href="/settings" className={`bottom-nav-item ${location === "/settings" ? "active" : ""}`}>
        <Settings size={20} />
        <span className="text-xs mt-1">설정</span>
      </a>
    </div>
  );
};

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/library">
          {() => <div className="page-container">
            <div className="mobile-header">
              <h1 className="text-xl font-bold">나의 책장</h1>
            </div>
            <div className="flex items-center justify-center h-[70vh]">
              <p className="text-muted-foreground">아직 준비 중입니다</p>
            </div>
          </div>}
        </Route>
        <Route path="/settings">
          {() => <div className="page-container">
            <div className="mobile-header">
              <h1 className="text-xl font-bold">설정</h1>
            </div>
            <div className="flex items-center justify-center h-[70vh]">
              <p className="text-muted-foreground">아직 준비 중입니다</p>
            </div>
          </div>}
        </Route>
        <Route path="/books/:id">
          {() => <div className="page-container">
            <div className="mobile-header">
              <a href="/" className="text-muted-foreground">
                <ChevronLeft size={24} />
              </a>
              <h1 className="text-lg font-medium">도서 정보</h1>
              <div></div>
            </div>
            <div className="flex items-center justify-center h-[70vh]">
              <p className="text-muted-foreground">아직 준비 중입니다</p>
            </div>
          </div>}
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
