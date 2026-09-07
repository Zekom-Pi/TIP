import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute, requireAdmin } from "./middlewares/authMiddleware.js";
import cors from "cors";
import sourceRoute from "./routes/sourceRoute.js";
import iocRoute from "./routes/iocRoute.js";
import syncRoute from "./routes/syncRoute.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import integrationRoute from "./routes/integrationRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// public routes
app.use("/api/auth",  authRoute);

// private routes
app.use("/api/users", protectedRoute, userRoute);
app.use("/api/sources", protectedRoute, sourceRoute);
app.use("/api/iocs", protectedRoute, iocRoute);
app.use("/api/integration", integrationRoute);
app.use("/api/sync", protectedRoute, syncRoute);
app.use("/api/sync/logs" , protectedRoute , syncRoute);
app.use("/api/dashboard" , protectedRoute , requireAdmin, dashboardRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server starts at ${PORT}`);
  });
});