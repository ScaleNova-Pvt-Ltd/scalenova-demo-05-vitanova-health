# Frappe CRM REST API Integration

## Overview
ScaleNova connects every public client website to the internal business operating system powered by **Frappe CRM / ERPNext**.

- **Demonstration CRM Endpoint**: `https://demo.scalenovasys.com`
- **Target DocType**: `Lead`
- **Authentication**: Token-based (`token API_KEY:API_SECRET`)
- **Resilience**: Zero lead loss. If Frappe is unreachable, the lead is safely recorded in Google Sheets with `Frappe Status = FAILED` for automated reconciliation.

See [API-MAPPING.md](./API-MAPPING.md) for full field schema mapping.
