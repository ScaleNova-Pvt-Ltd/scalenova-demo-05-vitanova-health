# Security Architecture & Zero-Trust Guidelines — VitaNova Health

## 1. Zero-Credential Commits
- **Frontend Code**: Contains ZERO private API secrets, database passwords, or Google Sheet IDs.
- **Git Repositories**: Strictly zero private keys. All configurations are read from Script Properties or Cloudflare environment variables.

## 2. Client-Side Spam & Bot Mitigation
- Invisible honeypot field (`website_hp`, `booking_hp`, `website_trap`)
- Cryptographic timestamp validation
- Input sanitization against XSS
- Inline regex validation for email and phone numbers (+91)
