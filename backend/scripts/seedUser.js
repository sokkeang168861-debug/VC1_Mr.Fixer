// Usage:   node scripts/seedUser.js <email> <password> [full_name] [phone] [role] [--reset]
// Example: node scripts/seedUser.js admin@mrfixer.com secret123 "Admin User" 0812345678 admin
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const bcrypt = require("bcrypt");
const db = require("../src/config/db");

const main = async () => {
  // --- Parse arguments ---
  const rawArgs = process.argv.slice(2);
  const reset = rawArgs.includes("--reset");
  const [emailArg, passwordArg, fullNameArg, phoneArg, roleArg] = rawArgs.filter((a) => a !== "--reset");

  const email    = String(emailArg    || "").trim().toLowerCase();
  const password = String(passwordArg || "").trim();
  const fullName = String(fullNameArg || "Test User").trim();
  const phone    = String(phoneArg    || "000000000").trim();
  const role     = String(roleArg     || "customer").trim();

  if (!email || !password) {
    console.error("Usage: node scripts/seedUser.js <email> <password> [full_name] [phone] [role] [--reset]");
    process.exit(1);
  }

  // --- Run DB operation ---
  try {
    const [[existing]] = await db.query(
      "SELECT id, email, role FROM users WHERE email = ?",
      [email]
    );

    if (existing && !reset) {
      console.log(`User already exists: ${existing.email} (${existing.role})`);
      console.log("Tip: pass --reset to update the password.");
      return; // exit cleanly — finally block still runs
    }

    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      // --reset flag: update password only
      await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, existing.id]);
      console.log(`Updated password for: ${email}`);
    } else {
      // New user: insert
      await db.query(
        "INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [fullName, phone, email, hashed, role]
      );
      console.log(`Seeded user:`);
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Role:     ${role}`);
    }
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
};

main();
