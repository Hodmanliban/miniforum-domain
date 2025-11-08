import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true},
        postId: { type: String, required: true},
    },
    { timestamps: true }
);

//En användare kan bara dela samma post en gång
shareSchema.index({ userId: 1, postId: 1 }, { unique: true })

export const Share = mongoose.model("Share", shareSchema);
