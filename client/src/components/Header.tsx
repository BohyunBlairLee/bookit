import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="text-secondary mr-2 h-6 w-6" />
          <h1 className="text-xl font-bold text-primary">책 기록</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="text-primary hover:text-secondary transition-all font-medium">
                  내 서재
                </a>
              </Link>
            </li>
            <li>
              <Link href="/">
                <a className="text-primary hover:text-secondary transition-all">
                  검색
                </a>
              </Link>
            </li>
            <li>
              <Link href="/">
                <a className="text-primary hover:text-secondary transition-all">
                  통계
                </a>
              </Link>
            </li>
            <li>
              <div className="w-8 h-8 bg-secondary rounded-full text-white flex items-center justify-center">
                <span className="text-sm">KO</span>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
