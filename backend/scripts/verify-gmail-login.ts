/**
 * Verifies the Gmail login migration landed correctly.
 *
 * Checks that the new columns and tables exist, that existing addresses were
 * backfilled, and that no two staff accounts share one Gmail mailbox (which
 * normalisation would otherwise have made ambiguous).
 */
import 'dotenv/config';
import prisma from '../api/config/database';

async function main() {
  const columns = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'users'
       AND column_name IN ('emailVerified','emailVerifiedAt','emailBlindIndex',
                           'lastAlertedDeviceFingerprint','lastAlertedIpAddress')
     ORDER BY column_name`
  );
  console.log('users columns added:', columns.map((c) => c.column_name).join(', '));

  const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_name IN ('email_verification_tokens','login_alerts')
     ORDER BY table_name`
  );
  console.log('tables created:', tables.map((t) => t.table_name).join(', '));

  const enumValues = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
    `SELECT e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON e.enumtypid = t.oid
     WHERE t.typname = 'EmailTokenPurpose'
     ORDER BY e.enumsortorder`
  );
  console.log('EmailTokenPurpose:', enumValues.map((e) => e.enumlabel).join(', '));

  const users = await prisma.user.findMany({
    select: { email: true, emailVerified: true, emailBlindIndex: true },
    orderBy: { email: 'asc' },
  });

  console.log(`\nstaff accounts (${users.length}):`);
  for (const u of users) {
    console.log(
      `  ${u.email} | verified=${u.emailVerified} | index=${
        u.emailBlindIndex ? u.emailBlindIndex.slice(0, 12) + '...' : 'MISSING'
      }`
    );
  }

  const missing = users.filter((u) => !u.emailBlindIndex);
  console.log(`\nbackfill missing index: ${missing.length}`);

  // Two rows sharing a blind index are two accounts on one mailbox.
  const seen = new Map<string, string[]>();
  for (const u of users) {
    if (!u.emailBlindIndex) continue;
    const list = seen.get(u.emailBlindIndex) ?? [];
    list.push(u.email);
    seen.set(u.emailBlindIndex, list);
  }
  const duplicates = [...seen.values()].filter((list) => list.length > 1);
  console.log(`mailboxes used by more than one account: ${duplicates.length}`);
  for (const d of duplicates) console.log(`  ${d.join('  <->  ')}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Verification failed:', error instanceof Error ? error.message : error);
  await prisma.$disconnect();
  process.exit(1);
});
