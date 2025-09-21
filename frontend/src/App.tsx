import { Route, Routes } from "react-router-dom"

import { GameProvider } from "./contexts"
import Game from "./pages/game"
import Welcome from "./pages/welcome"

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/:gameId" element={<Game />} />
      </Routes>
    </GameProvider>
  )
}

export default App
