# Google Apps Script Deployment & Script Properties Configuration

## 1. Create the Master Google Spreadsheet
1. Open Google Sheets and create a new spreadsheet named:
   `Demo Lead Captures — ScaleNova`
2. Create five worksheets (tabs) named exactly:
   - `Demo 1 - Professional`
   - `Demo 2 - Manufacturing`
   - `Demo 3 - Real Estate`
   - `Demo 4 - Education`
   - `Demo 5 - Healthcare`
   - `System Log`
3. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

## 2. Deploy Google Apps Script
1. Inside the Google Spreadsheet, click **Extensions > Apps Script**.
2. Replace all existing code in `Code.gs` with the content of [Code.gs](./Code.gs).
3. Click **Project Settings (Gear icon) > Script Properties** and add:
   - `SPREADSHEET_ID`: `<your-spreadsheet-id>`
   - `OWNER_EMAIL`: `support@scalenovasys.com`
   - `DEMO_EMAIL`: `demo@scalenovasys.com`
   - `FRAPPE_API_URL`: `https://demo.scalenovasys.com`
   - `FRAPPE_API_KEY`: `<your-frappe-api-key>`
   - `FRAPPE_API_SECRET`: `<your-frappe-api-secret>`
   - `ENVIRONMENT`: `production`
4. Click **Deploy > New Deployment**:
   - **Type**: Web App
   - **Description**: ScaleNova Unified Demo Gateway v1.0
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Copy the generated Web App URL:
   `https://script.google.com/macros/s/.../exec`
6. Update the frontend environment variable `APPS_SCRIPT_WEBHOOK_URL` in your Cloudflare deployment settings.
