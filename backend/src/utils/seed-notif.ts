import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

const seedNotification = async () => {
    try {
        // Get the first user to seed a notification for them
        const users = await query("SELECT id FROM users LIMIT 1");
        if (users.rows.length === 0) {
            console.log("[SEED] No users found. Please register first.");
            return;
        }

        const userId = users.rows[0].id;
        const id = uuidv4();

        await query(
            "INSERT INTO notifications (id, user_id, title, message, type) VALUES ($1, $2, $3, $4, $5)",
            [id, userId, "Welcome to EMS", "System initialized successfully. Your notification panel is now live.", "success"]
        );
        console.log(`[SEED] Sample notification created for user: ${userId}`);
    } catch (error) {
        console.error("[SEED] Error seeding notification:", error);
    }
};

seedNotification();
