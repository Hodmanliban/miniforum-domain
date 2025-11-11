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
import followsRouter from "./routes/followsRoutes.js";
import { sharesRouter } from "./routes/sharesRoutes.js";
import postsRouter from "./routes/postsRoutes.js";
import gdprRouter from "./routes/gdprRoutes.js";
import { setupSocketHandlers } from "./socket/socketHandler.js";
import searchRouter from "./routes/searchRoutes.js";

const app = express();
const httpServer = createServer(app);

// --- Tillåtna frontend-domäner ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://miniforum123.netlify.app",
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// --- Socket.IO Setup med strikt CORS ---
export const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked by Socket.IO CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Setup socket handlers
setupSocketHandlers(io);

// --- Middleware ---
app.use(helmet());

// 🧩 Säker CORS-konfiguration för Express API
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked by Express CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// --- Routes ---
app.use("/api/posts", postsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/follow", followsRouter);
app.use("/api/shares", sharesRouter);
app.use("/api/gdpr", gdprRouter);
app.use("/api/search", searchRouter);

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
    console.log(`🌍 Allowed origins: ${allowedOrigins.join(", ")}`);
    console.log(`🔌 Socket.IO server ready`);
  });
});
