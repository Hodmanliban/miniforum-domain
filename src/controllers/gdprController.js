import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export const exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Hämta alla posts
        const posts = await Post.find({ author: userId })
            .select('-__v')
            .lean();

        // Hämta alla comments
        const comments = await Comment.find({ author: userId })
            .select('-__v')
            .lean();

        // Skapa GDPR export
        const exportData = {
            userId: userId,
            email: req.user.email,
            name: req.user.name,
            exportDate: new Date().toISOString(),

            statistics: {
                totalPosts: posts.length,
                totalComments: comments.length
            },

            posts: posts.map(post => ({
                id: post._id,
                title: post.title,
                content: post.content,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                likes: post.likes?.length || 0
            })),

            comments: comments.map(comment => ({
                id: comment._id,
                postId: comment.postId,
                content: comment.content,
                createdAt: comment.createdAt
            }))
        };

        // Log export (audit trail)
        console.log(`[GDPR EXPORT] User ${userId} exported their data`);

        res.json({
            message: "User data exported successfully",
            data: exportData
        });
    } catch (error) {
        console.error("Export user data error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteUserData = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verifiera att requesten kommer från auth backend
        const authToken = req.headers.authorization;
        // TODO: Verifiera JWT från auth backend

        // Radera ALLA posts
        const deletedPosts = await Post.deleteMany({ author: userId });

        // Radera ALLA comments
        const deletedComments = await Comment.deleteMany({ author: userId });

        // Logga för audit trail
        console.log(`[GDPR DELETION] User ${userId}`);
        console.log(`- Posts deleted: ${deletedPosts.deletedCount}`);
        console.log(`- Comments deleted: ${deletedComments.deletedCount}`);

        res.status(200).json({
            message: "User data deleted from domain backend",
            deleted: {
                posts: deletedPosts.deletedCount,
                comments: deletedComments.deletedCount
            }
        });

    } catch (error) {
        console.error("Delete domain data error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const anonymizeUserContent = async (req, res) => {
    try {
        const userId = req.user.id;

        // Anonymisera posts (behåll innehållet men ta bort kopplingen)
        const anonymizedPosts = await Post.updateMany(
            { author: userId },
            {
                author: 'anonymous',
                authorName: '[Deleted User]',
                updatedAt: new Date()
            }
        );

        // Anonymisera comments
        const anonymizedComments = await Comment.updateMany(
            { author: userId },
            {
                author: 'anonymous',
                authorName: '[Deleted User]',
                updatedAt: new Date()
            }
        );

        // Logga för audit trail
        console.log(`[GDPR ANONYMIZATION] User ${userId}`);
        console.log(`- Posts anonymized: ${anonymizedPosts.modifiedCount}`);
        console.log(`- Comments anonymized: ${anonymizedComments.modifiedCount}`);

        res.status(200).json({
            message: "User content anonymized successfully",
            anonymized: {
                posts: anonymizedPosts.modifiedCount,
                comments: anonymizedComments.modifiedCount
            }
        });

    } catch (error) {
        console.error("Anonymize user content error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
