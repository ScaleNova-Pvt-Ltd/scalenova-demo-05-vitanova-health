# Master Testing Specification — ScaleNova Multi-Industry Ingestion

Test the single Google Apps Script endpoint using the following cURL test commands. Each command sends a realistic industry payload and routes to its respective Google Sheet tab.

---

### Test 1: Demo 1 — Nexora Advisory (`DEMO-01`)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "demoId": "DEMO-01",
    "industry": "Professional & B2B Services",
    "sourceWebsite": "Nexora Advisory Website",
    "leadType": "CONSULTATION",
    "page": "Book Consultation",
    "name": "Rajesh Singhania",
    "email": "rajesh@singhania-logistics.com",
    "phone": "+91 98200 12345",
    "company": "Singhania Logistics Ltd",
    "service": "Technology Advisory",
    "requirement": "ERP & Cloud Migration Architecture",
    "budget": "₹25,00,000 - ₹50,00,000",
    "preferredDate": "2026-09-22",
    "preferredTime": "11:00 AM IST",
    "message": "Evaluating end-to-end digital infrastructure upgrade for 14 regional distribution hubs."
  }'
```

---

### Test 2: Demo 2 — ForgeCore Industries (`DEMO-02`)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "demoId": "DEMO-02",
    "industry": "Manufacturing & Industrial SMEs",
    "sourceWebsite": "ForgeCore Industries Website",
    "leadType": "QUOTE_REQUEST",
    "page": "Request Quote",
    "name": "Vikramaditya Mehta",
    "email": "v.mehta@bharatautoworks.in",
    "phone": "+91 99300 67890",
    "company": "Bharat Auto Components",
    "service": "CNC Machining & Precision Fabrication",
    "requirement": "Titanium Grade 5 Flange Batches",
    "budget": "₹75,00,000+",
    "message": "Immediate requirement for 5,000 units of heat-treated precision forged engine mounts."
  }'
```

---

### Test 3: Demo 3 — Aurelia Estates (`DEMO-03`)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "demoId": "DEMO-03",
    "industry": "Real Estate & Construction",
    "sourceWebsite": "Aurelia Estates Website",
    "leadType": "BOOKING",
    "page": "Schedule Visit",
    "name": "Ananya Birla-Chopra",
    "email": "ananya@chopraholdings.com",
    "phone": "+91 98110 54321",
    "company": "Chopra Family Office",
    "service": "Luxury Residential Acquisition",
    "requirement": "Penthouse Sanctuary",
    "preferredDate": "2026-09-25",
    "preferredTime": "03:30 PM IST",
    "budget": "₹15,00,00,000+",
    "message": "Scheduling private site walkthrough for the 8,000 sq.ft duplex penthouse at Aurelia One."
  }'
```

---

### Test 4: Demo 4 — Bloombridge Academy (`DEMO-04`)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "demoId": "DEMO-04",
    "industry": "Education & Training",
    "sourceWebsite": "Bloombridge Academy Website",
    "leadType": "BOOKING",
    "page": "Book Counselling",
    "name": "Kavya Subramanian",
    "email": "kavya.subramanian@techcareers.org",
    "phone": "+91 97400 33221",
    "company": "Infosys FinTech Group",
    "service": "Executive Product & AI Leadership Program",
    "requirement": "Career Transition to Chief Product Officer",
    "preferredDate": "2026-09-24",
    "preferredTime": "05:00 PM IST",
    "message": "Requesting 1-on-1 career consultation regarding the upcoming autumn fellowship cohort."
  }'
```

---

### Test 5: Demo 5 — VitaNova Health (`DEMO-05`)
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_APPS_SCRIPT_ID/exec" \
  -H "Content-Type: text/plain;charset=utf-8" \
  -d '{
    "demoId": "DEMO-05",
    "industry": "Healthcare & Clinics",
    "sourceWebsite": "VitaNova Health Website",
    "leadType": "BOOKING",
    "page": "Book Appointment",
    "name": "Arun K. Nambiar",
    "email": "arun.nambiar@globalexports.co.in",
    "phone": "+91 98450 99887",
    "company": "Private Executive",
    "service": "Executive Comprehensive Health Evaluation",
    "requirement": "Preventative Cardiology & Longevity Assessment",
    "preferredDate": "2026-09-21",
    "preferredTime": "09:30 AM IST",
    "message": "Booking annual executive metabolic and cardiovascular screening package."
  }'
```
