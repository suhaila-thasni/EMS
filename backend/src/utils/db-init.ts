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
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_strict BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS key_rotation BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS terminal_id VARCHAR(50) DEFAULT 'EMS-X24-09';`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS os_layer VARCHAR(50) DEFAULT 'v1.2.4 Premium';`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_security_email BOOLEAN DEFAULT TRUE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_security_push BOOLEAN DEFAULT TRUE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_compliance_email BOOLEAN DEFAULT TRUE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_compliance_push BOOLEAN DEFAULT TRUE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_system_email BOOLEAN DEFAULT FALSE;`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notif_system_push BOOLEAN DEFAULT FALSE;`);

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
                ('shop_lat', '11.0360647'),
                ('shop_lng', '76.1022865'),
                ('shop_name', 'Zorrow Tech IT Solutions'),
                ('allowed_radius', '130')
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        `);

        // 10. Sessions Table for device tracking
        await query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                device_info VARCHAR(255),
                location VARCHAR(255),
                ip_address VARCHAR(50),
                is_current BOOLEAN DEFAULT FALSE,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Activity Logs Table
        await query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(100) NOT NULL,
                details TEXT,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Job Applications Table
        await query(`
            CREATE TABLE IF NOT EXISTS job_applications (
                id UUID PRIMARY KEY,
                job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                motivation TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Job Referrals Table
        await query(`
            CREATE TABLE IF NOT EXISTS job_referrals (
                id UUID PRIMARY KEY,
                referred_by UUID REFERENCES users(id) ON DELETE CASCADE,
                candidate_name VARCHAR(255) NOT NULL,
                candidate_email VARCHAR(255) NOT NULL,
                target_department VARCHAR(100),
                status VARCHAR(50) DEFAULT 'Referred',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // High-Performance & Security Indexes (Safe and Strong)
        await query(`CREATE INDEX IF NOT EXISTS idx_attendance_user_time ON attendance(user_id, timestamp DESC);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_activity_user_time ON activity_logs(user_id, created_at DESC);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_apps_user_job ON job_applications(user_id, job_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON job_referrals(referred_by);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_current ON sessions(user_id, is_current);`);

        console.log("[DB] All tables and high-velocity indexes are ready.");
    } catch (error) {
        console.error("[DB] Error initializing tables:", error);
        process.exit(1);
    }
};

initTables();
