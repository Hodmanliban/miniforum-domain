import express from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
    exportUserData,
    deleteUserData,
    anonymizeUserContent
} from "../controllers/gdprController.js";

const router = express.Router();

// User-initiated export (requires auth cookie)
router.get("/export", authMiddleware, exportUserData);

// Backend-to-backend (requires JWT in Authorization header)
router.delete("/users/:userId/data", deleteUserData);
router.post("/users/:userId/anonymize", anonymizeUserContent);

export default router;
