import { Follow } from "../models/Follow.js";
import { io } from "../server.js";

//POST /follows
export async function addFollow(req, res) {
    try {
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId)
            return res.status(400).json({ message: "Missing data" });

        const follow = await Follow.create({ followerId, followingId });

        // Real-time: Emit follow event
        io.emit('user-followed', { followerId, followingId });

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

        // Real-time: Emit unfollow event
        io.emit('user-unfollowed', { followerId, followingId });

        res.json({ message: "Unfollowed" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//GET /follows/followers/:userId (visa följare)
export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;

        // Followers are always visible (like Instagram/Twitter)
        const followers = await Follow.find({ followingId: userId }).select('followerId');
        res.json(followers);
    } catch (error) {
        console.error('❌ Error fetching followers:', error);
        res.status(500).json({ message: 'Failed to fetch followers' });
    }
};

//GET /follows/following/:userId (visa vilka användaren följer)
export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;

        // Following list is always visible (like Instagram/Twitter)
        const following = await Follow.find({ followerId: userId }).select('followingId');
        res.json(following);
    } catch (error) {
        console.error('❌ Error fetching following:', error);
        res.status(500).json({ message: 'Failed to fetch following' });
    }
};