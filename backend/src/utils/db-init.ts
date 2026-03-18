import { query } from "../config/db";

const initTables = async () => {
    console.log("[DB] Initializing additional tables...");
    try {
        // CORE TABLES (Ensuring these exist with right columns)
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'Employee',
                department VARCHAR(100),
                shop_location VARCHAR(100),
                profile_image TEXT,
                high_fidelity_maps BOOLEAN DEFAULT FALSE,
                auto_sync_gps BOOLEAN DEFAULT FALSE,
                otp VARCHAR(6),
                otp_expires TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check for missing columns if table already exists (Self-healing)
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS high_fidelity_maps BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_sync_gps BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;`);

        await query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                selfie_url TEXT,
                status VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // EXTENDED TABLES
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Jobs Table
        await query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                location VARCHAR(100) NOT NULL,
                salary VARCHAR(100),
                type VARCHAR(50) DEFAULT 'Full-time',
                description TEXT,
                status VARCHAR(20) DEFAULT 'Open',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Messages / System Announcements Table
        await query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(100) DEFAULT 'System Admin',
                priority VARCHAR(20) DEFAULT 'Normal',
                category VARCHAR(50) DEFAULT 'General',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // System Config Table
        await query(`
            CREATE TABLE IF NOT EXISTS system_config (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Default Shop Location
        await query(`
            INSERT INTO system_config (key, value) VALUES
                ('shop_lat', '11.045719'),
                ('shop_lng', '76.111876'),
                ('shop_name', 'Fashion Couture'),
                ('allowed_radius', '100')
            ON CONFLICT (key) DO NOTHING;
        `);

        console.log("[DB] All tables are ready.");
    } catch (error) {
        console.error("[DB] Error initializing tables:", error);
        process.exit(1);
    }
};

initTables();
