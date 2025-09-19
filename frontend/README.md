# ♟️ Chess Game

> A beautiful, modern chess game built with React, TypeScript, and Vite

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🎯 About

Welcome to an elegant chess experience! This project brings the timeless game of chess to your browser with a clean, modern interface. Whether you're a grandmaster or just learning the ropes, enjoy strategic gameplay with smooth animations and responsive design.

### ✨ Features

- 🎮 **Interactive Gameplay** - Click and play with intuitive piece movement
- 🎨 **Beautiful UI** - Modern design with smooth animations and drag & drop support
- 📱 **Responsive Design** - Play on desktop, tablet, or mobile
- ♟️ **Complete Chess Set** - All pieces with proper chess logic including:
  - 🏰 **Castling** - Both kingside and queenside castling
  - 👻 **En Passant** - Special pawn capture rules
  - 👑 **Pawn Promotion** - Automatic queen promotion when pawns reach the end
  - ⚔️ **Check Detection** - Real-time check, checkmate, and stalemate detection
- 📊 **Score Tracking** - Live captured pieces display with material advantage
- 🎉 **Celebration Effects** - Victory animations with confetti and fireworks
- 🧪 **Well Tested** - Comprehensive test suite with Jest and React Testing Library

## 🚀 Quick Start

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed on your machine.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/valivali/chess-game.git
   cd chess-game
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

That's it! 🎉 You're ready to play chess!

## 🎮 How to Play

1. **Start a Game** - Click "Start Game" from the welcome screen
2. **Move Pieces** - Click on a piece to select it, then click on a valid square to move
   - Alternatively, drag and drop pieces to move them
   - Valid moves are highlighted in green when a piece is selected
3. **Special Moves** - The game supports all standard chess rules:
   - **Castling**: Click the king and then the target square (2 squares away)
   - **En Passant**: Automatic when conditions are met
   - **Pawn Promotion**: Pawns automatically promote to queens at the end
4. **Game Status** - Watch for check warnings and game-ending conditions
5. **Captured Pieces** - View captured pieces and material advantage on the sides
6. **Victory** - Enjoy the celebration when you achieve checkmate!
7. **New Game** - Click "New Game" in the celebration screen to play again

## 🛠️ Development

### Available Scripts

| Command                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | 🚀 Start development server with hot reload |
| `npm run build`         | 📦 Build for production                     |
| `npm run preview`       | 👀 Preview production build locally         |
| `npm run lint`          | 🔍 Run ESLint to check code quality         |
| `npm run test`          | 🧪 Run test suite                           |
| `npm run test:watch`    | 👁️ Run tests in watch mode                  |
| `npm run test:coverage` | 📊 Generate test coverage report            |

### 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChessBoard/     # Main chess board component
│   ├── ChessSquare/    # Individual square component
│   ├── Captivity/      # Captured pieces display
│   ├── Celebration/    # Victory celebration effects
│   ├── pieces/         # Chess piece logic classes
│   └── ui/             # Generic UI components (button, card, separator)
├── pages/              # Application pages
│   ├── welcome/        # Welcome/landing page
│   └── game/           # Main game page
├── hooks/              # Custom React hooks
│   ├── useChessGame/   # Main game state management
│   ├── useGameState/   # Core game state
│   ├── useMoveLogic/   # Move validation and execution
│   ├── usePieceInteraction/ # Piece selection and interaction
│   ├── useGameStatus/  # Check/checkmate/stalemate detection
│   ├── useUIState/     # UI state management
│   ├── useConfettiAnimation/ # Confetti effects
│   └── useFireworkAnimation/ # Firework effects
├── assets/             # Chess piece SVG components
├── utils/              # Chess game logic and utilities
│   ├── board/          # Board initialization and utilities
│   ├── game/           # Game status and scoring
│   ├── moves/          # Move validation and chess rules
│   ├── piece/          # Piece utility functions
│   └── position/       # Position calculations
└── types/              # TypeScript type definitions
```

### 🧪 Testing

This project uses Jest and React Testing Library for comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode (great for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🎨 Tech Stack

- **⚛️ React 19** - Modern React with latest features
- **📘 TypeScript** - Type-safe development
- **⚡ Vite** - Lightning-fast build tool
- **🎨 SCSS** - Enhanced CSS with variables and mixins
- **🧭 React Router** - Client-side routing
- **🧪 Jest** - Testing framework
- **🎭 React Testing Library** - Component testing utilities
- **🎯 Radix UI** - Accessible UI primitives (Dialog, Separator, Slot)
- **🔄 ts-pattern** - Functional pattern matching for TypeScript
- **🎨 ESLint + Prettier** - Code formatting and linting

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and add tests if needed
4. **Run the test suite** (`npm test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Future Enhancements

- [ ] 🤖 AI opponent with different difficulty levels
- [ ] 💾 Save and load game states
- [ ] 📊 Move history and notation display
- [ ] 🌐 Online multiplayer support
- [ ] 🏆 Achievement system and statistics
- [ ] 🎵 Sound effects and music
- [ ] 🌙 Dark/light theme toggle
- [ ] ⏰ Chess clock/timer functionality
- [ ] 🔄 Undo/redo moves
- [ ] 📱 Progressive Web App (PWA) support

---

<div align="center">

**Enjoy your chess game! ♟️**

_Made with ❤️ and lots of ☕_

</div>
