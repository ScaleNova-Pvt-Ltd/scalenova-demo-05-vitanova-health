window.DEMO_CONFIG = {
  demoId: 'DEMO-05',
  industry: 'Healthcare & Clinics',
  clientName: 'VitaNova Health',
  appsScriptUrl: window.APPS_SCRIPT_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycby-kC_gnWLAMrKc40yu0TOga5yZDreR50X-2AWw2rHrzCFi3oZp2W9Xqq3KXNoTh6bj/exec'
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
             'https://script.google.com/macros/s/AKfycby-kC_gnWLAMrKc40yu0TOga5yZDreR50X-2AWw2rHrzCFi3oZp2W9Xqq3KXNoTh6bj/exec',
  
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
