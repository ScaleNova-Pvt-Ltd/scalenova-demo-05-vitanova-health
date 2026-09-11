# Google Apps Script Deployment & Broker Guide
## File: Code.gs (Master Unified Webhook Gateway)
**Standard**: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## 1. Single Code.gs Architecture

ScaleNova strictly forbids creating multiple fragmented Apps Script files. **ONE single `Code.gs`** powers the entire 5-client demonstration suite.

### 17 Modular Sections in `Code.gs`:
1. `CONFIGURATION`: Accesses Script Properties securely via `PropertiesService`.
2. `DEMO CONFIGURATION`: Central dictionary (`DEMO_REGISTRY`) of all 5 client definitions, sheet tabs, colors, and domains.
3. `HTTP ENTRYPOINTS`: `doPost(e)` for incoming JSON leads and `doGet(e)` for health checks.
4. `REQUEST VALIDATION`: Enforces mandatory fields, regex checks, and valid `demo_id`.
5. `LEAD NORMALIZATION`: Extracts, sanitizes, and maps inputs to the 28 standard columns.
6. `SUBMISSION ID GENERATION`: Generates unique deterministic IDs (`SN-D0X-YYYYMMDD-XXXX`).
7. `SHEET ROUTING`: Selects target tab based on `demo_id`.
8. `GOOGLE SHEET FUNCTIONS`: Appends row, auto-provisions headers, and updates Frappe status.
9. `EMAIL ENGINE`: Coordinates dual notifications based on `NOTIFICATION_MODE`.
10. `EMAIL TEMPLATES`: Generates 5 brand-specific HTML customer confirmation receipts.
11. `FRAPPE API DISPATCHER`: Forwards leads to Frappe CRM REST API (`/api/resource/Lead`).
12. `FRAPPE FIELD MAPPING`: Maps 28 lead fields to Frappe CRM DocType fields.
13. `SYSTEM LOGGING`: Writes audit events to the `System Log` sheet.
14. `ERROR HANDLING`: Catches and logs errors safely without exposing secrets.
15. `DUPLICATE PROTECTION`: Suppresses identical duplicate submissions for 60 seconds.
16. `RETRY FUNCTIONS`: `retryFailedFrappeLeads()` scans and retries failed records.
17. `UTILITY FUNCTIONS`: Helper routines for JSON responses and phone sanitization.

---

## 2. Step-by-Step Deployment Procedure (In Your Personal Google Account)

### Step 1: Create the Master Google Spreadsheet
1. Go to [Google Drive](https://drive.google.com/).
2. Click **New > File upload** and upload `ScaleNova_Demo_Lead_Captures_Master.xlsx`.
3. Open the uploaded file and click **File > Save as Google Sheets**.
4. Rename the spreadsheet to:
   `Demo Lead Captures — ScaleNova`
5. Copy the Spreadsheet ID from the browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`

### Step 2: Open Google Apps Script
1. Inside the Google Spreadsheet, click **Extensions > Apps Script**.
2. Rename the project from "Untitled project" to:
   `ScaleNova Demo Lead Capture Broker`
3. Delete any default code in `Code.gs`.
4. Copy the entire contents of [Code.gs](../Code.gs) and paste it into the editor.
5. Click **Save** (disk icon).

### Step 3: Configure Script Properties (Zero Hardcoded Secrets)
1. In the Apps Script left navigation bar, click the **Project Settings (Gear icon)**.
2. Scroll to the **Script Properties** section at the bottom.
3. Click **Add script property** for each of the following keys:

| Property Key | Value | Description |
|---|---|---|
| `SPREADSHEET_ID` | `<YOUR_SPREADSHEET_ID>` | Extracted from Step 1 |
| `OWNER_EMAIL` | `support@scalenovasys.com` | Notification inbox for sales alerts |
| `DEMO_EMAIL` | `demo@scalenovasys.com` | Sender identity for transactional emails |
| `FRAPPE_API_URL` | `https://demo.scalenovasys.com` | ScaleNova CRM demo instance URL |
| `FRAPPE_API_KEY` | `<YOUR_FRAPPE_API_KEY>` | Frappe Administrator / System User API Key |
| `FRAPPE_API_SECRET` | `<YOUR_FRAPPE_API_SECRET>` | Frappe Administrator / System User API Secret |
| `ENVIRONMENT` | `production` | Environment tag |
| `NOTIFICATION_MODE` | `ALL` | Sends both internal alert and customer receipt |

4. Click **Save script properties**.

### Step 4: Deploy as Web App
1. At the top right of the Apps Script editor, click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment configuration:
   - **Description**: `ScaleNova Master Multi-Tenant Gateway v1.0`
   - **Execute as**: `Me (<your-email>@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: Allows the website forms to POST leads without Google login)*
4. Click **Deploy**.
5. Google will prompt: "Authorization required".
   - Click **Authorize access**.
   - Select your Google account.
   - Click **Advanced > Go to ScaleNova Demo Lead Capture Broker (unsafe)**.
   - Click **Allow**.
6. Copy the generated **Web App URL**:
   `https://script.google.com/macros/s/AKfycbx.../exec`

### Step 5: Connect All Five Websites
Inject the generated Web App URL into each website repository's configuration:
- In `src/config/index.js` or via Cloudflare environment variable `APPS_SCRIPT_WEBHOOK_URL`.
- **Note**: The exact same URL is shared by all five websites! Routing happens automatically via `demo_id`.
