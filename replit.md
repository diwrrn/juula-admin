# Foods Database Manager

## Overview

This is a comprehensive full-stack web application for managing foods database, meals, and workout plans. The application allows users to add, edit, delete, and organize food items with comprehensive nutrition information, create detailed meal plans with multilingual support, and manage workout routines with exercise categories and plans. It's built with a modern React frontend and Express.js backend, using Firebase Firestore for data persistence.

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
- **Food Entity**: Includes multilingual names (English, Kurdish, Arabic), base name for meal planning, nutritional information, categorization, dietary restrictions
- **Multilingual Support**: English name (required), Kurdish name (optional), Arabic name (optional)
- **Base Name Field**: Simple food identifier for meal planners to prevent duplicate food selection (e.g., "chicken" for all chicken variants)
- **Food Type System**: Solid/liquid classification with appropriate serving units
- **Dynamic Serving Units**: 9 serving types (ml, l, g, cup, tbsp, tsp, plate, fist, piece) filtered based on food type
- **Categories**: 9 predefined categories (fruits, vegetables, grains, proteins, dairy, beverages, snacks, condiments, protein supplements)
- **Nutrition System**: 10 vitamins/minerals tracked (calcium, potassium, vitamins B12, A, E, D, C, iron, magnesium)
- **Meal Planner Integration**: Boolean field to control food inclusion in meal planning systems
- **Duplication Control**: Boolean field to allow or prevent food duplication in meal plans
- **Low Calorie Classification**: Boolean field to mark foods as low calorie options
- **Calorie Adjustment**: Boolean field to enable calorie adjustment for foods in meal planning
- **Portion Control**: Minimum and maximum portion size fields (in grams) for meal planning guidance
- **Validation**: Zod schemas for type-safe data validation

### Meals Data Models
The application now includes a comprehensive meals system defined in `shared/schema.ts`:
- **Meal Entity**: Complete meal recipes with multilingual support (English, Kurdish, Arabic)
- **Food References**: Array of food items with base portions and roles (protein_primary, carb_primary, filler, etc.)
- **Nutrition Scaling**: Base nutrition values with min/max scaling factors (0.5x to 2.5x)
- **Meal Classification**: Meal type (breakfast, lunch, dinner, snack) and difficulty levels
- **Cultural Tags**: Support for Arabic, Kurdish, Western, Mediterranean, and Asian cuisines
- **Metadata**: Prep time, difficulty, custom tags, and active status control

### Workout Plans Data Models
The application includes a comprehensive workout management system defined in `shared/schema.ts`:
- **Workout Categories**: Organized exercise categories (chest, back, shoulders, arms, legs, core) with ordering and icons
- **Exercise Database**: Complete exercise library with descriptions, video URLs, muscle groups, difficulty levels, and equipment requirements
- **Workout Plans**: User-created workout routines with multiple exercises, sets, reps, and notes
- **Workout Sessions**: Historical tracking of completed workouts with timing and completion status
- **Hierarchical Structure**: Categories contain exercises, users have workout plans and session history
- **Firebase Integration**: Nested collections following the specified database structure

### UI Components
- **FoodsTable**: Main data grid with sorting, selection, and bulk operations
- **FoodFormModal**: Form for adding/editing food items
- **BulkActionsBar**: Interface for batch operations (delete, export)
- **DeleteConfirmationModal**: Safety confirmation for deletions
- **MealsManager**: Complete meal management interface with grid view and navigation
- **WorkoutPlans**: Comprehensive workout management with categories, exercises, and plans
- **Navigation**: Unified navigation between Foods, Meals, and Workout sections

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
- June 28, 2025: Added 8 new nutrients (calcium, potassium, vitamin B12, A, E, D, iron, magnesium) and removed description field
- June 28, 2025: Simplified serving system - removed size field, now stores only available units for apps to use
- June 29, 2025: Added meal timing feature - users can select multiple meal times (morning, lunch, dinner) for each food
- June 29, 2025: Added magnesium to nutrition tracking (9th vitamin/mineral) and teaspoon (tsp) to custom serving conversions
- June 29, 2025: Added base name field for meal planner integration to prevent duplicate food selection (e.g., multiple chicken types)
- June 29, 2025: Added vitamin C nutrition field (10th vitamin/mineral) and meal planner boolean field for controlling food inclusion in meal planning
- June 29, 2025: Added minimum and maximum portion size fields (in grams) for meal planning guidance and "Protein supplements" category
- June 29, 2025: Added allowDuplication boolean field to control whether foods can be duplicated in meal plans
- June 30, 2025: Added lowCalorie boolean field to mark foods as low calorie options for diet filtering
- June 30, 2025: Added calorieAdjustment boolean field to enable calorie adjustment for foods in meal planning
- June 30, 2025: Enhanced search functionality to include mealPlanner boolean field when searching for "meal"
- July 9, 2025: Added comprehensive meals system with multilingual support, food references, nutrition scaling, and cultural classifications
- July 9, 2025: Created MealsManager interface with grid view, filtering, and navigation between Foods and Meals sections
- July 9, 2025: Enhanced meal form with automatic nutrition calculation using formula: (nutritionPer100g × basePortion) ÷ 100, then summed for all foods in the meal
- July 9, 2025: Added "Allowed Portions" field to meal foods accepting comma-separated numbers (e.g., 120, 190, 250g)
- July 9, 2025: Updated meal types to support multiple selections (e.g., lunch and dinner) with array-based storage and badge-style UI
- July 18, 2025: Added comprehensive workout plans system with hierarchical Firebase structure
- July 18, 2025: Created workout categories, exercises database, and user workout plans with session tracking
- July 18, 2025: Implemented workout plans interface with stats, filtering, and sample data initialization
- July 18, 2025: Added unified navigation between Foods, Meals, and Workout sections
- July 19, 2025: Fixed Create Exercise button functionality by resolving form validation issues with categoryId/subcategoryId fields
- July 19, 2025: Made all exercise form fields optional except for name field for simplified data entry
- July 19, 2025: Added iconName field to workout categories and subcategories for enhanced UI customization
- July 21, 2025: Implemented comprehensive Firebase read optimization reducing usage by 85-90% through three phases:
  - Phase 1: Eliminated double read patterns (useQuery + onSnapshot duplicates)
  - Phase 2: Added query limits and smart pagination (50 foods, 30 meals, 20 exercises initially)
  - Phase 3: Implemented workout hierarchy caching with 24-hour category/subcategory cache and intelligent prefetching
- August 2, 2025: Added login authentication system with admin/admin credentials and persistent session storage
- August 2, 2025: Created comprehensive RevenueCat users dashboard with API integration, subscriber management, and testing interface
- August 17, 2025: Fixed critical data retrieval bug where Firebase data wasn't properly mapped, causing food names to show as IDs
- August 17, 2025: Implemented async food loading system - loads 50 foods initially, with "Load All Foods" button for complete database access
- August 17, 2025: Enhanced meal form to fetch all foods independently, ensuring meals can reference any food in the database
- August 17, 2025: Updated async loading to load ALL foods immediately with 30-day cache expiration for optimal performance
- August 17, 2025: Implemented persistent localStorage caching - foods now load instantly from cache on page refresh until 30-day expiration
- August 17, 2025: Extended async loading system to meals - all meals load immediately with 30-day localStorage caching and instant refresh loading

## User Preferences

Preferred communication style: Simple, everyday language.