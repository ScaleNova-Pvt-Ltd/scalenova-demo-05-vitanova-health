# Transactional Email System Specification
## Dual Notification Pipeline & 5 Brand Identities
**Standard**: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## 1. Operating Architecture

ScaleNova eliminates lead response latency by triggering two separate automated notification paths for every verified submission:

```
Lead Ingested
     │
     ├──────────────────────────┐
     ▼                          ▼
[Internal Hot Lead Alert]   [Branded Customer Confirmation]
To: support@scalenovasys.com To: prospect@email.com
From: demo@scalenovasys.com  From: demo@scalenovasys.com
Latency: < 60 seconds        Latency: < 60 seconds
WhatsApp Link Included       Custom Brand Colors & Next Steps
```

---

## 2. Notification Path A: Internal Hot Lead Alert (Sales & Operations)

- **Target Recipient**: Configured via `OWNER_EMAIL` (`support@scalenovasys.com`).
- **Sender**: Configured via `DEMO_EMAIL` (`demo@scalenovasys.com`).
- **Subject Format**:
  `New Lead — [Demo ID] — [Client Name] — #[Submission ID]`
  *Example*: `New Lead — DEMO-03 — Aurelia Estates — #SN-D03-20260911-3001`
- **Content Breakdown**:
  - Lead reference, timestamp, prospect name, verified email, formatted phone.
  - Direct WhatsApp click-to-chat hyperlink (`https://wa.me/91XXXXXXXXXX`).
  - Company name, selected service, requirement scope, preferred date & time.
  - Budget range, source page slug, and full client message.
  - Immediate SLA notice: *High-intent inquiries convert 391% better when contacted within 30 minutes*.

---

## 3. Notification Path B: Branded Customer Confirmation Receipt

Every prospect receives a professional HTML confirmation branded specifically to the demo business they contacted:

### Visual Brand Matrix:
| Demo ID | Client Name | Primary Color | Secondary Accent | Subject Line Example |
|---|---|---|---|---|
| **`DEMO-01`** | **Nexora Advisory** | Deep Navy (`#0B132B`) | Cyan (`#00B4D8`) | `Thank you for contacting Nexora Advisory — #SN-D01-20260911-1001` |
| **`DEMO-02`** | **ForgeCore Industries** | Industrial Graphite (`#121214`) | Forged Amber (`#F59E0B`) | `Thank you for contacting ForgeCore Industries — #SN-D02-20260911-2001` |
| **`DEMO-03`** | **Aurelia Estates** | Charcoal Gold (`#1E1C1A`) | Champagne Gold (`#C5A880`) | `Thank you for contacting Aurelia Estates — #SN-D03-20260911-3001` |
| **`DEMO-04`** | **Bloombridge Academy** | Royal Violet (`#2D1B69`) | Wisteria Lavender (`#7C3AED`) | `Thank you for contacting Bloombridge Academy — #SN-D04-20260911-4001` |
| **`DEMO-05`** | **VitaNova Health** | Marine Navy (`#0A2540`) | Clinical Teal (`#0D9488`) | `Thank you for contacting VitaNova Health — #SN-D05-20260911-5001` |

### Customer Receipt Design Guardrails:
- **Zero Exposure of Internal Systems**: Customer emails NEVER mention Frappe, Google Sheets, internal Demo IDs, or technical status codes.
- **Appointment Callout Block**: If the lead includes a date and time slot, an accent-bordered appointment reservation block is rendered prominently.
- **Transparent Next Steps**: Clear explanation of response timeline (typically within 24 business hours).
- **Direct Domain Link**: Direct link to the client's official portal (e.g. `https://demo3.scalenovasys.com`).

---

## 4. Email Status Tracking

Every row in the Google Sheet updates Column 24 (`Email Status`):
- `PENDING`: Initial state during ingestion.
- `BOTH_SENT`: Both internal alert and customer receipt successfully dispatched.
- `OWNER_SENT`: Internal alert dispatched, customer receipt disabled or failed.
- `CUSTOMER_SENT`: Customer receipt dispatched, owner alert failed.
- `FAILED`: Mail service quota exceeded or invalid email address.
- `SILENT_BYPASSED`: Notification mode set to `SILENT`.
