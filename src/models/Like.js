import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true},
        postId: { type: String, required: true},
    },
    {timestamps: true }
);

//gör så att en användare bara kan gilla ett inlägg en gång
likeSchema.index({ userId: 1, postId: 1}, {unique: true });

export const Like = mongoose.model("Like", likeSchema);
