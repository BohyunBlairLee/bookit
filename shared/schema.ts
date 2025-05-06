import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from before
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Book schema for the reading log application
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  coverUrl: text("cover_url").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("want"), // 'want', 'reading', 'completed'
  rating: real("rating"), // 0.5-5.0 rating for completed books
  completedDate: timestamp("completed_date"), // Completion date for finished books
  progress: integer("progress").default(0), // Reading progress percentage
  notes: text("notes"), // User notes on the book
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reading Notes schema for book notes
export const readingNotes = pgTable("reading_notes", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export const insertReadingNoteSchema = createInsertSchema(readingNotes).omit({
  id: true,
  createdAt: true,
});

export const bookSearchResultSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  author: z.string(),
  coverUrl: z.string(),
  publishedDate: z.string().optional(),
  publisher: z.string().optional(),
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertReadingNote = z.infer<typeof insertReadingNoteSchema>;
export type Book = typeof books.$inferSelect;
export type ReadingNote = typeof readingNotes.$inferSelect;
export type BookSearchResult = z.infer<typeof bookSearchResultSchema>;

// Reading status options
export const ReadingStatus = {
  WANT: "want", // 읽을 예정
  READING: "reading", // 읽는 중
  COMPLETED: "completed", // 완독!
} as const;

export type ReadingStatusType = typeof ReadingStatus[keyof typeof ReadingStatus];

// Schema for updating book status
export const updateBookStatusSchema = z.object({
  id: z.number(),
  status: z.enum([ReadingStatus.WANT, ReadingStatus.READING, ReadingStatus.COMPLETED]),
  rating: z.number().min(0).max(5).step(0.5).optional(),
  completedDate: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type UpdateBookStatus = z.infer<typeof updateBookStatusSchema>;
