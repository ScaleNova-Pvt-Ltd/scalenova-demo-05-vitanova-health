# Master Google Apps Script Configuration Reference

This guide details how to configure the single unified Google Apps Script Web App for all five ScaleNova industry client demonstrations.

---

## 1. Single Spreadsheet Setup

1. Create a Google Spreadsheet titled: **`ScaleNova — Five Industry Demo CRM`**
2. Copy the Spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`).
3. Note: You do **not** need to manually add sheets or columns. The script automatically initializes:
   - `Demo1_Professional`
   - `Demo2_Manufacturing`
   - `Demo3_RealEstate`
   - `Demo4_Education`
   - `Demo5_Healthcare`
   - `System_Log`

---

## 2. Script Properties Setup

In Google Apps Script (**Extensions > Apps Script > Project Settings > Script Properties**), add the following keys:

| Property Key | Description / Example | Confidentiality |
| :--- | :--- | :--- |
| `SPREADSHEET_ID` | `1a2b3c4d5e6f7g8h9i0j_EXAMPLE_SHEET_ID` | Internal ID |
| `OWNER_EMAIL` | `operations@scalenovasys.com` | Internal Notification |
| `NOTIFICATION_EMAIL` | `crm-admin@scalenovasys.com` | Oversight Email |
| `FRAPPE_API_URL` | `https://demo.scalenovasys.com` | Host URL |
| `FRAPPE_API_KEY` | `your_frappe_api_key` | **STRICT SECRET** |
| `FRAPPE_API_SECRET` | `your_frappe_api_secret` | **STRICT SECRET** |
| `ENABLE_CLIENT_CONFIRMATION` | `true` | Boolean Setting |

---

## 3. Web App Deployment

1. Click **Deploy > New deployment**.
2. Select type: **Web app**.
3. Set **Execute as**: `Me`.
4. Set **Who has access**: `Anyone`.
5. Deploy and copy the Web App URL (`https://script.google.com/macros/s/AKfycbx.../exec`).
6. Paste this single URL into each repository's frontend config (`src/config/index.js` or `.env`).
