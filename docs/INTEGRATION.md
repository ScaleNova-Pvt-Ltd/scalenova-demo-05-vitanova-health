# Integration Guide — VitaNova Health

## Gateway Configuration
- **Demo Identifier:** `DEMO-05`
- **Lead Prefix:** `SN-VIT-`
- **Target Sheet:** `Demo5_Healthcare`
- **Target Frappe Source:** `VitaNova Health Outpatient Portal`

### Payload Format
```json
{
  "demoId": "DEMO-05",
  "industry": "Healthcare & Specialty Clinics",
  "sourceWebsite": "VitaNova Health Specialty Medical Centers (DEMO-05)",
  "leadType": "Doctor Consultation Booking",
  "fullName": "Ramesh Chandra",
  "email": "ramesh.c@example.com",
  "phone": "+91 98450 67890",
  "companyName": "Star Health Insurance (Cashless)",
  "city": "Bengaluru (Indiranagar Super-Specialty)",
  "serviceInterest": "Cardiology & Heart Care",
  "budgetRange": "In-Person Hospital OPD Consultation",
  "timeline": "Date: 2026-09-15 (Morning (09:30 AM - 12:30 PM))",
  "projectDescription": "Prior angiogram review with Dr. Arvind Swaminathan.",
  "submissionId": "SN-VIT-M3L8-2940"
}
```
Routed automatically to `Demo5_Healthcare` and Frappe CRM.
