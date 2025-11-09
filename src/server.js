import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.js";
import { likesRouter } from "./routes/likesRoutes.js";
import { followsRouter } from "./routes/followsRoutes.js";
import { sharesRouter } from "./routes/sharesRoutes.js";
import postsRouter from "./routes/postsRoutes.js";
import gdprRouter from "./routes/gdprRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandler.js";


const app = express();
const httpServer = createServer(app);

// --- Socket.IO Setup ---
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "https://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Setup socket handlers
setupSocketHandlers(io);

// --- Middleware (basic) ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true })); // tillåt frontend under dev
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// --- Routes ---
app.use("/api/posts", postsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/follows", followsRouter);
app.use("/api/shares", sharesRouter);
app.use("/api/gdpr", gdprRouter);

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "miniforum-domain",
    time: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 4000;

// --- Starta servern ---
connectDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Domain backend running on port ${PORT}`);
    console.log(`🔌 Socket.IO server ready`);
  });
});
