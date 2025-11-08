import express from "express";
import { addShare, getShares } from "../controllers/sharesController.js";

export const sharesRouter = express.Router();

sharesRouter.post("/", addShare);
sharesRouter.get("/:postId", getShares);
