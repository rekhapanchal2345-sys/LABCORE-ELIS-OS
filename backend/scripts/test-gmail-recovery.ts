/**
 * Live checks for the Gmail recovery endpoints.
 *
 * The important property is that a known address and an unknown one produce
 * byte-identical responses, so the endpoint cannot be used to discover which
 * emails have staff accounts. This asserts that rather than assuming it.
 *
 * Run with the API already listening:  npx ts-node scripts/test-gmail-recovery.ts
 */
import 'dotenv/config';

const BASE = process.env.API_URL || 'http://localhost:5000';

async function post(path: string, body: unknown) {
  const started = Date.now();
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text,
    ms: Date.now() - started,
  };
}

async function main() {
  let failures = 0;
  const check = (name: string, ok: boolean, detail = '') => {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures += 1;
  };

  // ── Known address ──────────────────────────────────────────────────────
  const known = await post('/api/auth/password/forgot', {
    email: 'nikilpanchal0@gmail.com',
  });

  // ── Unknown address: must be indistinguishable ──────────────────────────
  const unknown = await post('/api/auth/password/forgot', {
    email: 'definitely-not-a-real-account-9f3a2b@gmail.com',
  });

  check(
    'forgot: known and unknown return the same status',
    known.status === unknown.status,
    `${known.status} vs ${unknown.status}`
  );
  check(
    'forgot: known and unknown return the same body',
    known.body === unknown.body,
    known.body === unknown.body ? 'identical' : 'DIFFERENT'
  );

  // Timing should be comparable: an unknown address must not return instantly.
  const gap = Math.abs(known.ms - unknown.ms);
  check(
    'forgot: response times are comparable',
    gap < 1500,
    `${known.ms}ms vs ${unknown.ms}ms (gap ${gap}ms)`
  );

  // ── Gmail normalisation: dots, plus-tags and case all reach one account ──
  const variants = [
    'nikilpanchal0@gmail.com',
    'NikilPanchal0@Gmail.com',
    'nikilpanchal0+elis@gmail.com',
  ];

  const variantResponses = await Promise.all(
    variants.map((email) => post('/api/auth/password/forgot', { email }))
  );

  check(
    'forgot: Gmail variants are all accepted',
    variantResponses.every((r) => r.status === 200),
    variantResponses.map((r) => r.status).join(', ')
  );
  check(
    'forgot: Gmail variants return the same body as each other',
    new Set(variantResponses.map((r) => r.body)).size === 1
  );

  // ── An invalid code must not reveal whether the account exists ──────────
  const badCodeKnown = await post('/api/auth/password/reset', {
    email: 'nikilpanchal0@gmail.com',
    code: '000000',
    newPassword: 'Correct-Horse-9!',
  });
  const badCodeUnknown = await post('/api/auth/password/reset', {
    email: 'definitely-not-a-real-account-9f3a2b@gmail.com',
    code: '000000',
    newPassword: 'Correct-Horse-9!',
  });

  check(
    'reset: wrong code behaves the same for known and unknown',
    badCodeKnown.status === badCodeUnknown.status,
    `${badCodeKnown.status} vs ${badCodeUnknown.status}`
  );
  check(
    'reset: wrong code returns the same message either way',
    badCodeKnown.body === badCodeUnknown.body
  );

  // ── Validation ──────────────────────────────────────────────────────────
  const weak = await post('/api/auth/password/reset', {
    email: 'nikilpanchal0@gmail.com',
    code: '123456',
    newPassword: 'short',
  });
  check(
    'reset: a weak password is rejected',
    weak.status === 400,
    `status ${weak.status}`
  );

  const malformed = await post('/api/auth/password/reset', {
    email: 'nikilpanchal0@gmail.com',
    code: '12345',
    newPassword: 'Correct-Horse-9!',
  });
  check(
    'reset: a malformed code is rejected',
    malformed.status === 400,
    `status ${malformed.status}`
  );

  const notAnEmail = await post('/api/auth/password/forgot', { email: 'nope' });
  check(
    'forgot: a non-address is rejected',
    notAnEmail.status === 400,
    `status ${notAnEmail.status}`
  );

  // ── Owner confirmation must require a real session ───────────────────────
  const noAuth = await post('/api/auth/owner/verify', { password: 'anything' });
  check(
    'owner/verify: refuses an unauthenticated request',
    noAuth.status === 401,
    `status ${noAuth.status}`
  );

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Test run failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
