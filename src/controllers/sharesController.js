import { Share } from "../models/Share.js";

//POST /shares
export async function addShare(req, res) {
    try {
        const { userId, postId } = req.body;
        if (!userId || !postId)
            return res.status(400).json({ message: "Missing data" });

        const share = await Share.create({ userId, postId });
        res.status(200).json(share);
    } catch (err) {
        if (err.code === 11000)
            return res.status(400).json({ message: "Already shared" });
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