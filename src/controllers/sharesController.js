import { Share } from "../models/Share.js";
import { io } from "../server.js";

//POST /shares
export async function addShare(req, res) {
    try {
        const { userId, postId } = req.body;
        if (!userId || !postId)
            return res.status(400).json({ message: "Missing data" });

        const share = await Share.create({ userId, postId });

        // Real-time: Emit share event
        const count = await Share.countDocuments({ postId });
        io.emit('post-shared', { postId, userId, totalShares: count });

        res.status(200).json(share);
    } catch (err) {
        if (err.code === 11000)
            return res.status(400).json({ message: "Already shared" });
        res.status(500).json({ message: "Server error" });
    }

}

//DELETE /shares (undo share/repost)
export async function removeShare(req, res) {
    try {
        const { userId, postId } = req.body;
        if (!userId || !postId)
            return res.status(400).json({ message: "Missing data" });

        await Share.deleteOne({ userId, postId });

        // Real-time: Emit unshare event
        const count = await Share.countDocuments({ postId });
        io.emit('post-unshared', { postId, userId, totalShares: count });

        res.json({ message: "Share removed" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//GET /shares/:postId
export async function getShares(req, res) {
    try {
        const { postId } = req.params;
        const count = await Share.countDocuments({ postId });
        res.json({ postId, shares: count });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//GET /shares/user/:userId (hämta användarens shares för profil)
export const getUserShares = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user?.id;

        // Check if profile content is accessible
        const { checkProfileAccess } = await import('../../utils/profileAccess.js');
        const access = await checkProfileAccess(userId, requestingUserId);

        if (!access.allowed) {
            // Return empty array if profile is private - basic info is still visible in profile endpoint
            return res.json([]);
        }

        const shares = await Share.find({ userId }).populate('postId').sort({ createdAt: -1 });
        res.json(shares);
    } catch (error) {
        console.error('❌ Error fetching user shares:', error);
        res.status(500).json({ message: 'Failed to fetch user shares' });
    }
};