import { Router } from "express"
import { OpeningController } from "@/controllers/opening/opening"
import { PopularOpeningsController } from "@/controllers/opening/popularOpenings"
import { authMiddleware } from "@/middleware/auth-middleware"
import { validateBody, validateParams, validateQuery } from "@/middleware/validation"
import {
  CreateRepertoireRequestSchema,
  DifficultyParamSchema,
  ImportPgnRequestSchema,
  PopularOpeningsQuerySchema,
  PositionsDueQuerySchema,
  PublicRepertoiresQuerySchema,
  RepertoireAndNodeIdParamSchema,
  RepertoireIdParamSchema,
  SearchOpeningsQuerySchema,
  SessionIdParamSchema,
  UpdateRepertoireRequestSchema,
  UserSessionsQuerySchema
} from "@/validation/schemas"

const router = Router()
const openingController = OpeningController.build()
const popularOpeningsController = PopularOpeningsController.build()

router.get(
  "/popular",
  validateQuery(PopularOpeningsQuerySchema),
  popularOpeningsController.getPopularOpenings.bind(popularOpeningsController)
)
router.get("/search", validateQuery(SearchOpeningsQuerySchema), popularOpeningsController.searchOpenings.bind(popularOpeningsController))
router.get(
  "/difficulty/:difficulty",
  validateParams(DifficultyParamSchema),
  popularOpeningsController.getOpeningsByDifficulty.bind(popularOpeningsController)
)

// Repertoire management routes
router.post(
  "/repertoires",
  authMiddleware.authenticate,
  validateBody(CreateRepertoireRequestSchema),
  openingController.createRepertoire.bind(openingController)
)
router.get("/repertoires", authMiddleware.authenticate, openingController.getUserRepertoires.bind(openingController))
router.get(
  "/repertoires/public",
  validateQuery(PublicRepertoiresQuerySchema),
  openingController.getPublicRepertoires.bind(openingController)
)
router.get("/repertoires/:repertoireId", validateParams(RepertoireIdParamSchema), openingController.getRepertoire.bind(openingController))
router.put(
  "/repertoires/:repertoireId",
  authMiddleware.authenticate,
  validateParams(RepertoireIdParamSchema),
  validateBody(UpdateRepertoireRequestSchema),
  openingController.updateRepertoire.bind(openingController)
)
router.delete(
  "/repertoires/:repertoireId",
  authMiddleware.authenticate,
  validateParams(RepertoireIdParamSchema),
  openingController.deleteRepertoire.bind(openingController)
)
router.post(
  "/repertoires/import/pgn",
  authMiddleware.authenticate,
  validateBody(ImportPgnRequestSchema),
  openingController.importFromPgn.bind(openingController)
)

// Training session routes
router.post("/training/sessions", authMiddleware.authenticate, openingController.startTrainingSession.bind(openingController))
router.get(
  "/training/sessions",
  authMiddleware.authenticate,
  validateQuery(UserSessionsQuerySchema),
  openingController.getUserSessions.bind(openingController)
)
router.get(
  "/training/sessions/:sessionId",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.getTrainingSession.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/moves",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.makeMove.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/end",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.endTrainingSession.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/pause",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.pauseTrainingSession.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/resume",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.resumeTrainingSession.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/takeback",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.takeBack.bind(openingController)
)
router.post(
  "/training/sessions/:sessionId/reset",
  authMiddleware.authenticate,
  validateParams(SessionIdParamSchema),
  openingController.resetPosition.bind(openingController)
)

// Progress tracking routes
router.get(
  "/progress/repertoires/:repertoireId/nodes/:nodeId",
  authMiddleware.authenticate,
  validateParams(RepertoireAndNodeIdParamSchema),
  openingController.getProgress.bind(openingController)
)
router.get(
  "/progress/repertoires/:repertoireId",
  authMiddleware.authenticate,
  validateParams(RepertoireIdParamSchema),
  openingController.getRepertoireProgress.bind(openingController)
)
router.get(
  "/progress/review",
  authMiddleware.authenticate,
  validateQuery(PositionsDueQuerySchema),
  openingController.getPositionsDueForReview.bind(openingController)
)
router.get("/progress/stats", authMiddleware.authenticate, openingController.getUserStats.bind(openingController))

export default router
