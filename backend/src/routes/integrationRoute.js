import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { testShuffleIntegration } from "../controllers/integrationController.js";

const router = express.Router();

router.post("/shuffle/test", protectedRoute, testShuffleIntegration);

export default router;