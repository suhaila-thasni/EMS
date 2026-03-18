import { query } from "../config/db";

const makeAdmin = async (email: string) => {
    try {
        const result = await query(
            "UPDATE users SET role = 'Admin' WHERE email = $1 RETURNING first_name, last_name",
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            console.log(`[AUTH] No user found with email: ${email}`);
        } else {
            const user = result.rows[0];
            console.log(`[AUTH] Success! ${user.first_name} ${user.last_name} is now an Admin.`);
        }
        process.exit(0);
    } catch (error) {
        console.error("[AUTH] Error updating role:", error);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log("Please provide an email: npx tsx src/utils/make-admin.ts user@example.com");
    process.exit(1);
}

makeAdmin(email);
