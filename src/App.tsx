import { Route, Routes } from "react-router-dom"

import Game from "./pages/game"
import Welcome from "./pages/welcome"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/game" element={<Game />} />
    </Routes>
  )
}

export default App
