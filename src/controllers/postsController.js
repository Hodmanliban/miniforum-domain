import Post from "../models/Post.js";
import axios from "axios";
import { io } from "../server.js";
import { emitNewPost, emitPostUpdated, emitPostDeleted } from "../socket/socketHandler.js";

export const getFeedPosts = async (req, res) => {
    const userId = req.user.id;
    try {
        // Hämta following-listan via proxy till auth-backend
        const authUrl = process.env.AUTH_BACKEND_URL || "http://localhost:4100";
        const response = await axios.get(
            `${authUrl}/api/auth/users/${userId}/following`,
            { headers: { Cookie: req.headers.cookie } }
        );
        const following = response.data.map(u => u._id);
        const ids = [userId, ...following];
        const posts = await Post.find({ author: { $in: ids } }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("Get feed posts error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const post = await Post.create({
            title,
            content,
            author: userId,
            createdAt: new Date()
        });

        emitNewPost(io, post);

        res.status(201).json({
            message: "Post created successfully",
            post
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({
                message: "Not authorized to update this post"
            });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.updatedAt = new Date();

        await post.save();

        emitPostUpdated(io, post);

        res.json({
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        console.error("Update post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({
                message: "Not authorized to delete this post"
            });
        }

        await post.deleteOne();

        emitPostDeleted(io, id);

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ post });
    } catch (error) {
        console.error("Get post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('❌ Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch user posts' });
    }
};