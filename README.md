# Chess Game - Full Stack Application

A modern chess game built with React (frontend) and Node.js/Express (backend), featuring real-time multiplayer capabilities.

## 📁 Project Structure

```
chess-game/
├── frontend/          # React frontend application
│   ├── src/          # React components, hooks, and utilities
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js/Express backend API
│   ├── src/          # Server source code
│   ├── tests/        # Backend tests
│   └── package.json  # Backend dependencies
└── package.json      # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd chess-game
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

### Development

Run both frontend and backend simultaneously:

```bash
npm run dev
```

Or run them separately:

```bash
# Frontend only (runs on http://localhost:5173)
npm run dev:frontend

# Backend only (runs on http://localhost:3001)
npm run dev:backend
```

### Building

Build both applications:

```bash
npm run build
```

Or build separately:

```bash
npm run build:frontend
npm run build:backend
```

### Testing

Run all tests:

```bash
npm test
```

Or test separately:

```bash
npm run test:frontend
npm run test:backend
```

### Linting

Lint all code:

```bash
npm run lint
```

## 🎯 Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: SCSS with CSS custom properties
- **Testing**: Jest + React Testing Library
- **UI Components**: Radix UI primitives

### Key Features

- Interactive chess board with drag & drop
- Real-time game state management
- Celebration animations for wins
- Responsive design

## 🔧 Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

### API Endpoints

- `POST /api/game/create` - Create new game
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/move` - Make a move
- `POST /api/game/:gameId/reset` - Reset game
- `GET /api/game/:gameId/status` - Get game status
- `GET /health` - Health check

## 🧪 Development Scripts

| Command         | Description                   |
| --------------- | ----------------------------- |
| `npm run dev`   | Run both frontend and backend |
| `npm run build` | Build both applications       |
| `npm test`      | Run all tests                 |
| `npm run lint`  | Lint all code                 |
| `npm run clean` | Clean build artifacts         |

## 🏗️ Architecture

This project follows a monorepo structure with separate frontend and backend applications:

- **Frontend**: Handles UI, user interactions, and game visualization
- **Backend**: Manages game logic, state persistence, and real-time communication
- **Communication**: REST API for game operations, WebSocket for real-time updates

## 📝 Contributing

1. Follow the established coding standards in each workspace
2. Write tests for new features
3. Ensure all linting passes before committing
4. Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License.
