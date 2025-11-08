import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import { likesRouter } from "./routes/likesRoutes.js"; // <-- import här
import { followsRouter } from "./routes/followsRoutes.js";
import { sharesRouter } from "./routes/sharesRoutes.js";


const app = express();

// --- Middleware (basic) ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // tillåt frontend under dev
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/follows", followsRouter);
app.use("/api/shares", sharesRouter);

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "miniforum-domain",
    time: new Date().toISOString(),
  });
});

// --- Dina routes här ---
app.use("/api/likes", likesRouter); // <-- GLÖM INTE SNEDSTRECKET!

const PORT = process.env.PORT || 4000;

// --- Starta servern ---
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Domain backend running on port ${PORT}`);
  });
});
