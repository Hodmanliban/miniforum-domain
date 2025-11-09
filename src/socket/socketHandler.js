// Socket.IO event handlers för real-time funktionalitet

export const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Join en specifik post's room (för comments)
        socket.on("join-post", (postId) => {
            socket.join(`post-${postId}`);
            console.log(`User ${socket.id} joined post ${postId}`);
        });

        // Leave post room
        socket.on("leave-post", (postId) => {
            socket.leave(`post-${postId}`);
            console.log(`User ${socket.id} left post ${postId}`);
        });

        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
};

// Emit events (används från controllers)
export const emitNewPost = (io, post) => {
    io.emit("post:created", post);
};

export const emitPostUpdated = (io, post) => {
    io.emit("post:updated", post);
};

export const emitPostDeleted = (io, postId) => {
    io.emit("post:deleted", postId);
};

export const emitNewLike = (io, postId, userId) => {
    io.emit("post:liked", { postId, userId });
};

export const emitUnlike = (io, postId, userId) => {
    io.emit("post:unliked", { postId, userId });
};

export const emitNewComment = (io, postId, comment) => {
    io.to(`post-${postId}`).emit("comment:created", comment);
};