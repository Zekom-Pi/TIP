import express from "express";
import {createSource , getSourceById , updateSource , deleteSource, getSources} from "../controllers/sourceController.js";
import {protectedRoute , requireAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/" , protectedRoute , requireAdmin , createSource);
router.get("/" , protectedRoute, requireAdmin, getSources);
router.get("/:id" , protectedRoute , requireAdmin , getSourceById);
router.put("/:id" , protectedRoute , requireAdmin , updateSource);
router.delete("/:id" , protectedRoute , requireAdmin , deleteSource);

export default router;