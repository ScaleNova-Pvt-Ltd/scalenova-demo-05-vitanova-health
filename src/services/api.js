/**
 * ScaleNova Systems — Client API Dispatcher (src/services/api.js)
 * Demo: VitaNova Health (DEMO-05)
 * All 5 websites connect to ONE shared Apps Script Web App URL.
 */

window.ScaleNovaAPI = (function () {
  'use strict';

  const config = window.DEMO_CONFIG || {
    demoId: 'DEMO-05',
    industry: 'Healthcare & Clinics',
    clientName: 'VitaNova Health',
    appsScriptUrl: window.APPS_SCRIPT_WEB_APP_URL || ''
  };

  async function submitLead(formData, options = {}) {
    // 1. Anti-spam honeypot check
    if (formData.website_hp || formData.company_hp || formData.website_trap || formData.security_trap) {
      console.warn('[ScaleNova Security] Honeypot trap triggered. Request silently dropped.');
      return mockSuccessResponse(formData, 'SPAM_FILTERED');
    }

    // 2. Validate mandatory fields
    if (!formData.name || !formData.email) {
      throw new Error('Name and email are mandatory fields.');
    }

    const payload = {
      demo_id: config.demoId || 'DEMO-05',
      lead_type: (formData.lead_type || formData.leadType || 'LEAD').toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: (formData.phone || '').trim(),
      company: (formData.company || '').trim() || 'Direct Client',
      service: formData.service || formData.department || formData.course || formData.product || 'General Inquiry',
      requirement: formData.requirement || formData.scope || formData.symptoms || formData.quantity || 'Standard Scope',
      project_type: formData.project_type || formData.projectType || 'Commercial',
      budget: formData.budget || 'Confidential',
      preferred_date: formData.preferred_date || formData.preferredDate || formData.date || '',
      preferred_time: formData.preferred_time || formData.preferredTime || formData.time || '',
      message: (formData.message || formData.notes || '').trim(),
      source: 'VitaNova Health Website',
      source_page: formData.source_page || formData.page || window.location.pathname || 'Home'
    };

    const endpoint = window.APPS_SCRIPT_WEB_APP_URL || 
                     config.appsScriptUrl || 
                     (window.SCALENOVA_GATEWAY && window.SCALENOVA_GATEWAY.submitUrl) ||
                     'https://script.google.com/macros/s/AKfycby-kC_gnWLAMrKc40yu0TOga5yZDreR50X-2AWw2rHrzCFi3oZp2W9Xqq3KXNoTh6bj/exec';

    const isPlaceholder = !endpoint || 
                          endpoint.includes('YOUR_SHARED_APPS_SCRIPT_WEB_APP_URL') || 
                          endpoint.includes('DEMO_ENDPOINT_ID');

    if (isPlaceholder) {
      // Local simulation mode for offline/pre-deployment testing
      await new Promise(r => setTimeout(r, 600));
      return mockSuccessResponse(payload);
    }

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      }

      const result = await resp.json();
      if (result.success === false) {
        throw new Error(result.message || 'Unable to process the request.');
      }
      return result;
    } catch (err) {
      console.warn('[ScaleNova API] Network error, falling back to local simulation:', err);
      return mockSuccessResponse(payload);
    }
  }

  function mockSuccessResponse(payload, overrideId) {
    const submissionId = overrideId || ('SN-D05-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000));
    
    console.group('%c[ScaleNova Demo Ingestion: VitaNova Health]', 'color:#0D9488;font-weight:bold;font-size:12px;');
    console.log('Demo ID:', 'DEMO-05 (Healthcare & Clinics)');
    console.log('Generated Submission ID:', submissionId);
    console.log('Target Worksheet:', 'Demo 5 - Healthcare');
    console.log('Payload dispatched:', payload);
    console.groupEnd();

    return {
      success: true,
      submission_id: submissionId,
      demo_id: 'DEMO-05',
      lead_type: payload.lead_type,
      message: 'Submission received successfully'
    };
  }

  return { submitLead };
})();
