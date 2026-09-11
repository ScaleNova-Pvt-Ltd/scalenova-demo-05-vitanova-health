# Master Troubleshooting & Incident Diagnostic Trees — VitaNova Health

Based on the **ScaleNova Client Production Architecture & Operations Manual v1.0**:

### 1. Form Fails to Submit (Infinite Spinner)
- Check browser console (F12) for CORS or network errors.
- Verify `APPS_SCRIPT_WEBHOOK_URL` is correctly deployed as Web App with "Who has access: Anyone".

### 2. Sheet Row Not Appending
- Verify `SPREADSHEET_ID` in Script Properties.
- Check Apps Script Executions log for quota or permission errors.

### 3. Frappe Status Shows FAILED
- Verify `FRAPPE_API_KEY` and `FRAPPE_API_SECRET` in Script Properties.
- Ensure the user account on `https://demo.scalenovasys.com` has read/write permissions on the `Lead` DocType.
