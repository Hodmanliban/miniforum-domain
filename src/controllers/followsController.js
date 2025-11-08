import { Follow } from "../models/Follow.js";

//POST /follows
export async function addFollow(req, res) {
    try {
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId)
            return res.status(400).json({ message: "Missing data" });

        const follow = await Follow.create({ followerId, followingId });
        res.status(201).json(follow)

    } catch (err) {
        console.error("addFollow error:", err);
        if (err.code === 11000)
            return res.status(400).json({ message: "Already following" });
        res.status(500).json({ message: "Server error" });
    }
}

//DELETE /follows
export async function removeFollow(req, res) {
    try {
        const { followerId, followingId } = req.body;
        await Follow.deleteOne({ followerId, followingId });
        res.json({ message: "Unfollowed" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//GET /follows/:userId (visa följare)
export async function getFollowers(req, res) {
    try {
        const { userId } = req.params
        const followers = await Follow.find({ followingId: userId });
        res.json({ userId, followers });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}