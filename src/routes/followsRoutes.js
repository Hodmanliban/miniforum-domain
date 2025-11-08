import express from "express";
import { addFollow, removeFollow, getFollowers } from "../controllers/followsController.js";

export const followsRouter = express.Router();

followsRouter.post("/", addFollow);
followsRouter.delete("/", removeFollow);
followsRouter.get("/:userId", getFollowers);
