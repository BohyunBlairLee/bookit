# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookIt is a full-stack book tracking application that allows users to search for books (via Kakao Books API), manage a personal library with reading statuses (want/reading/completed), and create reading notes. It supports both web and iOS (via Capacitor).

## Commands

```bash
npm run dev      # Start development server (frontend + backend on port 5000)
npm run build    # Build for production (Vite frontend + esbuild backend)
npm run start    # Run production server
npm run check    # TypeScript type check
npm run db:push  # Push schema changes to database (Drizzle)
```

For iOS:
```bash
npx cap sync ios  # Sync web build to iOS project
```

## Architecture

```
client/           # React SPA (Vite + React Query + Tailwind + shadcn/ui)
├── src/
│   ├── pages/    # Route components (home, my-library, book-detail, settings)
│   ├── components/  # UI components (shadcn/ui in ui/, custom components)
│   ├── lib/      # API client (queryClient.ts uses CapacitorHttp), utilities
│   └── hooks/    # Custom React hooks

server/           # Express.js backend
├── index.ts      # Server entry, middleware setup
├── routes.ts     # API route definitions
├── bookService.ts   # Kakao Books API integration
├── storage.ts    # Data storage (currently MemStorage, has IStorage interface)
├── db.ts         # PostgreSQL/Neon connection (Drizzle ORM)
└── visionService.ts # Google Cloud Vision for OCR

shared/           # Shared between frontend and backend
└── schema.ts     # Drizzle schema + Zod validators (books, users, reading_notes)

ios/              # Capacitor iOS project
```

## Key Technical Decisions

**HTTP Client:** All API calls from the client must use `CapacitorHttp` (from `@capacitor/core`) instead of native `fetch()`. This ensures consistent behavior between web and iOS native app. The native fetch has CORS/network restrictions on iOS.

**API URL Resolution:** `client/src/lib/api.ts` handles platform detection:
- iOS native: Uses production Railway URL
- Web: Uses relative URLs

**Routing:** Uses Wouter (lightweight router). Routes defined in `client/src/App.tsx`.

**State Management:** React Query for server state. No client state library.

**Styling:** Tailwind CSS + shadcn/ui components. Custom styles in `client/src/index.css`.

## Database Schema

Located in `shared/schema.ts`:
- `users`: id, username, password
- `books`: id, title, author, coverUrl, userId, status (want/reading/completed), rating, progress, completedDate
- `reading_notes`: id, bookId, content, createdAt

Note: Currently uses `MemStorage` (in-memory). Real PostgreSQL storage interface exists but not fully wired.

## API Endpoints

```
GET    /api/books              # Get all books
GET    /api/books/:id          # Get specific book
GET/POST /api/books/search     # Search books (Kakao API)
POST   /api/books              # Add book to library
PATCH  /api/books/:id          # Update book status/rating
DELETE /api/books/:id          # Remove book

GET    /api/books/:id/notes    # Get reading notes
POST   /api/books/:id/notes    # Add reading note
DELETE /api/notes/:id          # Delete note

POST   /api/extract-text       # OCR from image (multipart)
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `KAKAO_API_KEY` - For book search
- `GOOGLE_CLOUD_VISION_API_KEY` - For OCR feature

## Notes

- Authentication is currently mocked (`MOCK_USER_ID = 1` in routes.ts)
- Book search uses Kakao Books API (Korean-focused); adds "소설" keyword to English searches
- The app is Korean language (한국어)
