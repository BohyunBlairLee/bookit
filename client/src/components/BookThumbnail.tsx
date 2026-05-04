import { Book } from "@shared/schema";
import { Link } from "wouter";

interface BookThumbnailProps {
  book: Book;
}

export default function BookThumbnail({ book }: BookThumbnailProps) {
  return (
    <Link to={`/book/${book.id}`}>
      <div className="cursor-pointer">
        <div className="relative pb-[140%] rounded-lg overflow-hidden shadow-md">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <p className="text-sm font-medium mt-2 truncate">{book.title}</p>
        <p className="text-xs text-gray-500 truncate">{book.author}</p>
      </div>
    </Link>
  );
}