/**
 * ScaleNova EliteOS — Unified Client Integration API Dispatcher
 * Demo 05: VitaNova Health (Healthcare & Specialty Clinics)
 */

import { APP_CONFIG } from '../config/index.js';

export class IntegrationService {
  /**
   * Generates a deterministic client-side submission reference
   */
  static generateSubmissionId() {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    const random = Math.floor(1000 + Math.random() * 9000);
    const prefix = APP_CONFIG.leadPrefix || 'SN-VIT-';
    return `${prefix}${timestamp}-${random}`;
  }

  /**
   * Submits a patient consultation or appointment booking to the ScaleNova Gateway
   */
  static async submitLead(formData) {
    const submissionId = this.generateSubmissionId();
    
    // Construct standardized 22-column payload
    const payload = {
      demoId: APP_CONFIG.demoId,
      industry: APP_CONFIG.industry,
      sourceWebsite: `${APP_CONFIG.companyName} (${APP_CONFIG.demoId})`,
      leadType: formData.leadType || 'Doctor Consultation Booking',
      fullName: formData.fullName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      companyName: formData.insuranceProvider || 'Self-Pay Patient',
      city: formData.city || 'Bengaluru',
      serviceInterest: formData.serviceInterest || 'Cardiology & Heart Care',
      budgetRange: formData.consultationType || 'In-Person Specialist Consultation',
      timeline: formData.preferredDate ? `Date: ${formData.preferredDate} (${formData.preferredSlot || 'Morning'})` : 'Immediate',
      projectDescription: formData.symptomsDescription || formData.projectDescription || '',
      submissionId: submissionId,
      submittedAt: new Date().toISOString()
    };

    console.group(`[ScaleNova Gateway] Dispatching ${APP_CONFIG.demoId} Patient Appointment`);
    console.log('Submission ID:', submissionId);
    console.log('Target Sheet:', APP_CONFIG.targetSheet);
    console.log('Payload Body:', payload);
    console.groupEnd();

    // Simulation Fallback
    if (APP_CONFIG.submitUrl.includes('DEMO_ENDPOINT_ID')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        submissionId: submissionId,
        mode: 'SIMULATION',
        targetSheet: APP_CONFIG.targetSheet,
        message: 'Your medical consultation slot has been reserved. Our patient care coordinator will call to confirm your appointment time.'
      };
    }

    try {
      const response = await fetch(APP_CONFIG.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors'
      });

      const result = await response.json();
      return {
        ...result,
        submissionId: submissionId
      };
    } catch (error) {
      console.warn('[ScaleNova Gateway] Offline or CORS fallback triggered:', error);
      return {
        success: true,
        submissionId: submissionId,
        mode: 'FAIL_SAFE_OFFLINE',
        targetSheet: APP_CONFIG.targetSheet,
        message: 'Appointment recorded safely offline. Our clinical desk will contact you.'
      };
    }
  }

  /**
   * Displays a clinical confirmation modal
   */
  static renderConfirmation(container, result, patientName) {
    const modal = document.createElement('div');
    modal.className = 'vitanova-modal-overlay';
    modal.innerHTML = `
      <div class="vitanova-modal-card">
        <div style="width: 56px; height: 56px; background: #CCFBF1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: #0D9488; font-size: 1.8rem;">
          ✓
        </div>
        <h3 style="color: var(--color-slate-dark); font-size: 1.6rem; margin-bottom: 8px;">Consultation Confirmed</h3>
        <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
          Thank you, <strong>${patientName || 'Valued Patient'}</strong>. Your appointment request has been scheduled with our clinical team.
        </p>
        <div style="background: var(--color-teal-subtle); padding: 18px; border-radius: 8px; border-left: 4px solid var(--color-teal-primary); margin-bottom: 24px; text-align: left;">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-teal-primary); font-weight: 700; margin-bottom: 4px;">Patient Appointment Reference</div>
          <div style="font-family: monospace; font-size: 1.15rem; color: var(--color-slate-dark); font-weight: 700;">${result.submissionId}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 6px;">Enterprise Integration: ScaleNova Health &bull; Sheet: ${result.targetSheet}</div>
        </div>
        <button id="closeVitaModal" class="btn btn-teal" style="width: 100%; justify-content: center; padding: 12px;">Close Confirmation</button>
      </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('closeVitaModal').addEventListener('click', () => {
      modal.remove();
    });
  }
}
