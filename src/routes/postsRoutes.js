import express from "express";
import { authMiddleware, optionalAuth } from "../../middlewares/authMiddleware.js";
import {
    createPost,
    getAllPosts,
    getPostById,
    getUserPosts,
    updatePost,
    deletePost
} from "../controllers/postsController.js";

const router = express.Router();

// All routes require authentication
router.get("/", authMiddleware, getAllPosts);
router.get("/user/:userId", authMiddleware, getUserPosts);
router.get("/:id", authMiddleware, getPostById);
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
