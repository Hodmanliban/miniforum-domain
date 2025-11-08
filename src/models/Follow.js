import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        followerId: { type: String, required: true },
        followingId: { type: String, required: true },
    },
    { timestamps: true }
);

//En användare kan inte följa samma person flera gånger
followSchema.index({ followerId: 1, followingId: 1 }, {unique: true });

export const Follow = mongoose.model("Follow", followSchema);