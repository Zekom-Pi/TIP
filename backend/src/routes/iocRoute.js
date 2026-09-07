import express from "express";

import {createIOC, getIOCs, getIOCById , updateIOC , deleteIOC} from "../controllers/iocController.js";
import { protectedRoute, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protectedRoute ,requireAdmin, createIOC);
router.get("/" , protectedRoute, requireAdmin , getIOCs);
router.get("/:id" , protectedRoute , requireAdmin , getIOCById);
router.put("/:id" , protectedRoute , requireAdmin , updateIOC);
router.delete("/:id" , protectedRoute , requireAdmin , deleteIOC);

export default router;

