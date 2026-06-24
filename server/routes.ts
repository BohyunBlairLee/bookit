import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { z } from "zod";
import { bookSearchResultSchema, insertBookSchema, updateBookStatusSchema, insertReadingNoteSchema } from "@shared/schema";
import { searchBooks } from "./bookService";
import multer from 'multer';
import { extractTextFromImage, processExtractedText } from "./visionService";

export async function registerRoutes(app: Express): Promise<Server> {
  // 이미지 업로드를 위한 multer 설정
  const multerStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB 크기 제한
  });

  // Mock user ID since we're not implementing auth for this demo
  const MOCK_USER_ID = 1;

  // Create default user if not exists
  const existingUser = await dbStorage.getUserByUsername("user");
  if (!existingUser) {
    await dbStorage.createUser({
      username: "user",
      password: "password"
    });
  }

  // Search books using Kakao API (GET 방식)
  app.get("/api/books/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      console.log(`📚 GET 검색 요청: "${query}"`);
      const results = await searchBooks(query);
      return res.json(results);
    } catch (error) {
      console.error("Book search error:", error);
      res.status(500).json({ message: "Failed to search books", error: String(error) });
    }
  });
  
  // Search books using Kakao API (POST 방식 - 한글 처리를 위해 추가)
  app.post("/api/books/search", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      console.log(`📚 POST 검색 요청: "${query}"`);
      const results = await searchBooks(query);
      return res.json(results);
    } catch (error) {
      console.error("Book search error:", error);
      res.status(500).json({ message: "Failed to search books", error: String(error) });
    }
  });

  // Get all books for the user
  app.get("/api/books", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      let books;
      
      if (status) {
        books = await dbStorage.getBooksByStatus(MOCK_USER_ID, status);
      } else {
        books = await dbStorage.getAllBooks(MOCK_USER_ID);
      }
      
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to get books", error: String(error) });
    }
  });

  // Get a specific book
  app.get("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const book = await dbStorage.getBook(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ message: "Failed to get book", error: String(error) });
    }
  });

  // Add a book to the user's collection
  app.post("/api/books", async (req: Request, res: Response) => {
    try {
      console.log("Received book data:", JSON.stringify(req.body, null, 2));
      
      // Validate request body
      const validatedData = insertBookSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });
      console.log("Validated book data:", JSON.stringify(validatedData, null, 2));

      const newBook = await dbStorage.addBook(validatedData);
      res.status(201).json(newBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      console.error("Server error:", error);
      res.status(500).json({ message: "Failed to add book", error: String(error) });
    }
  });

  // Update a book's status
  app.patch("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      // Validate request body
      const validatedData = updateBookStatusSchema.parse({
        ...req.body,
        id
      });

      const updatedBook = await dbStorage.updateBookStatus(validatedData);
      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(updatedBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update book", error: String(error) });
    }
  });

  // Remove a book from the user's collection
  app.delete("/api/books/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const success = await dbStorage.removeBook(id);
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove book", error: String(error) });
    }
  });
  
  // Get reading notes for a book
  app.get("/api/books/:id/notes", async (req: Request, res: Response) => {
    try {
      const bookId = Number(req.params.id);
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await dbStorage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      const notes = await dbStorage.getReadingNotes(bookId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get reading notes", error: String(error) });
    }
  });
  
  // Add a reading note to a book
  app.post("/api/books/:id/notes", async (req: Request, res: Response) => {
    try {
      const bookId = Number(req.params.id);
      if (isNaN(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      
      const book = await dbStorage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Validate request body
      const validatedData = insertReadingNoteSchema.parse({
        ...req.body,
        bookId
      });
      
      const newNote = await dbStorage.addReadingNote(validatedData);
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reading note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add reading note", error: String(error) });
    }
  });
  
  // Delete a reading note
  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const success = await dbStorage.removeReadingNote(id);
      if (!success) {
        return res.status(404).json({ message: "Reading note not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove reading note", error: String(error) });
    }
  });

  // 이미지에서 텍스트 추출 API (base64 JSON 또는 multipart 지원)
  app.post("/api/extract-text", upload.single('image'), async (req: Request, res: Response) => {
    try {
      let imageBuffer: Buffer;

      if (req.body?.imageBase64) {
        // base64 JSON 방식 (CapacitorHttp에서 사용)
        imageBuffer = Buffer.from(req.body.imageBase64, 'base64');
        console.log("이미지 base64 수신:", imageBuffer.length, "bytes");
      } else if (req.file) {
        // multipart 방식
        imageBuffer = req.file.buffer;
        console.log("이미지 파일 수신:", req.file.originalname, req.file.size, "bytes");
      } else {
        return res.status(400).json({ message: "이미지 파일이 필요합니다" });
      }

      // 이미지에서 텍스트 추출
      const extractedText = await extractTextFromImage(imageBuffer);

      // 추출된 텍스트 가공
      const processedText = processExtractedText(extractedText);

      res.json({
        originalText: extractedText,
        processedText: processedText
      });
    } catch (error) {
      console.error("텍스트 추출 오류:", error);
      res.status(500).json({ message: "텍스트 추출 중 오류가 발생했습니다", error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
