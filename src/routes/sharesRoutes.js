import express from "express";
import { addShare, removeShare, getShares, getUserShares } from "../controllers/sharesController.js";

export const sharesRouter = express.Router();

sharesRouter.post("/", addShare);
sharesRouter.delete("/", removeShare);
sharesRouter.get("/user/:userId", getUserShares);
sharesRouter.get("/:postId", getShares);
