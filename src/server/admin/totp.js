/**
 * TOTP (RFC 6238) implementation — pure JS, zero dependencies.
 *
 * Used by /admin/login to require a 6-digit time-based one-time password
 * in addition to ADMIN_PASSWORD. Compatible with Google Authenticator,
 * Authy, 1Password, Bitwarden, and any RFC 6238 TOTP client.
 *
 * Algorithm: HMAC-SHA1 over a counter derived from (now / 30s), truncated
 * to 6 decimal digits. We allow a ±1 step window (90 s) to absorb clock skew.
 *
 * Secret is base32-encoded for QR-code generation. Stored as the standard
 * otpauth:// URI scheme.
 *
 * NOTE: this is .js (not .ts) because Vercel Node API routes load raw JS
 * directly. The TOTP module is imported by auth.ts (compiled by Vite to
 * a .mjs that requires this file at runtime). Keep it plain JS that Node
 * 20 can execute without a build step.
 */
import { createHmac, randomBytes } from 'crypto';

// RFC 4648 base32 alphabet (no padding required for TOTP secrets).
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateSecret(numBytes) {
  const n = numBytes || 20;
  // 20 bytes = 160 bits per RFC 6238 §5.1.
  // Node crypto.randomBytes is a CSPRNG.
  const buf = randomBytes(n);
  let out = '';
  let bits = 0;
  let value = 0;
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 0x1f];
  return out;
}

function base32ToBytes(s) {
  const clean = String(s).replace(/=+$/g, '').toUpperCase().replace(/\s/g, '');
  const out = [];
  let bits = 0;
  let value = 0;
  for (let i = 0; i < clean.length; i++) {
    const idx = B32.indexOf(clean[i]);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

// Constant-time string comparison. Inputs are the 6-digit code strings
// so the early-return-on-length-leak is fine (length is always 6).
function timingSafeEqualStr(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function hotp(secretBytes, counter) {
  // 8-byte big-endian counter.
  const buf = Buffer.alloc(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const hmac = createHmac('sha1', Buffer.from(secretBytes)).update(buf).digest();
  // Dynamic truncation per RFC 4226 §5.3.
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binCode % 1000000;
  return String(otp).padStart(6, '0');
}

/**
 * Verify a 6-digit code against a base32 TOTP secret.
 * Returns true if the code matches any window within ±steps.
 *
 * opts.window: number of 30s steps to allow before/after current time. Default 1.
 * opts.nowMs: override time for testing.
 */
export function verifyTotp(secretBase32, code, opts) {
  if (!secretBase32 || !code) return false;
  const normalized = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  const window = (opts && opts.window) || 1;
  const nowSec = Math.floor(((opts && opts.nowMs) || Date.now()) / 1000);
  const counter = Math.floor(nowSec / 30);
  const bytes = base32ToBytes(secretBase32);
  for (let i = -window; i <= window; i++) {
    const expected = hotp(bytes, counter + i);
    if (timingSafeEqualStr(expected, normalized)) return true;
  }
  return false;
}

/**
 * Compute the current code (used for testing / admin display, NOT for
 * verification — verifyTotp must always be used to check user input).
 */
export function currentTotp(secretBase32, nowMs) {
  const counter = Math.floor(((nowMs || Date.now()) / 1000) / 30);
  return hotp(base32ToBytes(secretBase32), counter);
}

/**
 * Build an otpauth:// URI for QR code generation. Issuer is the brand
 * name shown in the user's authenticator app. Account label follows the
 * conventional "Issuer:user" format.
 */
export function otpauthUri(opts) {
  const issuer = opts.issuer || 'DONGXIAO';
  const account = opts.accountName || 'admin';
  const label = encodeURIComponent(issuer) + ':' + encodeURIComponent(account);
  const params = new URLSearchParams({
    secret: opts.secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: String((opts.digits == null) ? 6 : opts.digits),
    period: String((opts.period == null) ? 30 : opts.period),
  });
  return 'otpauth://totp/' + label + '?' + params.toString();
}
