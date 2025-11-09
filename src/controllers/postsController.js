import Post from "../models/Post.js";
import { Follow } from "../models/Follow.js";
import { io } from "../server.js";
import { emitNewPost, emitPostUpdated, emitPostDeleted } from "../socket/socketHandler.js";

export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        console.log("📝 Create post request:", { title, content, userId, body: req.body });

        if (!title || !content) {
            console.log("❌ Validation failed - missing title or content");
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

        // Emit real-time event
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

        // Emit real-time event
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

        // Emit real-time event
        emitPostDeleted(io, id);

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 });

        const authUrl = process.env.AUTH_BACKEND_URL || 'http://localhost:4100';
        const requestingUserId = req.user?.id;

        const filteredPosts = await Promise.all(
            posts.map(async (post) => {
                // Always show own posts
                if (post.author === requestingUserId) {
                    return post;
                }

                try {
                    const response = await fetch(`${authUrl}/api/auth/users/${post.author}`);
                    if (!response.ok) return post; // If user not found, show post

                    const user = await response.json();

                    // If user is private, check if requesting user follows them
                    if (user.isPrivate) {
                        if (!requestingUserId) return null; // Not logged in, hide private posts

                        // Check if requesting user follows this private user
                        const isFollowing = await Follow.findOne({
                            followerId: requestingUserId,
                            followingId: post.author
                        });

                        return isFollowing ? post : null;
                    }

                    // Public user, show post
                    return post;
                } catch (error) {
                    // On error, show post (fail-open for better UX)
                    return post;
                }
            })
        );

        // Remove null entries (hidden posts)
        const visiblePosts = filteredPosts.filter(post => post !== null);

        res.json(visiblePosts);
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
        const requestingUserId = req.user?.id;

        // Check if profile content is accessible
        const { checkProfileAccess } = await import('../../utils/profileAccess.js');
        const access = await checkProfileAccess(userId, requestingUserId);

        if (!access.allowed) {
            // Return empty array if profile is private - basic info is still visible in profile endpoint
            return res.json([]);
        }

        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('❌ Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch user posts' });
    }
};
