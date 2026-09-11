# Master Incident Troubleshooting & Diagnostic Decision Trees
## Standard: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## Diagnostic Tree 01: Form Submission Fails (Infinite Loading Spinner)
**Observed Symptom**: User clicks submit button; spinner spins indefinitely; no confirmation appears.

### Step 1: Browser Console Triage
1. Open Chrome DevTools (F12) > **Network** tab.
2. Inspect the outgoing POST request to the Apps Script URL:
   - If HTTP Status is `CORS error` or `Failed to fetch`: The Web App was deployed with restricted access.
   - **Resolution**: In Apps Script, click **Deploy > Manage deployments > Edit**. Ensure **Who has access** is set to **"Anyone"** (NOT "Only myself" or "Anyone with Google Account").

### Step 2: Apps Script Execution Log Triage
1. Open Google Apps Script editor > **Executions** tab on the left sidebar.
2. Inspect recent execution with status `Failed`:
   - If error is `Cannot read property 'contents' of undefined`: Payload format was invalid.
   - If error is `Limit Exceeded: Email recipients per day`: Google daily email quota reached (100 for personal Gmail, 1,500 for Google Workspace).
   - **Resolution**: Set `NOTIFICATION_MODE` to `SILENT` or upgrade to Google Workspace.

---

## Diagnostic Tree 02: Lead Appends to Google Sheet but Frappe CRM Status is FAILED
**Observed Symptom**: Lead row appears in spreadsheet with Column 25 `Frappe Status = FAILED`.

### Step 1: Inspect System Log Tab
1. Open the `System Log` worksheet in the Google Spreadsheet.
2. Locate the row with matching `Submission ID`:
   - `Error Code: FRAPPE_HTTP_401`: Frappe API key or secret is invalid or expired.
   - `Error Code: FRAPPE_HTTP_403`: User associated with API key lacks `Create` permission on `Lead` DocType.
   - `Error Code: FRAPPE_HTTP_504`: Upstream ERP container timed out under heavy load.

### Step 2: Resolution & Autonomous Recovery
1. In Apps Script **Project Settings > Script Properties**, verify `FRAPPE_API_KEY` and `FRAPPE_API_SECRET`.
2. Ensure `FRAPPE_API_URL` is `https://demo.scalenovasys.com` without trailing slash.
3. Run the automated reconciliation function:
   - In Apps Script editor, select function `retryFailedFrappeLeads` from the dropdown and click **Run**.
   - All failed rows will be re-synchronized to Frappe CRM and updated to `SUCCESS`.

---

## Diagnostic Tree 03: Lead Appends to Wrong Worksheet Tab
**Observed Symptom**: A lead from Nexora Advisory appears in `Demo 2 - Manufacturing` instead of `Demo 1 - Professional`.

### Step 1: Payload Inspection
1. Inspect the frontend `demo_id` parameter sent by the website.
2. Verify the website's `src/config/index.js` file:
   - Demo 1 must specify `demoId: 'DEMO-01'`
   - Demo 2 must specify `demoId: 'DEMO-02'`
   - Demo 3 must specify `demoId: 'DEMO-03'`
   - Demo 4 must specify `demoId: 'DEMO-04'`
   - Demo 5 must specify `demoId: 'DEMO-05'`

---

## Diagnostic Tree 04: Email Delivery Delays or Missing Emails
**Observed Symptom**: Lead appears in spreadsheet, but customer or sales email is delayed or not received.

### Step 1: Spam & Quarantine Check
1. Check Gmail **Spam**, **Junk**, and **Promotions** tabs.
2. Verify SPF/DKIM authentication for `demo@scalenovasys.com` if using a custom Google Workspace domain.

### Step 2: Script Authorization Check
1. In Apps Script editor, click **Run > doGet**.
2. If prompted, grant full authorization to send email via MailApp.
