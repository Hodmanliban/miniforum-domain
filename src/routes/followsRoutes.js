import express from "express";
import { proxyToggleFollow, proxyGetFollowers, proxyGetFollowing } from "../controllers/followController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/:userId/follow", authMiddleware, proxyToggleFollow);
router.get("/:userId/followers", authMiddleware, proxyGetFollowers);
router.get("/:userId/following", authMiddleware, proxyGetFollowing);

export default router;