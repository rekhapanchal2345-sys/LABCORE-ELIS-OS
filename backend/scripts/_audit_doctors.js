const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
const p = new Pool({ connectionString: m ? m[1].trim() : process.env.DATABASE_URL });

(async () => {
  const q = async (label, sql) => {
    try {
      const r = await p.query(sql);
      console.log("\n=== " + label + " ===");
      console.log(JSON.stringify(r.rows, null, 1));
    } catch (e) {
      console.log("\n=== " + label + " ERROR === " + e.message);
    }
  };

  await q("enum DoctorType", "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid=enumtypid WHERE typname='DoctorType' ORDER BY enumsortorder");
  await q("ledger backfill", 'SELECT ce."doctorId", d."fullName", ce."periodKey", ce."baseAmount", ce."commissionRate", ce."commissionAmount", ce."status" FROM doctor_commission_entries ce JOIN doctors d ON d.id=ce."doctorId"');
  await q("new tables", "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'doctor%' ORDER BY table_name");
  await q("doctors new cols", "SELECT count(*)::int AS cnt FROM information_schema.columns WHERE table_name='doctors'");
  await q("fk check", "SELECT conname FROM pg_constraint WHERE conname LIKE '%doctor%fkey' ORDER BY conname");
  await p.end();
})();