import { db } from "./src/app/lib/db-helpers.js";

async function main() {
  try {
    console.log("Testing DB connection...");

    // Simple query, change "token_purchase" to any table you have
    const rows = await db.query("SELECT NOW() as now");

    console.log("✅ DB connection OK!");
    console.log("Result:", rows);

  } catch (err) {
    console.error("❌ DB connection failed!");
    console.error(err);
  } finally {
    process.exit(); // exit Node after test
  }
}

main();
