const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
const p = new Pool({ connectionString: m ? m[1].trim() : process.env.DATABASE_URL });

(async () => {
  const sql = fs.readFileSync(process.argv[2], "utf8");
  try {
    await p.query(sql);
    console.log("MIGRATION APPLIED OK");
  } catch (e) {
    console.error("MIGRATION FAILED:", e.message);
    process.exitCode = 1;
  } finally {
    await p.end();
  }
})();