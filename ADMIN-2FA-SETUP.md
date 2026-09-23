# Admin 2FA Setup Guide (TOTP)

**Status**: Optional, recommended for production.

**What this enables**: After setup, logging into `/admin/login/` requires:
1. ADMIN_PASSWORD
2. 6-digit code from your authenticator app (or 8-char recovery code)

**Backwards-compatible**: If `ADMIN_TOTP_SECRET` env is not set, login works exactly as before (password only). Enable 2FA only when you're ready.

---

## Quick Setup (5 minutes)

### 1. Generate the secret

Run locally (NOT in Vercel — output is for local capture only):

```bash
cd /home/zj/ordos-cashmere
node scripts/generate-totp-secret.mjs
```

You'll see output like:

```
ADMIN_TOTP_SECRET=NTCGQV...HM4Z
ADMIN_TOTP_RECOVERY_CODES=0eaa9ec1,e9f9bb19,82a9104e,39598fc3,...
otpauth://totp/DONGXIAO:admin%40erdosdx.com?secret=NTCGQV...&...
```

### 2. Save secret + recovery codes

Put these in a password manager (1Password / Bitwarden):
- `ADMIN_TOTP_SECRET` (treat as a password)
- `ADMIN_TOTP_RECOVERY_CODES` (also treat as passwords — each is single-use)

Print the recovery codes on paper and store somewhere physical (safe deposit box, fireproof safe). These are your only way back in if you lose your phone.

### 3. Set up your authenticator app

**Option A** (recommended): Paste the otpauth URI
- Most authenticator apps have a "Paste URI" or "Add via QR" option that
  accepts the otpauth:// URL directly.
- 1Password, Bitwarden, Authy all support this.

**Option B**: Manual entry
- Account: `admin@erdosdx.com`
- Key: (paste `ADMIN_TOTP_SECRET` value, no spaces)
- Type: Time-based
- Digits: 6
- Period: 30

**Option C**: Real QR code
- The otpauth URI printed above can be pasted into any QR generator
  (e.g. https://www.qr-code-generator.com/) to produce a scannable QR.

Verify the app shows a 6-digit code that refreshes every 30 seconds.

### 4. Set environment variables in Vercel

Project Settings → Environment Variables:

| Variable                  | Value                                      | Environments |
|---------------------------|--------------------------------------------|--------------|
| `ADMIN_PASSWORD`          | (existing — your admin login password)     | All          |
| `ADMIN_TOTP_SECRET`       | (from step 1)                              | Production + Preview |
| `ADMIN_TOTP_RECOVERY_CODES` | (from step 1, comma-separated)           | Production + Preview |

**Important**: Set in both Production AND Preview if you use preview
deployments to test changes. Without setting in Preview, your preview
URL won't require 2FA but production will.

### 5. Test login

Visit `https://www.erdosdx.com/admin/login/`:

1. Enter password → should redirect to a 2FA page (not /admin/inquiries/).
2. Enter 6-digit code from your app → should redirect to /admin/inquiries/.

If you see "Invalid password" at step 1, your password env var is wrong.
If you see "Code incorrect" at step 2, your phone clock is more than 30s
out of sync (Authenticator apps usually self-correct).

### 6. Disaster recovery: locked out

If you lose your phone:

- Go to Vercel env → set `ADMIN_TOTP_SECRET` to empty string → save.
- Wait 1-2 minutes for env propagation.
- Login with password only. Then re-run setup with a new secret.

Or, use a recovery code (single-use):
- At the 2FA step, type one of the 8-char hex codes instead of a 6-digit
  code. Login succeeds. The server logs the consumption; you should remove
  the used code from the env list (just delete it from the comma-separated
  value in Vercel).

---

## Files changed by this feature

- `src/server/admin/totp.js` — RFC 6238 TOTP implementation (zero deps)
- `src/server/admin/admin-session.js` — added `signSessionStep1`,
  `verifySessionStep1`, `generateRecoveryCodes`, `isTotpEnabled`
- `src/pages/api/admin/auth.ts` — added `?action=verify-2fa` endpoint;
  password step now issues a step-1 ticket if TOTP is configured
- `src/pages/admin/login.astro` — switched from static prerender to SSR;
  added step-2 form for 6-digit / recovery code
- `scripts/generate-totp-secret.mjs` — one-time CLI for setup
- `.env.example` — documented `ADMIN_TOTP_SECRET` and `ADMIN_TOTP_RECOVERY_CODES`

## Security properties

- **No external deps**: TOTP implemented from RFC 6238 spec, ~150 LOC.
  Backward compatible.
- **Rate limited**: same 5/10min as password (verify-2fa endpoint shares
  the IP-based throttle).
- **Constant-time comparison**: `verifyTotp` uses XOR-then-OR instead of
  string compare (timingSafeEqualStr).
- **±30s clock skew window**: standard TOTP behavior.
- **Recovery codes are 32-bit hex (8 chars)**: 4 billion possibilities,
  but the code space is small enough that brute force is a concern —
  that's why we rate-limit.
- **Stateless session**: step-1 ticket is signed with HMAC; no DB lookup.
  Validates within 5 minutes, single-use (admin_step1 cookie cleared on
  step-2 success).

## When NOT to enable 2FA

- During local development where you don't want to type a code every time.
- During disaster recovery testing where you're validating the single-factor
  path still works.
- If you can't store the secret + recovery codes safely (a literal paper
  notebook is fine, but don't put them in an unencrypted file).
