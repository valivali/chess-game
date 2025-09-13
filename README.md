# ♟️ Chess Game

> A beautiful, modern chess game built with React, TypeScript, and Vite

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🎯 About

Welcome to an elegant chess experience! This project brings the timeless game of chess to your browser with a clean, modern interface. Whether you're a grandmaster or just learning the ropes, enjoy strategic gameplay with smooth animations and responsive design.

### ✨ Features

- 🎮 **Interactive Gameplay** - Click and play with intuitive piece movement
- 🎨 **Beautiful UI** - Modern design with smooth animations
- 📱 **Responsive Design** - Play on desktop, tablet, or mobile
- ♟️ **Complete Chess Set** - All pieces with proper chess logic
- 🎉 **Celebration Effects** - Victory animations when you win
- 🧪 **Well Tested** - Comprehensive test suite with Jest

## 🚀 Quick Start

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 16 or higher) installed on your machine.

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
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
3. **Strategic Thinking** - Plan your moves carefully to outmaneuver your opponent
4. **Enjoy!** - Have fun and improve your chess skills

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
│   ├── Celebration/    # Victory celebration effects
│   └── ui/             # Generic UI components
├── pages/              # Application pages
│   ├── welcome/        # Welcome/landing page
│   └── game/           # Main game page
├── assets/             # Chess piece SVG components
├── utils/              # Chess game logic and utilities
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
- **🎯 Radix UI** - Accessible UI primitives

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
- [ ] 📊 Move history and game analysis
- [ ] 🌐 Online multiplayer support
- [ ] 🏆 Achievement system
- [ ] 🎵 Sound effects and music
- [ ] 🌙 Dark/light theme toggle

---

<div align="center">

**Enjoy your chess game! ♟️**

_Made with ❤️ and lots of ☕_

</div>
