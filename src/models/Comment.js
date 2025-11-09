import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: [true, "Post ID is required"]
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        maxlength: [1000, "Comment cannot exceed 1000 characters"]
    },
    author: {
        type: String,  // User ID från auth backend
        required: [true, "Author is required"]
    },
    authorName: {
        type: String,
        default: "Anonymous"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index för snabbare queries
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
