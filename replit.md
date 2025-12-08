# Chappaqua Pulse

## Overview

**Chappaqua Pulse** - A weekly tracker into what's happening in Chappaqua, NY. A community discovery platform featuring two main sections:

1. **Events**: Aggregates and displays weekly events from local organizations including the library, performing arts center, recreation department, schools, and government. Events are scraped from various sources and presented in an information-dense, scannable interface optimized for quick event discovery.

2. **Dining & Specials**: Showcases local Chappaqua restaurants with their weekly specials, holiday menus, happy hours, and brunch offerings. Features 8 real local restaurants with authentic data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with a simple single-page application structure.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components with Tailwind CSS styling. The design follows Material Design principles adapted for local event discovery, with Inter as the primary typeface.

**State Management**: 
- TanStack Query (React Query) for server state management, caching, and data fetching
- Local React state for UI interactions (category filters, week selection)
- Theme state managed via React Context with localStorage persistence

**Styling**: Tailwind CSS with custom design tokens defined in CSS variables, supporting light/dark mode theming. The design system uses a neutral base color with Material-inspired elevated cards and consistent spacing scale.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript, serving both API endpoints and static assets in production.

**Data Storage Strategy**: In-memory storage using a Map-based implementation (`MemStorage` class) for development/prototyping. The codebase is structured to support database migration via the `IStorage` interface abstraction.

**Database Schema** (prepared but not actively used): PostgreSQL schema defined using Drizzle ORM with tables for:
- Events (id, title, description, date, endDate, time, location, category, source, sourceUrl, imageUrl)
- Restaurants (id, name, cuisine, description, address, phone, website, priceRange, hours, imageUrl)
- Specials (id, restaurantId, title, description, type, price, validFrom, validTo, daysAvailable, isActive)
- Users (id, username, password) - authentication structure prepared but not implemented
- Drizzle-kit configured for schema migrations

**Rationale**: The in-memory approach allows rapid development and testing without database overhead. The interface-based design enables seamless transition to PostgreSQL when scaling requirements demand persistent storage.

### Data Acquisition

**Web Scraping**: Cheerio-based HTML parsing to extract event data from multiple sources:
- Chappaqua Library events
- Town of New Castle calendar
- School district calendar
- Recreation department
- Performing arts center

**Data Processing**:
- Intelligent date parsing supporting multiple formats (MMMM d, yyyy; MM/dd/yyyy; etc.)
- Event categorization into six types: community, library, performing-arts, recreation, schools, government
- Timeout-protected fetch operations (10s default) with user-agent spoofing for compatibility
- Initial data load on server startup with in-memory caching

**Update Strategy**: Events are scraped on server initialization. The system tracks `lastUpdated` timestamp displayed in the UI footer.

### API Design

**RESTful Endpoints**:
- `GET /api/events?weekStart=<ISO-date>` - Fetches events for a specific week range
  - Returns: `{ events: Event[], lastUpdated: string }`
  - Filters events between weekStart and weekEnd (Sunday to Saturday)
  - Client-side category filtering applied after fetch

- `GET /api/restaurants` - Fetches all restaurants with their nested specials
  - Returns: `{ restaurants: RestaurantWithSpecials[], lastUpdated: string }`
  - Each restaurant includes its specials array

- `GET /api/specials?type=<special-type>` - Fetches specials with optional type filter
  - Returns: `{ specials: SpecialWithRestaurant[], lastUpdated: string }`
  - Types: weekly, holiday, happy-hour, brunch
  - Each special includes restaurantName field

**Response Format**: JSON with ISO 8601 date strings

### Build and Deployment

**Development**: 
- Vite dev server with HMR for frontend
- tsx with watch mode for backend
- Replit-specific plugins for error overlay and development banners

**Production Build**:
- Vite builds frontend to `dist/public`
- esbuild bundles server code to single `dist/index.cjs` file
- Selected dependencies bundled (allowlist) to reduce syscall overhead and improve cold start performance
- Static file serving via Express with SPA fallback routing

**Module Strategy**: ESM throughout development, CommonJS bundle for production to optimize startup time.

## External Dependencies

### Core Framework Dependencies
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Express** - HTTP server framework
- **Wouter** - Client-side routing

### UI Component Libraries
- **Radix UI** - Headless accessible component primitives (accordion, dialog, dropdown-menu, popover, toast, etc.)
- **shadcn/ui** - Pre-built component implementations
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **date-fns** - Date manipulation and formatting

### Data Management
- **TanStack Query** (@tanstack/react-query) - Server state management and caching
- **Drizzle ORM** - SQL query builder and schema management (prepared for PostgreSQL)
- **drizzle-zod** - Schema validation integration
- **Zod** - Runtime type validation

### Web Scraping
- **Cheerio** - HTML parsing and DOM manipulation
- **Native Fetch API** - HTTP requests with timeout control

### Development Tools
- **tsx** - TypeScript execution for development
- **esbuild** - Production bundling
- **Replit plugins** - Development experience enhancements (@replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer)

### Database (Configured, Not Active)
- **PostgreSQL** - Relational database (via DATABASE_URL environment variable)
- **drizzle-kit** - Schema migration tool
- **pg** - PostgreSQL client driver

### Fonts
- **Inter** (Google Fonts) - Primary UI typeface
- **DM Sans, Architects Daughter, Fira Code, Geist Mono** - Additional typeface options loaded in HTML