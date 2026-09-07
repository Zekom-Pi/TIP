import express from "express";

import {
  startSync, getSyncLogs
} from "../controllers/syncController.js";

import {
  protectedRoute,
  requireAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

/*Bắt đầu đồng bộ tất cả source */
router.post(
  "/",
  protectedRoute,
  requireAdmin,
  startSync
);

router.get("/logs" , protectedRoute,requireAdmin, getSyncLogs)

export default router;