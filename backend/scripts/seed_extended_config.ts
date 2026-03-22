import { query } from "../src/config/db";

async function seed() {
  console.log("Seeding Extended System Configuration...");
  const configs = [
    { key: 'company_address', value: 'Fashion Couture, Malappuram, Kerala' },
    { key: 'office_hours_start', value: '09:00' },
    { key: 'office_hours_end', value: '18:00' },
    { key: 'late_threshold', value: '15' },
    { key: 'currency', value: 'INR' },
    { key: 'mfa_required', value: 'false' },
    { key: 'leave_types', value: '["Sick", "Casual", "Paid"]' }
  ];

  try {
    for (const config of configs) {
      await query(
        "INSERT INTO system_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
        [config.key, config.value]
      );
    }
    console.log("Seeding Successful! Common EMS settings initialized.");
  } catch (err) {
    console.error("Seeding Failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
