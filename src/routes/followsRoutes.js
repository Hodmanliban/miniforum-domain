import express from "express";
import { addFollow, removeFollow, getFollowers, getFollowing } from "../controllers/followsController.js";

export const followsRouter = express.Router();

followsRouter.post("/", addFollow);
followsRouter.delete("/", removeFollow);
followsRouter.get("/followers/:userId", getFollowers);
followsRouter.get("/following/:userId", getFollowing);
