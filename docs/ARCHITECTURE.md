# VitaNova Health — Technical Architecture

VitaNova Health is part of ScaleNova's **EliteOS Tier**, engineered specifically for tertiary hospitals, surgical daycare centers, and super-specialty outpatient clinics.

## System Topology

```
[Patient / Attendant / Insurance Coordinator]
         │ (HTTPS / TLS 1.3)
         ▼
[VitaNova Health Static Web Engine] (Cloudflare Pages Edge)
   - Visual Identity: Clinical Marine Teal (#0D9488) + Crisp White (#FFFFFF) + Slate (#0F172A)
   - Calming Physiological Vital Pulse Canvas: Real-time organic ECG sine wave animation
   - Consultation Booking Funnel: Specialty, doctor, insurance TPA, and preferred time slot
         │
         │ POST JSON (Zero-Secret Client API)
         ▼
[ScaleNova Master Integration Gateway] (Google Apps Script Web App)
   - Request routing via `demoId = "DEMO-05"`
   - 22-Column ISO Schema Formatting
         ├──> [Master Google Sheet CRM] -> Tab: `Demo5_Healthcare` (22 Columns)
         ├──> [Dual Transactional Email via Gmail Service]
         │       ├── Hospital Outpatient Desk Notification with clinical preferences
         │       └── Patient consultation confirmation receipt with ticket ID (`SN-VIT-XXXXXX`)
         └──> [ScaleNova Frappe CRM / ERPNext]
                 └── POST https://demo.scalenovasys.com/api/resource/Lead
                 └── Fail-safe asynchronous logging
```
