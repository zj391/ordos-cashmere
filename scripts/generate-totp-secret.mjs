#!/usr/bin/env node
/**
 * scripts/generate-totp-secret.mjs — One-time setup for admin 2FA.
 *
 * Usage:
 *   node scripts/generate-totp-secret.mjs
 *
 * Output:
 *   - ADMIN_TOTP_SECRET    (base32, 32 chars; set in Vercel env)
 *   - ADMIN_TOTP_RECOVERY_CODES (8 hex codes; set in Vercel env)
 *
 * Run this once. Save both values somewhere safe (1Password etc).
 * Recovery codes are single-use: remove the used one from env after consumption.
 *
 * After running:
 *   1. Set ADMIN_TOTP_SECRET in Vercel project env (Production + Preview)
 *   2. Set ADMIN_TOTP_RECOVERY_CODES as a comma-separated list in Vercel env
 *   3. In your authenticator app (Google Authenticator / 1Password / Authy):
 *        - Type "Manual entry"
 *        - Account: admin@erdosdx.com
 *        - Key: <ADMIN_TOTP_SECRET>
 *        - Type: Time-based
 *        - Digits: 6
 *        - Period: 30
 *      OR
 *        - Paste the otpauth URI printed below
 *   4. Test login at /admin/login/ — should require password + 6-digit code
 */

import { generateSecret, otpauthUri } from '../src/server/admin/totp.js';
import { generateRecoveryCodes } from '../src/server/admin/admin-session.js';

const secret = generateSecret(20);
const codes = generateRecoveryCodes(8);
const issuer = 'DONGXIAO';
const account = 'admin@erdosdx.com';
const uri = otpauthUri({ secret, issuer, accountName: account });

console.log('========================================================');
console.log('Admin 2FA setup — save these values somewhere safe');
console.log('========================================================\n');
console.log('Set these as environment variables in your Vercel project:\n');
console.log(`ADMIN_TOTP_SECRET=${secret}\n`);
console.log(`ADMIN_TOTP_RECOVERY_CODES=${codes.join(',')}\n`);
console.log('--------------------------------------------------------\n');
console.log('Authenticator setup (paste this URI in your app):\n');
console.log(uri);
console.log('\n--------------------------------------------------------\n');
console.log('Recovery codes (each usable ONCE if you lose your phone):\n');
codes.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
console.log('\n========================================================');
console.log('After setup:');
console.log('  - Save ADMIN_TOTP_SECRET in 1Password / Bitwarden (treat as password)');
console.log('  - Save recovery codes separately (e.g. paper backup in a safe)');
console.log('  - Test /admin/login/ — should now require both password + 6-digit code');
console.log('  - If locked out, paste a recovery code at the verification step');
console.log('========================================================');
