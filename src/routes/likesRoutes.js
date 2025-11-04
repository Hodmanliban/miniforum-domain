import express from "express";
import { addLike, removeLike, getLikes } from "../controllers/likesController.js";

export const likesRouter = express.Router();

likesRouter.post("/", addLike);
likesRouter.delete("/", removeLike);
likesRouter.get("/:postId", getLikes);
