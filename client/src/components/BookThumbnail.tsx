import { Book } from "@shared/schema";
import { Link } from "wouter";

interface BookThumbnailProps {
  book: Book;
}

export default function BookThumbnail({ book }: BookThumbnailProps) {
  return (
    <Link to={`/book/${book.id}`}>
      <div className="cursor-pointer">
        <div className="relative pb-[148%] rounded-lg overflow-hidden">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <p className="text-[13px] font-bold mt-1 truncate">{book.title}</p>
        <p className="text-[10px] text-[var(--text-secondary)] truncate">{book.author}</p>
      </div>
    </Link>
  );
}