# Snail Racing Game

## Overview

This is a 3D snail racing game built with React Three Fiber, featuring real-time multiplayer-style gameplay where players control a snail competing against AI opponents. The game includes interactive elements like ooze bombs, particle effects, and environmental details to create an engaging racing experience.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for component-based UI
- **React Three Fiber** for 3D rendering and scene management
- **Drei** for additional Three.js utilities and controls
- **Tailwind CSS** with custom design system for styling
- **shadcn/ui** components for consistent UI elements
- **Zustand** for state management across game components

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** structure with `/api` prefix routing
- **In-memory storage** implementation for development
- **Drizzle ORM** configured for PostgreSQL (ready for database integration)

### Data Storage Solutions
- **PostgreSQL** database (configured via Drizzle)
- **Neon Database** integration for serverless PostgreSQL
- **In-memory storage** fallback for development/testing
- **Session management** with connect-pg-simple

### Authentication and Authorization
- Basic user schema defined with username/password authentication
- Session-based authentication ready for implementation
- User model supports standard CRUD operations

## Key Components

### Game Engine
- **3D Scene Management**: React Three Fiber canvas with camera controls
- **Physics System**: Custom collision detection and movement mechanics
- **Game State Management**: Zustand stores for game logic and audio
- **Particle Systems**: Custom particle effects for ooze and environmental elements

### UI Components
- **Game Interface**: Real-time HUD showing race progress and controls
- **Audio System**: Background music and sound effects with mute toggle
- **Responsive Design**: Mobile-friendly controls and layouts

### Backend Services
- **Storage Interface**: Abstract storage layer supporting both memory and database
- **Route Registration**: Modular route system for API endpoints
- **Development Server**: Vite integration for hot reloading

## Data Flow

1. **Game Initialization**: Zustand stores initialize game state and 3D scene
2. **Input Processing**: Keyboard controls are captured and processed via Drei
3. **Game Loop**: React Three Fiber's useFrame hook drives the main game loop
4. **State Updates**: Game state changes trigger re-renders and audio effects
5. **API Communication**: TanStack Query handles server communication for future features

## External Dependencies

### Core Libraries
- **@react-three/fiber**: 3D rendering engine
- **@react-three/drei**: Three.js utilities and helpers
- **@radix-ui**: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **zustand**: Client-side state management

### Database & ORM
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-kit**: Database migration and schema management

### Build Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for rapid development
- **Express Middleware**: API and static file serving
- **TypeScript Compilation**: Real-time type checking

### Production Build
- **Client**: Vite builds optimized React app to `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Support for 3D models, audio files, and textures

### Database Setup
- **Environment Variables**: `DATABASE_URL` for PostgreSQL connection
- **Migrations**: Drizzle Kit handles schema migrations
- **Connection Pooling**: Neon serverless for scalable database access

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```