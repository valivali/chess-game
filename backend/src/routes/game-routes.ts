import { Router } from "express"
import { GameController } from "@/controllers/game/game"
import { validateBody, validateParams } from "@/middleware/validation"
import { authMiddleware } from "@/middleware/auth-middleware"
import { CreateGameRequestSchema, MakeMoveRequestSchema, GameIdParamSchema } from "@/validation/schemas"

const router = Router()
const gameController = GameController.build()

// Game CRUD operations
router.post(
  "/create",
  authMiddleware.optionalAuth, // Optional authentication - works for both guests and authenticated users
  validateBody(CreateGameRequestSchema),
  gameController.createGame.bind(gameController)
)

router.get("/:gameId", validateParams(GameIdParamSchema), gameController.getGame.bind(gameController))

router.post(
  "/:gameId/move",
  validateParams(GameIdParamSchema),
  validateBody(MakeMoveRequestSchema),
  gameController.makeMove.bind(gameController)
)

router.post("/:gameId/reset", validateParams(GameIdParamSchema), gameController.resetGame.bind(gameController))

router.delete("/:gameId", validateParams(GameIdParamSchema), gameController.deleteGame.bind(gameController))

// Game status and history
router.get("/:gameId/status", validateParams(GameIdParamSchema), gameController.getGameStatus.bind(gameController))

router.get("/:gameId/history", validateParams(GameIdParamSchema), gameController.getMoveHistory.bind(gameController))

export default router
