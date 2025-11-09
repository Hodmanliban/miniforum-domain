import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export const authMiddleware = async (req, res, next) => {
    try {
        // Hämta token från cookie
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "Access token required"
            });
        }

        // Verifiera JWT
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

        // Lägg till user info i request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        res.status(500).json({
            message: "Authentication failed"
        });
    }
};

// Optional middleware för att tillåta både authed och unauthed requests
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (token) {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name
            };
        }

        next();
    } catch (error) {
        // Om token är invalid, fortsätt ändå men utan user
        next();
    }
};