# Google Sheets Intake Architecture — VitaNova Health

## 1. Central Demonstration Spreadsheet
All five ScaleNova demonstration websites log into **one central spreadsheet**:
- **Spreadsheet Title**: `Demo Lead Captures — ScaleNova`
- **Assigned Worksheet**: `Demo 5 - Healthcare`

## 2. Standard 23-Column Schema
Each row in `Demo 5 - Healthcare` is stored with 23 standardized columns:

1. **Submission ID**: Unique deterministic key (e.g. `SN-VIT-202609-1234`)
2. **Created At**: ISO-8601 UTC timestamp
3. **Demo ID**: `DEMO-05`
4. **Industry**: `Healthcare & Clinics`
5. **Client Name**: `VitaNova Health`
6. **Name**: Prospect full name
7. **Email**: Prospect business email
8. **Phone**: Contact number with country code
9. **Company**: Company / Organization name
10. **Service**: Specific service or practice area
11. **Lead Type**: `LEAD`, `BOOKING`, `CONSULTATION`, or `QUOTE_REQUEST`
12. **Requirement**: Project scope / timeline / requirement
13. **Budget**: Target investment range
14. **Preferred Date**: Date slot (for consultations/bookings)
15. **Preferred Time**: Time slot
16. **Message**: Inquiry text or scope description
17. **Source**: `VitaNova Health Website`
18. **Source Page**: Page slug where form was submitted
19. **Status**: Initial status (`Open`)
20. **Owner**: Assigned partner (`ScaleNova Partner`)
21. **Frappe Status**: Status of CRM push (`SYNCED`, `PENDING`, or `FAILED`)
22. **Last Contacted**: Empty upon creation
23. **Notes**: Operational intake metadata
