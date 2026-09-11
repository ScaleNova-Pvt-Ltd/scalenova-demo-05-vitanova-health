# Frappe CRM REST API Integration & Data Flow
## Endpoint: https://demo.scalenovasys.com/api/resource/Lead
**Standard**: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## 1. Enterprise Operating Principle

ScaleNova connects customer-facing digital web presence to the internal business operating system powered by **Frappe CRM / ERPNext**.

### Core Flow:
```
Website Form / Booking
         │
         ▼
Google Apps Script (Code.gs)
         │
         ├─────────────────────────────────────────┐
         ▼                                         ▼
[Google Sheets Intake]                   [Frappe REST API Push]
Column 25: Frappe Status                 POST /api/resource/Lead
Column 26: Frappe Lead ID                Header: token KEY:SECRET
```

---

## 2. Field Mapping Dictionary

| Website Field | Google Sheet (Col #) | Frappe DocType (`Lead`) Field | Field Type | Example / Format |
|---|:---:|---|---|---|
| `name` | Col 7 | `lead_name` | Data | `Rajesh Sharma` |
| `email` | Col 8 | `email_id` | Data | `rajesh.sharma@tavros.in` |
| `phone` | Col 9 | `mobile_no` | Data | `+91 98201 12345` |
| `company` | Col 10 | `company_name` | Data | `Tavros Technologies Pvt Ltd` |
| `industry` | Col 4 | `industry` | Select | `Professional & B2B Services` |
| `source` | Col 18 | `source` | Select | `ScaleNova Demo — Professional & B2B Services` |
| `demoId` | Col 3 | `custom_demo_id` | Data | `DEMO-01` |
| `submissionId` | Col 1 | `custom_submission_id` | Data | `SN-D01-20260911-1001` |
| `status` | Col 22 | `status` | Select | `Lead` |
| `message` & scope | Col 17 | `notes` | Text | Full formatted operational brief |

---

## 3. Data Reliability & Fail-Safe Architecture

A critical tenet of ScaleNova engineering:
> **Google Sheets is the permanent operational capture buffer.**  
> **A temporary Frappe CRM outage or network timeout must NEVER cause data loss.**

1. **Capture Gate**: Lead is committed to Google Sheet first.
2. **Asynchronous Push**: Apps Script attempts authenticated REST POST to Frappe.
3. **If Frappe Succeeds**:
   - `Frappe Status` updated to `SUCCESS` in Column 25.
   - Generated Frappe Lead ID (e.g. `LEAD-2026-00412`) stored in Column 26.
4. **If Frappe Fails (e.g. 504 Gateway Timeout / 401 Unauthorized)**:
   - `Frappe Status` updated to `FAILED` in Column 25.
   - Error code and details appended to `System Log`.
   - The lead remains safely preserved in Google Sheets.
   - Customer receives normal confirmation without seeing technical error messages.
5. **Recovery Routine**: `retryFailedFrappeLeads()` scans the spreadsheet for failed records and retries insertion once upstream service recovers.

---

## 4. Automated Retry Function: `retryFailedFrappeLeads()`

`Code.gs` contains an automated reconciliation function:
```javascript
function retryFailedFrappeLeads() {
  // Scans all 5 demo tabs for Frappe Status = 'FAILED'
  // Re-attempts HTTP POST to Frappe REST API
  // Updates Frappe Status to 'SUCCESS' and logs Frappe Lead ID
  // Logs result to System Log
}
```

### Scheduling Automated Retries:
In Google Apps Script:
1. Click **Triggers (Clock icon)** in the left sidebar.
2. Click **Add Trigger**.
3. Function: `retryFailedFrappeLeads`.
4. Event source: `Time-driven` > `Hour timer` > `Every 1 hour`.
5. Save. This provides autonomous 24/7 self-healing reconciliation.
