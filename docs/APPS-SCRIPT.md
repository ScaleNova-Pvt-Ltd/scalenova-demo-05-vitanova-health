# Google Apps Script Broker Guide — VitaNova Health

## 1. Gateway Architecture
The Google Apps Script (`Code.gs`) functions as the central operational broker for:
- Payload validation & honeypot spam filtering
- Deterministic Submission ID generation
- Automatic worksheet creation & row appending
- Dual transactional email dispatch (Owner Alert + Branded Customer Confirmation)
- Frappe CRM REST API synchronization

## 2. Script Properties
Configure these in **Project Settings > Script Properties**:
| Property | Value Example | Description |
|---|---|---|
| `SPREADSHEET_ID` | `1A2b3C...xyz` | ID of `Demo Lead Captures — ScaleNova` |
| `OWNER_EMAIL` | `support@scalenovasys.com` | Notification inbox for sales alerts |
| `DEMO_EMAIL` | `demo@scalenovasys.com` | Sender identity for transactional emails |
| `FRAPPE_API_URL` | `https://demo.scalenovasys.com` | ScaleNova CRM demo instance |
| `FRAPPE_API_KEY` | `<key>` | Frappe Administrator API key |
| `FRAPPE_API_SECRET` | `<secret>` | Frappe Administrator API secret |
