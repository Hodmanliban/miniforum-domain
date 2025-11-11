
import { io } from "../server.js";
import axios from "axios";

export const proxyToggleFollow = async (req, res) => {
  const { userId } = req.params;
  try {
    const authUrl = process.env.AUTH_BACKEND_URL || "http://localhost:4100";
    const response = await axios.post(
      `${authUrl}/api/auth/users/${userId}/follow`,
      {},
      { headers: { Cookie: req.headers.cookie } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to follow/unfollow user" });
  }
};

export const proxyGetFollowers = async (req, res) => {
  const { userId } = req.params;
  try {
    const authUrl = process.env.AUTH_BACKEND_URL || "http://localhost:4100";
    const response = await axios.get(
      `${authUrl}/api/auth/users/${userId}/followers`,
      { headers: { Cookie: req.headers.cookie } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to get followers" });
  }
};

export const proxyGetFollowing = async (req, res) => {
  const { userId } = req.params;
  try {
    const authUrl = process.env.AUTH_BACKEND_URL || "http://localhost:4100";
    const response = await axios.get(
      `${authUrl}/api/auth/users/${userId}/following`,
      { headers: { Cookie: req.headers.cookie } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Failed to get following" });
  }
};