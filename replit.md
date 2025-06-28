# Foods Database Manager

## Overview

This is a full-stack web application for managing a foods database. The application allows users to add, edit, delete, and organize food items with comprehensive nutrition information. It's built with a modern React frontend and Express.js backend, using Firebase Firestore for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: Firebase Firestore (configured but not fully implemented)
- **ORM**: Drizzle ORM configured for PostgreSQL (prepared for future migration)
- **Session Storage**: PostgreSQL sessions using connect-pg-simple
- **Development**: Hot module replacement via Vite integration

### Data Storage Solutions
- **Primary Database**: Firebase Firestore for production data
- **Fallback/Future**: PostgreSQL with Drizzle ORM (infrastructure ready)
- **Session Storage**: PostgreSQL for user sessions
- **Development Storage**: In-memory storage for development/testing

## Key Components

### Data Models
The application uses a comprehensive food schema defined in `shared/schema.ts`:
- **Food Entity**: Includes multilingual names (English, Kurdish, Arabic), nutritional information, categorization, dietary restrictions
- **Multilingual Support**: English name (required), Kurdish name (optional), Arabic name (optional)
- **Food Type System**: Solid/liquid classification with appropriate serving units
- **Dynamic Serving Units**: 9 serving types (ml, l, g, cup, tbsp, tsp, plate, fist, piece) filtered based on food type
- **Categories**: 8 predefined categories (fruits, vegetables, grains, proteins, dairy, beverages, snacks, condiments)
- **Validation**: Zod schemas for type-safe data validation

### UI Components
- **FoodsTable**: Main data grid with sorting, selection, and bulk operations
- **FoodFormModal**: Form for adding/editing food items
- **BulkActionsBar**: Interface for batch operations (delete, export)
- **DeleteConfirmationModal**: Safety confirmation for deletions

### Key Features
- **CRUD Operations**: Full create, read, update, delete functionality
- **Bulk Operations**: Select multiple items for batch operations
- **Search & Filter**: Real-time search and category filtering
- **Sorting**: Column-based sorting with visual indicators
- **Pagination**: Configurable page sizes for large datasets
- **Export**: Data export functionality for selected items

## Data Flow

1. **Data Fetching**: TanStack Query manages server state with automatic caching
2. **Real-time Updates**: Firebase Firestore provides real-time data synchronization
3. **Form Submission**: React Hook Form handles client-side validation before API calls
4. **Error Handling**: Centralized error handling with toast notifications
5. **Optimistic Updates**: UI updates immediately with server sync

## External Dependencies

### Database Services
- **Firebase Firestore**: Primary cloud database service
- **Neon Database**: PostgreSQL provider (configured for future use)

### UI & Styling
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Google Fonts**: Roboto font family

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Vite Plugins**: Runtime error overlay and cartographer for Replit

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with HMR
- **Database**: Firebase Firestore with development project
- **Environment**: NODE_ENV=development with specialized logging

### Production
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Static Assets**: Frontend served from Express static middleware
- **Database**: Firebase Firestore production instance
- **Process Management**: Node.js with Express server

### Infrastructure Considerations
- **Database Migration Path**: Drizzle ORM ready for PostgreSQL migration
- **Session Management**: PostgreSQL sessions for scalability
- **Asset Optimization**: Vite handles bundling and optimization

## Changelog
- June 28, 2025: Initial setup with Firebase Firestore integration
- June 28, 2025: Added multilingual support (English, Kurdish, Arabic names) and smart serving units based on food type (solid/liquid)

## User Preferences

Preferred communication style: Simple, everyday language.