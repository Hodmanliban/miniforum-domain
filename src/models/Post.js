import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"]
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true
    },
    author: {
        type: String,  // User ID från auth backend
        required: [true, "Author is required"]
    },
    authorName: {
        type: String,
        default: "Anonymous"
    },
    likes: [{
        type: String  // Array av user IDs som gillat
    }],
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
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
