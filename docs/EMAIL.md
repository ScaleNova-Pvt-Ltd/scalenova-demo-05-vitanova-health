# Transactional Email Notification Specification — VitaNova Health

## 1. Sender Identity
- **Configured Sender**: `demo@scalenovasys.com`
- **Authorized Transport**: Google Apps Script MailApp / GmailApp via authorized account

## 2. Dual Notification Paths
### A. Internal Hot Lead Alert (ScaleNova Team)
- **Subject**: `NEW LEAD ALERT: [VitaNova Health] {Service} — Ref #{SubmissionID}`
- **Latency**: Dispatched within 60 seconds
- **Features**: Full 23-column data breakdown, direct WhatsApp click-to-chat link.

### B. Branded Customer Confirmation (VitaNova Health)
- **Subject**: `Thank You for Contacting VitaNova Health — Ref #{SubmissionID}`
- **Features**: Branded header in `#0A2540`, professional greeting, next steps, link to `https://demo5.scalenovasys.com`.
