window.DEMO_CONFIG = {
  demoId: 'DEMO-05',
  industry: 'Healthcare & Clinics',
  clientName: 'VitaNova Health',
  appsScriptUrl: window.APPS_SCRIPT_WEB_APP_URL || 'YOUR_SHARED_APPS_SCRIPT_WEB_APP_URL'
};

/**
 * ScaleNova EliteOS — Demo 05: VitaNova Health Configuration
 */

export const APP_CONFIG = {
  demoId: 'DEMO-05',
  industry: 'Healthcare & Specialty Clinics',
  companyName: 'VitaNova Health Specialty Medical Centers',
  tagline: 'Precision Medicine • Compassionate Surgical Excellence',
  targetSheet: 'Demo5_Healthcare',
  leadPrefix: 'SN-VIT-',
  
  // Public Gateway URL (Shared ScaleNova Google Apps Script Web App)
  submitUrl: window.__SCALENOVA_CONFIG__?.appsScriptUrl || 
             'https://script.google.com/macros/s/DEMO_ENDPOINT_ID_REPLACE_IN_PRODUCTION/exec',
  
  // Demo Fallback / Simulation Settings
  simulationMode: true,
  
  contactDetails: {
    hospitalBengaluru: '100 Feet Road, Indiranagar, Bangalore, Karnataka 560038',
    hospitalHyderabad: 'Road No. 1, Banjara Hills, Hyderabad, Telangana 500034',
    hospitalMumbai: 'Bandra-Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
    emergencyHelpline: '1800-425-9900 (24/7)',
    appointmentEmail: 'care@vitanova-health.demo'
  }
};
