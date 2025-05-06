import { Book } from "@shared/schema";
import { useState } from "react";
import BookDetailDialog from "./BookDetailDialog";

interface BookThumbnailProps {
  book: Book;
}

export default function BookThumbnail({ book }: BookThumbnailProps) {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  return (
    <>
      <div 
        className="relative pb-[140%] cursor-pointer rounded-lg overflow-hidden shadow-md"
        onClick={() => setShowDetailDialog(true)}
      >
        <img 
          src={book.coverUrl}
          alt={book.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      <BookDetailDialog
        book={book}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </>
  );
}