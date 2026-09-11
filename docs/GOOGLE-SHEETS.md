# Google Sheets Master Architecture & Blueprint Guide
## Workbook: ScaleNova_Demo_Lead_Captures_Master.xlsx
**Standard**: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## 1. Central Demonstration Spreadsheet

All five ScaleNova demonstration websites log into **ONE central Google Spreadsheet**:
- **Spreadsheet Title**: `Demo Lead Captures — ScaleNova`
- **Master Excel Template**: `ScaleNova_Demo_Lead_Captures_Master.xlsx`

The workbook contains exactly **seven (7) worksheets**:
1. `Demo 1 - Professional` (Nexora Advisory)
2. `Demo 2 - Manufacturing` (ForgeCore Industries)
3. `Demo 3 - Real Estate` (Aurelia Estates)
4. `Demo 4 - Education` (Bloombridge Academy)
5. `Demo 5 - Healthcare` (VitaNova Health)
6. `System Log` (Centralized technical troubleshooting ledger)
7. `Configuration Reference` (Documented Script Properties specifications)

---

## 2. Standard 28-Column Demo Schema

Every demo worksheet enforces the identical 28-column relational schema:

| Col # | Column Header | Data Type | Validation & Constraints | Purpose |
|:---:|---|---|---|---|
| **1** | `Submission ID` | String | Format: `SN-D0X-YYYYMMDD-XXXX` | Primary relational key for cross-system tracking |
| **2** | `Created At` | ISO-8601 | `YYYY-MM-DDTHH:MM:SSZ` (UTC) | Lead arrival timestamp for SLA measurement |
| **3** | `Demo ID` | String | `DEMO-01` to `DEMO-05` | Identity routing key |
| **4** | `Industry` | String | Industry classification | Reporting and multi-tenant categorization |
| **5** | `Client Name` | String | Full commercial client name | Account ownership |
| **6** | `Lead Type` | String | `LEAD`, `BOOKING`, `CONSULTATION`, `QUOTE_REQUEST`, `APPOINTMENT` | Intent classification |
| **7** | `Name` | String | Min 2 characters | Customer contact name |
| **8** | `Email` | String | RFC 5322 regex compliant | Communication and confirmation dispatch |
| **9** | `Phone` | String | E.164 normalized (+91 prefix) | WhatsApp bridge and sales call dispatch |
| **10** | `Company` | String | Legal or trading entity name | CRM Organization mapping |
| **11** | `Service` | String | Selected service offering | Department routing |
| **12** | `Requirement` | String | Specific scope of need | Technical qualification |
| **13** | `Project Type` | String | Project classification category | Scoping taxonomy |
| **14** | `Budget` | String | Currency or range string | Commercial tiering |
| **15** | `Preferred Date` | Date | `YYYY-MM-DD` | Consultation/appointment date slot |
| **16** | `Preferred Time` | Time | `HH:MM AM/PM` | Consultation/appointment time slot |
| **17** | `Message` | Text | Sanitized user inquiry text | Operational context for sales engineering |
| **18** | `Source` | String | Origin identifier (e.g. Website) | Channel attribution |
| **19** | `Source Page` | String | Page slug (e.g. `/book-consultation.html`) | Micro-conversion tracking |
| **20** | `User Agent` | String | Browser client header | Technical telemetry |
| **21** | `IP / Request Reference` | String | Anonymized request token | Abuse prevention |
| **22** | `Status` | String | `Open`, `Under Review`, `Confirmed`, `Qualified` | Operational stage |
| **23** | `Owner` | String | Default: `ScaleNova Partner` | Sales representative assignment |
| **24** | `Email Status` | String | `BOTH_SENT`, `OWNER_SENT`, `CUSTOMER_SENT`, `FAILED` | Email delivery audit |
| **25** | `Frappe Status` | String | `SUCCESS`, `PENDING_CONFIG`, `FAILED` | CRM synchronization audit |
| **26** | `Frappe Lead ID` | String | e.g. `LEAD-2026-00412` | Upstream CRM document reference |
| **27** | `Last Contacted` | Date/Time | Empty upon creation | Sales follow-up timestamp |
| **28** | `Notes` | Text | Automated operational intake notes | Internal metadata |

---

## 3. System Log Worksheet (12 Columns)

Technical logging ledger used exclusively for operational health monitoring:

1. `Log ID`: Deterministic identifier (`LOG-YYYYMMDD-HHMMSS-XXX`)
2. `Timestamp`: ISO-8601 UTC timestamp
3. `Demo ID`: `DEMO-01` to `DEMO-05` or `GATEWAY`
4. `Submission ID`: Associated lead ID or `N/A`
5. `Event Type`: `LEAD_INGESTION`, `FRAPPE_SYNC`, `RETRY_SUCCESS`, `VALIDATION_FAILED`
6. `Status`: `SUCCESS`, `WARN`, `FAILED`, `INFO`
7. `Message`: Plain human-readable event description
8. `Frappe Status`: Status of upstream CRM interaction
9. `Email Status`: Status of transactional email dispatch
10. `Error Code`: Normalized error token (`NONE`, `INVALID_JSON`, `FRAPPE_HTTP_504`)
11. `Error Details`: Technical stack trace or HTTP response text
12. `Retry Count`: Incremental retry execution counter

---

## 4. Configuration Reference Worksheet

Documented Script Properties specifications:

| Property | Purpose | Required | Example / Format | Where Configured |
|---|---|:---:|---|---|
| `SPREADSHEET_ID` | Target Google Spreadsheet ID (`Demo Lead Captures — ScaleNova`) | **YES** | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` | Apps Script Script Properties |
| `OWNER_EMAIL` | Primary ScaleNova notification inbox for internal hot lead alerts | **YES** | `support@scalenovasys.com` | Apps Script Script Properties |
| `DEMO_EMAIL` | Sender identity / reply-to for automated transactional confirmation emails | **YES** | `demo@scalenovasys.com` | Apps Script Script Properties |
| `FRAPPE_API_URL` | ScaleNova CRM / ERPNext base demonstration URL | **YES** | `https://demo.scalenovasys.com` | Apps Script Script Properties |
| `FRAPPE_API_KEY` | Frappe Administrator / System User API Key | **YES** | `9a8b7c6d5e4f3a2` (Placeholder) | Apps Script Script Properties |
| `FRAPPE_API_SECRET` | Frappe Administrator / System User API Secret | **YES** | `1a2b3c4d5e6f7a8` (Placeholder) | Apps Script Script Properties |
| `ENVIRONMENT` | Deployment environment descriptor (`production` / `staging` / `demo`) | **NO** | `production` | Apps Script Script Properties |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins or `*` for global intake | **NO** | `https://scalenovasys.com,https://demo1.scalenovasys.com` | Apps Script Script Properties |
| `NOTIFICATION_MODE` | Notification dispatch mode (`ALL`, `OWNER_ONLY`, `CUSTOMER_ONLY`, `SILENT`) | **NO** | `ALL` | Apps Script Script Properties |
