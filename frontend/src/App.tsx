import { Route, Routes } from "react-router-dom"

import { AuthProvider, GameProvider } from "./contexts"
import { Auth } from "./pages/auth"
import Game from "./pages/game"
import Training from "./pages/training"
import PlayWithCoach from "./pages/training/coach"
import ChessOpenings from "./pages/training/openings"
import TacticsAndTraps from "./pages/training/tactics"
import Welcome from "./pages/welcome"

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/game" element={<Game />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/openings" element={<ChessOpenings />} />
          <Route path="/training/tactics" element={<TacticsAndTraps />} />
          <Route path="/training/coach" element={<PlayWithCoach />} />
        </Routes>
      </GameProvider>
    </AuthProvider>
  )
}

export default App
