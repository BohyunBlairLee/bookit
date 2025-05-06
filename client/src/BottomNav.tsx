import { Home as HomeIcon, Book, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();
  const shouldShowNav = !location.includes("/book/") && 
                        !location.includes("/search/") && 
                        !location.includes("/notes/");

  if (!shouldShowNav) return null;

  return (
    <div className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${location === "/" ? "active" : ""}`}>
        <HomeIcon size={20} />
        <span className="text-xs mt-1">홈</span>
      </Link>
      <Link to="/library" className={`bottom-nav-item ${location === "/library" ? "active" : ""}`}>
        <Book size={20} />
        <span className="text-xs mt-1">나의 책장</span>
      </Link>
      <Link to="/settings" className={`bottom-nav-item ${location === "/settings" ? "active" : ""}`}>
        <Settings size={20} />
        <span className="text-xs mt-1">설정</span>
      </Link>
    </div>
  );
}