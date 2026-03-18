import { query } from "../config/db";
import { v4 as uuidv4 } from "uuid";

const seedData = async () => {
    console.log("[DB] Seeding Jobs and Messages...");
    try {
        // Clear existing
        await query("DELETE FROM jobs");
        await query("DELETE FROM messages");

        // Seed Jobs
        const jobs = [
            { title: "Senior Fashion Consultant", dept: "Sales Floor", loc: "Flagship – Kochi", sal: "$45k - $60k", desc: "Expert styling and client management." },
            { title: "Inventory Specialist", dept: "Operations", loc: "Main Shop – Malappuram", sal: "$35k - $42k", desc: "Managing high-end garments and stock sync." },
            { title: "Boutique Manager", dept: "Management", loc: "Boutique – Calicut", sal: "$55k - $75k", desc: "Leading a team of fashion artisans." },
            { title: "Visual Merchandiser", dept: "Creative", loc: "All Locations", sal: "$40k - $50k", desc: "Designing premium floor layouts." }
        ];

        for (const job of jobs) {
            await query(
                "INSERT INTO jobs (id, title, department, location, salary, description) VALUES ($1, $2, $3, $4, $5, $6)",
                [uuidv4(), job.title, job.dept, job.loc, job.sal, job.desc]
            );
        }

        // Seed Messages
        const messages = [
            { title: "System Maintenance Complete", content: "The biometric engine has been upgraded to v2.4. All terminals are now operational.", priority: "Normal", cat: "System" },
            { title: "New Floor Policy", content: "Effective immediately, all staff must sync their GPS within 50m of the entrance.", priority: "High", cat: "Compliance" },
            { title: "Eid Celebration Gala", content: "Fashion Couture will be hosting a staff dinner this Friday at 8:00 PM.", priority: "Normal", cat: "Social" }
        ];

        for (const msg of messages) {
            await query(
                "INSERT INTO messages (id, title, content, priority, category) VALUES ($1, $2, $3, $4, $5)",
                [uuidv4(), msg.title, msg.content, msg.priority, msg.cat]
            );
        }

        console.log("[DB] Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("[DB] Seeding error:", error);
        process.exit(1);
    }
};

seedData();
