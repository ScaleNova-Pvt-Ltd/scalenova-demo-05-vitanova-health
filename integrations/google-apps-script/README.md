# ScaleNova Master Google Apps Script Integration Broker

## Overview
This directory contains the master serverless webhook broker (`Code.gs`) for **ScaleNova Business OS**. It is deployed once in your Google Account and brokers leads from all five ScaleNova EliteOS demo websites:

1. **DEMO-01**: Nexora Advisory (*Demo 1 - Professional*)
2. **DEMO-02**: ForgeCore Industries (*Demo 2 - Manufacturing*)
3. **DEMO-03**: Aurelia Estates (*Demo 3 - Real Estate*)
4. **DEMO-04**: Bloombridge Academy (*Demo 4 - Education*)
5. **DEMO-05**: VitaNova Health (*Demo 5 - Healthcare*)

## Master Target Spreadsheet
- **Spreadsheet Name**: `Demo Lead Captures — ScaleNova`
- **Sender Address**: `demo@scalenovasys.com`
- **Columns**: 23 Standard Fields (Submission ID through Notes)
- **CRM Integration**: Pushes to `https://demo.scalenovasys.com/api/resource/Lead` with non-blocking fail-safe fallback.

See [CONFIGURATION.md](./CONFIGURATION.md) for deployment instructions.
