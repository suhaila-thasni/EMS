import { query } from "../config/db";

export const ensureSystemConfig = async () => {
    try {
        // Create system_config table if it doesn't exist
        await query(`
            CREATE TABLE IF NOT EXISTS system_config (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed defaults only if not already set
        await query(`
            INSERT INTO system_config (key, value) VALUES
                ('shop_lat', '11.045719'),
                ('shop_lng', '76.111876'),
                ('shop_name', 'Zorrow Tech IT Solutions Pvt. Ltd'),
                ('allowed_radius', '100')
            ON CONFLICT (key) DO NOTHING;
        `);

        console.log("[SystemConfig] system_config table ready.");
    } catch (error) {
        console.error("[SystemConfig] Error initializing system_config:", error);
    }
};
