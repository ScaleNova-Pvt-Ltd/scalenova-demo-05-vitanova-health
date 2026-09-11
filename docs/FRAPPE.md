# Frappe CRM Integration Specification — VitaNova Health

## 1. Operating Principle
ScaleNova connects public client frontends to the business operating system.
When a lead is submitted on `VitaNova Health`:
1. Ingested via Apps Script
2. Stored in Google Sheet (`Demo 5 - Healthcare`)
3. Dispatched to Frappe CRM endpoint: `https://demo.scalenovasys.com/api/resource/Lead`

## 2. Idempotency & Fail-Safe Architecture
If the Frappe demo site is temporarily down or credentials are unconfigured:
- The lead is **never lost**.
- Google Sheets permanently retains the record with `Frappe Status = FAILED`.
- Customer receives an immediate confirmation without seeing technical failure messages.
