# Architecture Overview

## Overview

This application is a book tracking/reading log web application built with a modern full-stack JavaScript architecture. It allows users to search for books, track their reading progress, and manage their personal library with different reading statuses (want to read, currently reading, completed).

The application follows a client-server architecture with a React frontend and an Express.js backend. It uses PostgreSQL for data persistence via Drizzle ORM and implements a RESTful API for communication between the client and server.

## System Architecture

### High-Level Architecture

The system follows a three-tier architecture:

1. **Frontend (Client)**: A React application built with modern tools like React Query and shadcn/ui components
2. **Backend (Server)**: An Express.js server that handles API requests and business logic
3. **Database**: PostgreSQL database accessed via Drizzle ORM

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   React     │ ───────▶│  Express.js │ ───────▶│ PostgreSQL  │
│   Frontend  │◀─────── │  Backend    │◀─────── │ Database    │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Frontend Architecture

The frontend is a single-page application (SPA) built with React. It uses:

- **Vite** as the build tool and development server
- **React Query** for server state management and data fetching
- **Wouter** for client-side routing
- **shadcn/ui** for UI components (based on Radix UI primitives)
- **Tailwind CSS** for styling

The client-side code is organized into the following structure:
- `client/src/components/`: UI components
- `client/src/pages/`: Page components mapped to routes
- `client/src/hooks/`: Custom React hooks
- `client/src/lib/`: Utility functions and library code

### Backend Architecture

The backend is built with Express.js and provides a RESTful API for the frontend. Key characteristics:

- Pure API server that also serves the static frontend files in production
- Structured routes for book management
- Data persistence with Drizzle ORM
- Mock book search service for development

### Database Architecture

The application uses PostgreSQL with Drizzle ORM for data persistence. Schema is defined in `shared/schema.ts` with the following tables:

1. **users**: Stores user information
2. **books**: Stores book data and reading status information

## Key Components

### Frontend Components

1. **UI Components**: Uses shadcn/ui components for a consistent design language
2. **Page Components**: Main application pages (Home, Not Found)
3. **Book-related Components**:
   - BookCard: Displays book information
   - BookDetailDialog: Shows detailed book information
   - SearchSection: Handles book searching
   - MyLibrary: Shows the user's book collection

### Backend Components

1. **Express Server**: Handles HTTP requests and serves the frontend
2. **Route Handlers**: Processes API requests for book management
3. **Book Service**: Provides book search functionality (currently mock implementation)
4. **Storage Service**: Abstraction for database operations

### Shared Components

1. **Schema definitions**: Database schema shared between frontend and backend
2. **Type definitions**: TypeScript types used across the application

## Data Flow

### Book Search Flow

1. User enters search query in the frontend
2. Frontend sends GET request to `/api/books/search?q=query`
3. Backend processes the request via the book service
4. Backend returns search results to the frontend
5. Frontend displays the results using BookCard components

### Book Management Flow

1. User adds/updates/removes books in their library
2. Frontend sends appropriate HTTP requests (POST/PATCH/DELETE) to the backend
3. Backend processes the requests and updates the database
4. Backend returns updated data to the frontend
5. Frontend updates UI to reflect the changes

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **React Query**: Data fetching and caching
- **Radix UI**: Headless UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Client-side routing

### Backend Dependencies

- **Express**: Web framework
- **Drizzle ORM**: Database ORM
- **Drizzle-zod**: Schema validation
- **Neon Serverless**: PostgreSQL client for serverless environments

## Deployment Strategy

The application is configured for deployment on Replit with the following strategy:

1. **Development**: Uses Vite's development server with HMR for frontend and nodemon for backend
2. **Build Process**:
   - Frontend: Vite builds the static assets
   - Backend: esbuild bundles the server code
3. **Production**:
   - Single Node.js process serves both the API and static assets
   - Database connection via environment variables

### Deployment Configuration

The application includes configuration for Replit deployment:

- `.replit`: Defines the run command and port configuration
- Environment variables for database connection
- Autoscale deployment target

## Authentication and Authorization

The application includes a basic user authentication system, although not fully implemented in the current version:

- User schema in the database
- Password storage capabilities 
- Frontend support for user context

## Future Considerations

1. **Authentication Enhancement**: Implement a more robust authentication system
2. **Real Book API Integration**: Replace mock book service with an actual book API
3. **Reading Statistics**: Add analytics for reading habits and progress
4. **Mobile Optimization**: Further improve the responsive design for mobile devices