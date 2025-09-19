import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"

import { errorHandler } from "@/middleware/errorHandler"
import { notFoundHandler } from "@/middleware/notFoundHandler"
import gameRoutes from "@/routes/gameRoutes"

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
)
app.use(morgan("combined"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/game", gameRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() })
})

// Socket.IO for real-time game communication
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on("join-game", (gameId: string) => {
    socket.join(gameId)
    console.log(`Client ${socket.id} joined game ${gameId}`)
  })

  socket.on("leave-game", (gameId: string) => {
    socket.leave(gameId)
    console.log(`Client ${socket.id} left game ${gameId}`)
  })

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})
