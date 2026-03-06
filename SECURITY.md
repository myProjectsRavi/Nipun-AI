# 🛡️ Security Model — Nipun AI

## Overview

Nipun AI follows a **Zero-Trust, Zero-Knowledge, BYOK (Bring Your Own Keys)** security architecture. No user data is ever stored on any server. The entire system is designed so that even if the source code is fully public, user keys and analysis data remain protected.

---

## Encryption Architecture

### API Key Storage (Client-Side)

| Property | Value |
|---|---|
| **Algorithm** | AES-256-GCM |
| **Key Derivation** | PBKDF2 with SHA-256 |
| **Iterations** | 100,000 (OWASP recommended minimum) |
| **Salt** | 16 bytes, cryptographically random (`crypto.getRandomValues`) |
| **IV** | 12 bytes, cryptographically random per encryption |
| **Implementation** | Web Crypto API (browser-native, zero dependencies) |

**How it works:**
1. User enters API keys + a master passphrase in the browser
2. A random 16-byte salt is generated
3. PBKDF2 derives a 256-bit key from the passphrase + salt
4. API keys are encrypted with AES-256-GCM using a random 12-byte IV
5. Salt + IV + ciphertext are stored in `localStorage` as base64
6. The master passphrase is **never stored** — only the user knows it

### Key Transmission (Browser → Worker)

| Property | Value |
|---|---|
| **Transport** | HTTPS (TLS 1.3 via Cloudflare) |
| **Header** | `X-Nipun-Keys` |
| **Encoding** | Base64 (JSON stringified) |
| **Persistence** | None — keys exist only in Worker memory during request processing |

**Why headers instead of body?**
- Request bodies can be logged by proxies, CDNs, and middleware
- Cloudflare Workers do not log request headers by default
- Headers are excluded from most access log configurations
- The `X-Nipun-Keys` header is stripped after processing

### Cache Encryption (Client-Side)

Analysis results cached in `localStorage` are encrypted with AES-256-GCM using a static application-level passphrase. This provides:
- **XSS protection**: Browser extensions and injected scripts cannot trivially read cached analysis data
- **Obfuscation**: Cached data is not human-readable in browser DevTools

> **Note:** The cache encryption key is embedded in the JavaScript bundle. This is intentional — the cache contains analysis results (not secrets). The real sensitive data (API keys) uses user-provided passphrases.

---

## Server-Side Security

### Rate Limiting

- **Method**: In-memory per-IP tracking using `CF-Connecting-IP` header
- **Limit**: 30 requests per hour per IP address
- **Response**: HTTP 429 with descriptive error message

### Input Validation

- **Ticker format**: Regex `^[A-Z0-9.]{1,10}$` — prevents injection attacks
- **Case normalization**: `toUpperCase().trim()` applied before any processing
- **JSON parsing**: Explicit try/catch with user-friendly 400 error for malformed bodies

### Response Security Headers

Every response from the Worker includes:

```
X-Content-Type-Options: nosniff          # Prevents MIME sniffing
X-Frame-Options: DENY                    # Prevents clickjacking
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
Access-Control-Max-Age: 86400            # CORS preflight cache (24h)
```

### CORS Policy

- Explicit allowlist via `ALLOWED_ORIGINS` environment variable
- Dynamic wildcard support for preview deployments when self-hosted
- `X-Nipun-Keys` is explicitly listed in `Access-Control-Allow-Headers`

---

## What We Do NOT Store

| Data | Stored Server-Side? | Stored Client-Side? |
|---|---|---|
| API keys | ❌ Never | ✅ Encrypted (AES-256-GCM) |
| Master passphrase | ❌ Never | ❌ Never |
| Analysis results | ❌ Never | ✅ Encrypted cache (4h TTL) |
| User identity | ❌ Never | ❌ Never |
| IP addresses | ❌ In-memory only (rate limiting) | ❌ Never |
| Usage analytics | ❌ Never | ❌ Never |

---

## Threat Model

| Threat | Mitigation |
|---|---|
| **Man-in-the-middle** | TLS 1.3 (Cloudflare enforced) |
| **XSS reading localStorage** | AES-256-GCM encryption on keys and cache |
| **Brute-force passphrase** | PBKDF2 with 100K iterations makes each attempt ~100ms |
| **Server-side key theft** | Keys never persisted — only in Worker isolate memory |
| **CORS bypass** | Strict origin allowlist + wildcard regex |
| **Injection via ticker** | Regex validation `^[A-Z0-9.]{1,10}$` |
| **DDoS / abuse** | Rate limiting (30 req/hr per IP) + Cloudflare DDoS protection |
| **Clickjacking** | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue with vulnerability details
2. Open a [GitHub Issue](https://github.com/myProjectsRavi/Nipun-AI/issues/new) with the title `[SECURITY]` and a brief, non-exploitable description
3. Include: description, steps to reproduce, and potential impact
4. Confirmed vulnerabilities will be credited in the fix

---

## Dependencies

Nipun AI has **zero server-side dependencies** for cryptographic operations. All encryption uses the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), which is:
- Built into every modern browser
- Implemented in native code (not JavaScript)
- FIPS 140-2 compliant in most implementations
- Available in Cloudflare Workers runtime
