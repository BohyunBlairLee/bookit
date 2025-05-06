import { books, readingNotes, users, type User, type InsertUser, type Book, type InsertBook, type UpdateBookStatus, type ReadingNote, type InsertReadingNote } from "@shared/schema";

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book methods
  getAllBooks(userId: number): Promise<Book[]>;
  getBooksByStatus(userId: number, status: string): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  addBook(book: InsertBook): Promise<Book>;
  updateBookStatus(update: UpdateBookStatus): Promise<Book | undefined>;
  removeBook(id: number): Promise<boolean>;
  
  // Reading Notes methods
  getReadingNotes(bookId: number): Promise<ReadingNote[]>;
  addReadingNote(note: InsertReadingNote): Promise<ReadingNote>;
  removeReadingNote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private notes: Map<number, ReadingNote>;
  private userIdCounter: number;
  private bookIdCounter: number;
  private noteIdCounter: number;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.notes = new Map();
    this.userIdCounter = 1;
    this.bookIdCounter = 1;
    this.noteIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Book methods
  async getAllBooks(userId: number): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBooksByStatus(userId: number, status: string): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter(book => book.userId === userId && book.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async addBook(insertBook: InsertBook): Promise<Book> {
    const id = this.bookIdCounter++;
    const now = new Date();
    
    console.log("😊 insertBook 데이터 확인:", JSON.stringify(insertBook, null, 2));
    
    // publishedDate 관련 버그 해결 - string, Date, null 모두 처리 
    let publishedDate = null;
    if (insertBook.publishedDate) {
      try {
        publishedDate = insertBook.publishedDate instanceof Date 
          ? insertBook.publishedDate 
          : new Date(insertBook.publishedDate as any);
      } catch (e) {
        console.error("📅 출판일 변환 실패:", e);
      }
    }
    
    const book: Book = { 
      id,
      title: insertBook.title,
      author: insertBook.author,
      coverUrl: insertBook.coverUrl,
      userId: insertBook.userId,
      status: insertBook.status || "want",
      rating: insertBook.rating || null,
      completedDate: insertBook.completedDate || null,
      progress: insertBook.progress || null,
      notes: insertBook.notes || null,
      publishedDate: publishedDate,
      publisher: insertBook.publisher || null,
      createdAt: now
    };
    
    console.log("📚 최종 책 데이터:", JSON.stringify(book, null, 2));
    this.books.set(id, book);
    return book;
  }

  async updateBookStatus(update: UpdateBookStatus): Promise<Book | undefined> {
    const book = this.books.get(update.id);
    if (!book) return undefined;

    const updatedBook: Book = {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      userId: book.userId,
      status: update.status,
      rating: update.rating !== undefined ? update.rating : book.rating,
      completedDate: update.completedDate !== undefined ? new Date(update.completedDate) : book.completedDate,
      progress: update.progress !== undefined ? update.progress : book.progress,
      notes: update.notes !== undefined ? update.notes : book.notes,
      publishedDate: book.publishedDate, // 기존 publishedDate 유지
      publisher: book.publisher, // 기존 publisher 유지
      createdAt: book.createdAt
    };

    this.books.set(book.id, updatedBook);
    return updatedBook;
  }

  async removeBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }
  
  // Reading Notes methods
  async getReadingNotes(bookId: number): Promise<ReadingNote[]> {
    return Array.from(this.notes.values())
      .filter(note => note.bookId === bookId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async addReadingNote(insertNote: InsertReadingNote): Promise<ReadingNote> {
    const id = this.noteIdCounter++;
    const now = new Date();
    const note: ReadingNote = {
      ...insertNote,
      id,
      createdAt: now
    };
    this.notes.set(id, note);
    return note;
  }
  
  async removeReadingNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
}

export const storage = new MemStorage();
