// controllers/searchController.js
import axios from "axios";

export const searchUsers = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const authUrl = process.env.AUTH_BACKEND_URL || "http://localhost:4100";
        const response = await axios.get(`${authUrl}/api/auth/users/search?q=${encodeURIComponent(q)}`, {
            headers: {
                Cookie: req.headers.cookie // Skicka med cookies för auth om det behövs
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("User search error:", error.message);
        res.status(500).json({ message: "Failed to search users" });
    }
};