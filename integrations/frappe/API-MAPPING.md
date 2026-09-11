# Frappe CRM Field Mapping Specification

| Website Form Field | Google Sheet Column | Frappe CRM DocType (`Lead`) Field | Type | Description |
|---|---|---|---|---|
| `name` | Name | `lead_name` | Data | Full customer name |
| `email` | Email | `email_id` | Data | Business email address |
| `phone` | Phone | `mobile_no` | Data | Mobile telephone (+91) |
| `company` | Company | `company_name` | Data | Corporate / Organization name |
| `service` | Service | `custom_service` / `notes` | Data | Selected service or practice |
| `leadType` | Lead Type | `lead_type` / `notes` | Select | LEAD / BOOKING / QUOTE_REQUEST |
| `demoId` | Demo ID | `custom_demo_id` | Data | e.g. `DEMO-05` |
| `submissionId` | Submission ID | `custom_submission_id` | Data | e.g. `SN-VIT-202609-1234` |
| `source` | Source | `source` | Select | "ScaleNova Demo — Healthcare & Clinics" |
| `status` | Status | `status` | Select | Initial status: `Lead` |
| `message` | Message | `notes` | Text | Full inquiry and scope details |
