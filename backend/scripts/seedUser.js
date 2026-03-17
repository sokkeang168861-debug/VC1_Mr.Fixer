const path = require("path");

// Ensure env loads the same as the app
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const bcrypt = require("bcrypt");
const db = require("../src/config/db");

const main = async () => {
  const rawArgs = process.argv.slice(2);
  const reset = rawArgs.includes("--reset");
  const args = rawArgs.filter((a) => a !== "--reset");

  const [emailArg, passwordArg, fullNameArg, phoneArg, roleArg] = args;

  const email = String(emailArg || "").trim().toLowerCase();
  const password = String(passwordArg || "").trim();
  const full_name = String(fullNameArg || "Lola").trim();
  const phone = String(phoneArg || "000000000").trim();
  const role = String(roleArg || "customer").trim();

  if (!email || !password) {
    console.error(
      "Usage: node scripts/seedUser.js <email> <password> [full_name] [phone] [role] [--reset]"
    );
    process.exit(1);
  }

  try {
    const existing = await new Promise((resolve, reject) => {
      db.query("SELECT id, email, role FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return reject(err);
        resolve(results?.[0] || null);
      });
    });

    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      if (!reset) {
        console.log(`User already exists: ${existing.email} (${existing.role})`);
        console.log("Tip: pass --reset to update the password.");
        process.exit(0);
      }

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashed, existing.id],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      console.log("Updated user password:");
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      process.exit(0);
    }

    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [full_name, phone, email, hashed, role],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    console.log("Seeded user:");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: ${role}`);
  } catch (err) {
    console.error("Failed to seed user:", err.message);
    process.exit(1);
  } finally {
    db.end?.();
  }
};

main();
