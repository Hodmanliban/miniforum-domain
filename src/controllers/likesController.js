import { Like } from "../models/Like.js";

//Post /likes
export async function addLike(req, res) {
    try {
        const { postId, userId } = req.body;
        if(!postId || !userId) return res.status(400).json({ message: "Missing data "});

        const like = await Like.create({ postId, userId });
        res.status(201).json(like);

    } catch (err) {
        //fångar duplicate-key error (om användaren redan har gillat)
        if(err.code === 11000){
            return res.status(400).json({ message: "Already liked" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

//Delete /likes
export async function removeLike(req, res) {
    try {
        const { postId, userId } = req.body;
        await Like.deleteOne({ postId, userId});
        res.json({ message: "Like removed" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

//GET /likes/:postId
export async function getLikes(req, res) {
    try {
        const { postId } = req.params;
        const count = await Like.countDocuments({ postId });
        res.json({postId, likes: count });
    } catch (error) {
        res.error(500).json({ message: "Server error" });
    }
}