import { Route, Routes } from "react-router-dom"

import { AuthProvider, GameProvider } from "./contexts"
import { Auth } from "./pages/auth"
import Game from "./pages/game"
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
        </Routes>
      </GameProvider>
    </AuthProvider>
  )
}

export default App
