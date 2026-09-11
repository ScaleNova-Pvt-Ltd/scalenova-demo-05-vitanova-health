# Master Verification & Testing Matrix
## Standard: ScaleNova Client Production Architecture & Operations Manual v1.0

---

## 1. 10-Point Integration Testing Matrix

Every deployment of the master lead-capture engine must pass all ten (10) scenario simulations:

| Test ID | Scenario | Demo ID | Payload Lead Type | Verification Criteria | Expected Outcome |
|:---:|---|:---:|---|---|---|
| **TEST-01** | B2B Consultation | `DEMO-01` | `CONSULTATION` | Row in `Demo 1 - Professional`; date & time parsed | `SN-D01-` ID, dual emails dispatched |
| **TEST-02** | Corporate Inquiry | `DEMO-01` | `LEAD` | Row in `Demo 1 - Professional`; company mapped | Status `Open`, synced to Frappe |
| **TEST-03** | Precision RFQ | `DEMO-02` | `QUOTE_REQUEST` | Row in `Demo 2 - Manufacturing`; budget stored | `SN-D02-` ID, amber alert email |
| **TEST-04** | Engineering Contact | `DEMO-02` | `CONTACT` | Row in `Demo 2 - Manufacturing`; message stored | Status `Open`, technical scope captured |
| **TEST-05** | Luxury Site Visit | `DEMO-03` | `BOOKING` | Row in `Demo 3 - Real Estate`; slot preserved | `SN-D03-` ID, champagne receipt email |
| **TEST-06** | Property Brochure | `DEMO-03` | `BROCHURE_REQUEST` | Row in `Demo 3 - Real Estate`; high-net-worth scope | Status `Open`, brochure link sent |
| **TEST-07** | Academic Counselling | `DEMO-04` | `COUNSELLING` | Row in `Demo 4 - Education`; course interest mapped | `SN-D04-` ID, violet receipt email |
| **TEST-08** | Corporate Training | `DEMO-04` | `LEAD` | Row in `Demo 4 - Education`; team cohort size parsed | Status `Open`, enterprise B2B track |
| **TEST-09** | Clinical Appointment | `DEMO-05` | `APPOINTMENT` | Row in `Demo 5 - Healthcare`; specialist noted | `SN-D05-` ID, teal receipt email |
| **TEST-10** | Clinical Diagnostics | `DEMO-05` | `CONTACT` | Row in `Demo 5 - Healthcare`; scan referral logged | Status `Open`, patient privacy respected |

---

## 2. Failure & Resilience Testing Suite

| Failure Scenario | Test Protocol | Expected System Behavior | Verified |
|---|---|---|:---:|
| **Invalid Demo ID** | Submit payload with `demo_id: "DEMO-99"` | Rejected with HTTP 422; logged in `System Log` | **PASS** |
| **Missing Mandatory Fields** | Submit payload with missing `name` or `email` | Rejected with HTTP 422; zero dirty rows in sheet | **PASS** |
| **Spam Honeypot Trip** | Submit payload with `website_hp: "spam-bot"` | Silently dropped; returns HTTP 200 without writing | **PASS** |
| **Duplicate Submission** | Rapidly submit identical email twice in <10s | Duplicate suppressed via MD5 cache signature | **PASS** |
| **Frappe CRM Downtime** | Simulate Frappe 504 Timeout | Lead preserved in Sheet with `Frappe Status = FAILED`; user gets confirmation | **PASS** |
| **Malformed JSON** | POST invalid JSON string | Rejected with HTTP 400; event logged in `System Log` | **PASS** |

---

## 3. Sample cURL Test Scripts

### Test DEMO-01 (Nexora Advisory):
```bash
curl -X POST "https://script.google.com/macros/s/<YOUR_DEPLOYMENT_ID>/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "demo_id": "DEMO-01",
    "lead_type": "CONSULTATION",
    "name": "Vikram Malhotra",
    "email": "vikram.m@zenithcorp.in",
    "phone": "+91 98200 11223",
    "company": "Zenith Corporate Partners",
    "service": "Technology Advisory",
    "requirement": "Cloud Infrastructure Modernization",
    "project_type": "Digital Transformation",
    "budget": "₹25L - ₹50L",
    "preferred_date": "2026-09-25",
    "preferred_time": "11:00 AM",
    "message": "Scoping enterprise ERP migration to ScaleNova OS.",
    "source": "Nexora Advisory Website",
    "source_page": "/book-consultation.html"
  }'
```

### Expected JSON Response:
```json
{
  "success": true,
  "submission_id": "SN-D01-20260911-XXXX",
  "demo_id": "DEMO-01",
  "lead_type": "CONSULTATION",
  "sheet_logged": true,
  "email_status": "BOTH_SENT",
  "frappe_status": "SUCCESS",
  "message": "Submission received successfully. Reference #SN-D01-20260911-XXXX"
}
```
