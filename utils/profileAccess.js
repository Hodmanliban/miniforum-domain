// Helper för att kolla om användare har tillgång till en profil
import { Follow } from '../src/models/Follow.js';

export async function checkProfileAccess(targetUserId, requestingUserId) {
    try {
        // Om användaren tittar på sin egen profil → alltid tillåtet
        if (targetUserId === requestingUserId) {
            return { allowed: true };
        }

        // Hämta användarens privacy settings från auth backend
        const authUrl = process.env.AUTH_BACKEND_URL || 'http://localhost:4100';
        const response = await fetch(`${authUrl}/api/auth/users/${targetUserId}`);

        if (!response.ok) {
            return { allowed: false, message: "User not found" };
        }

        const user = await response.json();

        // Om profilen är privat → kolla om användaren följer dem
        if (user.isPrivate) {
            if (!requestingUserId) {
                return { allowed: false, message: "This profile is private" };
            }

            // Kolla om requesting user följer target user
            const isFollowing = await Follow.findOne({
                followerId: requestingUserId,
                followingId: targetUserId
            });

            if (isFollowing) {
                return { allowed: true }; // Följer → tillåt access
            }

            return { allowed: false, message: "This profile is private" };
        }

        // Annars → tillåt access
        return { allowed: true };

    } catch (error) {
        console.error("Profile access check error:", error);
        // Vid fel → tillåt access (fail-open för bättre UX)
        return { allowed: true };
    }
}
