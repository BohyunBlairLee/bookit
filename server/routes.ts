import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { bookSearchResultSchema, insertBookSchema, updateBookStatusSchema } from "@shared/schema";
import { searchBooks } from "./bookService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID since we're not implementing auth for this demo
  const MOCK_USER_ID = 1;

  // Create default user if not exists
  const existingUser = await storage.getUserByUsername("user");
  if (!existingUser) {
    await storage.createUser({
      username: "user",
      password: "password"
    });
  }

  // Search books
  app.get("/api/books/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const results = searchBooks(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search books", error: String(error) });
    }
  });

  // Get all books for the user
  app.get("/api/books", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      let books;
      
      if (status) {
        books = await storage.getBooksByStatus(MOCK_USER_ID, status);
      } else {
        books = await storage.getAllBooks(MOCK_USER_ID);
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

      const book = await storage.getBook(id);
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
      // Validate request body
      const validatedData = insertBookSchema.parse({
        ...req.body,
        userId: MOCK_USER_ID
      });

      const newBook = await storage.addBook(validatedData);
      res.status(201).json(newBook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
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

      const updatedBook = await storage.updateBookStatus(validatedData);
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

      const success = await storage.removeBook(id);
      if (!success) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove book", error: String(error) });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
