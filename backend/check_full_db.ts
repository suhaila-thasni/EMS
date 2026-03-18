
import { query } from "./src/config/db";

async function check() {
    try {
        const res = await query("SELECT * FROM system_config");
        console.log("All system settings:");
        res.rows.forEach(r => console.log(`${r.key}: ${r.value} (updated: ${r.updated_at})`));
    } catch (e) {
        console.error(e);
    }
}

check();
