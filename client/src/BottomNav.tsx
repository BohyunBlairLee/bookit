import { Home as HomeIcon, Book, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();
  const shouldShowNav = !location.includes("/book/") && 
                        !location.includes("/search/") && 
                        !location.includes("/notes/") &&
                        location !== "/not-found";

  if (!shouldShowNav) return null;

  return (
    <div className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${location === "/" ? "active" : ""}`}>
        <HomeIcon size={20} color={location === "/" ? "#7e22ce" : "#71717a"} />
        <span className={`text-xs mt-1 ${location === "/" ? "text-primary font-medium" : "text-zinc-500"}`}>홈</span>
      </Link>
      <Link to="/library" className={`bottom-nav-item ${location === "/library" ? "active" : ""}`}>
        <Book size={20} color={location === "/library" ? "#7e22ce" : "#71717a"} />
        <span className={`text-xs mt-1 ${location === "/library" ? "text-primary font-medium" : "text-zinc-500"}`}>나의 책장</span>
      </Link>
      <Link to="/settings" className={`bottom-nav-item ${location === "/settings" ? "active" : ""}`}>
        <Settings size={20} color={location === "/settings" ? "#7e22ce" : "#71717a"} />
        <span className={`text-xs mt-1 ${location === "/settings" ? "text-primary font-medium" : "text-zinc-500"}`}>설정</span>
      </Link>
    </div>
  );
}