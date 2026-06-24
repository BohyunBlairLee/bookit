import { Book } from "@shared/schema";
import { Link } from "wouter";

interface BookThumbnailProps {
  book: Book;
}

export default function BookThumbnail({ book }: BookThumbnailProps) {
  return (
    <Link to={`/book/${book.id}`}>
      <div className="cursor-pointer min-w-0">
        <div className="w-[82px] h-[121px] rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="w-[82px] text-[13px] font-bold mt-[5px] truncate">{book.title}</p>
        <p className="w-[82px] text-[10px] text-[var(--text-secondary)] truncate">{book.author}</p>
      </div>
    </Link>
  );
}