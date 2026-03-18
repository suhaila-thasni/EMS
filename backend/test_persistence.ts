
import { query } from "./src/config/db";

async function testUpdate() {
    try {
        const lat = "12.345678";
        const lng = "78.901234";
        
        console.log("Updating to:", lat, lng);
        
        await query(
            `INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
            ['shop_lat', lat]
        );
        
        await query(
            `INSERT INTO system_config (key, value, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
            ['shop_lng', lng]
        );
        
        const res = await query("SELECT * FROM system_config WHERE key IN ('shop_lat', 'shop_lng')");
        console.log("Verified in DB:", res.rows);
    } catch (e) {
        console.error(e);
    }
}

testUpdate();
