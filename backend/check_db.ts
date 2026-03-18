
import { query } from "./src/config/db";

async function check() {
    try {
        const res = await query("SELECT * FROM system_config");
        console.log("Current system_config:", res.rows);
    } catch (e) {
        console.error(e);
    }
}

check();
