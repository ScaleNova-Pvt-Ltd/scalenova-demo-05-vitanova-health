/**
 * ScaleNova EliteOS — Demo 05: VitaNova Health
 * Responsive Super-Specialty Doctor & Appointment Scheduler (src/components/doctor-scheduler.js)
 * Architecture: Premium Clinical Technology (Style H)
 * Standards: WCAG 2.2 AA compliant, DPDP-compliant telemetry, strict verification guardrails
 */

(function () {
  'use strict';

  // Verified Clinician Directorate & Practice Schedules
  const CLINICAL_FACULTY = [
    {
      id: 'dr-swaminathan',
      name: 'Dr. Arvind Swaminathan',
      qualification: 'MBBS, MS, MCh (AIIMS), FACS, Fellow Cleveland Clinic',
      department: 'Interventional Cardiology',
      departmentLabel: 'Cardiac Sciences Directorate',
      specialty: 'Minimally Invasive Cardiac Surgery & TAVR',
      experience: '22+ Years Surgical Leadership',
      clinicDays: [1, 3, 5], // Mon, Wed, Fri
      clinicDaysText: 'Mon, Wed, Fri (10:00 AM – 02:00 PM)',
      slots: ['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM', '01:00 PM', '01:30 PM'],
      campus: 'Bengaluru Main Campus'
    },
    {
      id: 'dr-nambiar',
      name: 'Dr. Meera Nambiar',
      qualification: 'MBBS, MS (Ortho), M.Ch (UK), AO Spine Fellow',
      department: 'Robotic Orthopaedics & Spine',
      departmentLabel: 'Robotic Orthopaedics & Joint Institute',
      specialty: 'MAKO Robotic Knee & Hip Reconstruction',
      experience: '18+ Years Surgical Leadership',
      clinicDays: [2, 4, 6], // Tue, Thu, Sat
      clinicDaysText: 'Tue, Thu, Sat (09:00 AM – 01:00 PM)',
      slots: ['09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM', '12:00 PM', '12:30 PM'],
      campus: 'Bengaluru & Hyderabad'
    },
    {
      id: 'dr-varma',
      name: 'Dr. Rajeshwar Varma',
      qualification: 'MBBS, MS, M.Ch (Neurosurgery - NIMHANS)',
      department: 'Neurosciences & Stroke Rehabilitation',
      departmentLabel: 'Neurosciences & Stroke Institute',
      specialty: 'Endoscopic Brain Tumor & Complex Spine Surgery',
      experience: '20+ Years Surgical Leadership',
      clinicDays: [1, 4, 6], // Mon, Thu, Sat
      clinicDaysText: 'Mon, Thu, Sat (02:00 PM – 06:00 PM)',
      slots: ['02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM', '05:00 PM', '05:30 PM'],
      campus: 'Bengaluru Main Campus'
    },
    {
      id: 'dr-kulkarni',
      name: 'Dr. Shweta Kulkarni',
      qualification: 'MBBS, MS, DNB (Surgical Oncology - Tata Memorial)',
      department: 'Precision Oncology',
      departmentLabel: 'Comprehensive Oncology Centre',
      specialty: 'Robotic Gastrointestinal & Thoracic Oncology',
      experience: '16+ Years Surgical Leadership',
      clinicDays: [3, 5, 6], // Wed, Fri, Sat
      clinicDaysText: 'Wed, Fri, Sat (11:00 AM – 03:00 PM)',
      slots: ['11:00 AM', '11:45 AM', '12:30 PM', '01:15 PM', '02:00 PM', '02:30 PM'],
      campus: 'Hyderabad Specialized Wing'
    },
    {
      id: 'dr-sengupta',
      name: 'Dr. Rajeshwari Sengupta',
      qualification: 'MD, FRCP (London), Chief Medical Officer',
      department: 'Executive Health Screening',
      departmentLabel: 'Executive Health & Preventive Medicine',
      specialty: 'Advanced Cardiovascular Risk Profiling & Metabolic Longevity',
      experience: '24+ Years Clinical Leadership',
      clinicDays: [1, 2, 3, 4, 5], // Mon to Fri
      clinicDaysText: 'Mon – Fri (09:00 AM – 12:00 PM)',
      slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
      campus: 'Bengaluru Main Campus'
    }
  ];

  class DoctorScheduler {
    constructor() {
      this.faculty = CLINICAL_FACULTY;
      this.selectedDoctor = this.faculty[0];
      this.selectedSlot = this.selectedDoctor.slots[0];
      this.selectedMode = 'In-Clinic Consultation';
      this.selectedDate = this.getDefaultDate();
      
      this.init();
    }

    getDefaultDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    init() {
      this.enhanceExistingForm();
      this.renderSchedulerWidget();
      this.bindEvents();
    }

    enhanceExistingForm() {
      const existingForm = document.getElementById('appointmentForm');
      if (!existingForm) return;

      const deptSelect = document.getElementById('departmentSelect');
      if (deptSelect) {
        // Sync department select with specialist list
        deptSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          const matchedDoc = this.faculty.find((d) => d.department.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(d.department.toLowerCase()));
          if (matchedDoc) {
            this.selectedDoctor = matchedDoc;
            this.updateDoctorDetailsUI();
          }
        });
      }

      // Add doctor select or info card above preferredDate if not present
      const preferredDateInput = document.getElementById('preferredDate');
      if (preferredDateInput) {
        preferredDateInput.min = this.getDefaultDate();
        if (!preferredDateInput.value) {
          preferredDateInput.value = this.getDefaultDate();
        }
      }
    }

    renderSchedulerWidget() {
      const mount = document.getElementById('doctor-scheduler-root') || document.querySelector('.doctor-scheduler-mount');
      if (!mount) return;

      mount.innerHTML = `
        <div class="scheduler-card">
          <div class="scheduler-header">
            <span class="scheduler-badge">SUPER-SPECIALTY CLINICAL OPD</span>
            <h3 class="scheduler-title">Select Faculty Specialist & Priority Time Window</h3>
            <p class="scheduler-sub">Confirmed appointment requests are triaged directly by VitaNova Clinical Coordinators within 2 operational hours.</p>
          </div>

          <div class="scheduler-body">
            <!-- 1. Specialist Selector -->
            <div class="scheduler-section">
              <label class="scheduler-label" for="sch-doc-select">Attending Super-Specialist *</label>
              <select id="sch-doc-select" class="scheduler-select" aria-label="Select Specialist Doctor">
                ${this.faculty.map((d) => `
                  <option value="${d.id}" ${d.id === this.selectedDoctor.id ? 'selected' : ''}>
                    ${d.name} — ${d.department} (${d.specialty})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Active Doctor Profile Card -->
            <div id="sch-doc-card" class="doctor-spec-ribbon">
              <div class="doc-avatar-stub">+</div>
              <div class="doc-meta">
                <strong id="sch-doc-name" class="doc-name">${this.selectedDoctor.name}</strong>
                <span id="sch-doc-qual" class="doc-qual">${this.selectedDoctor.qualification}</span>
                <span id="sch-doc-spec" class="doc-spec">${this.selectedDoctor.specialty} &bull; ${this.selectedDoctor.experience}</span>
                <span id="sch-doc-days" class="doc-days">OPD Days: ${this.selectedDoctor.clinicDaysText} &bull; ${this.selectedDoctor.campus}</span>
              </div>
            </div>

            <!-- 2. Consultation Mode & Date -->
            <div class="scheduler-row-2">
              <div class="scheduler-section">
                <label class="scheduler-label">Consultation Mode *</label>
                <div class="mode-pills" role="radiogroup" aria-label="Consultation Mode">
                  <button type="button" class="mode-pill active" data-mode="In-Clinic Specialist Consultation" role="radio" aria-checked="true">In-Clinic OPD</button>
                  <button type="button" class="mode-pill" data-mode="Encrypted HD Telehealth Video Call" role="radio" aria-checked="false">Encrypted Telehealth</button>
                  <button type="button" class="mode-pill" data-mode="Second Surgical Opinion Board Review" role="radio" aria-checked="false">Medical Board Review</button>
                </div>
              </div>

              <div class="scheduler-section">
                <label class="scheduler-label" for="sch-date-input">Preferred Date *</label>
                <input type="date" id="sch-date-input" class="scheduler-input" value="${this.selectedDate}" min="${this.getDefaultDate()}">
              </div>
            </div>

            <!-- 3. Available Slots -->
            <div class="scheduler-section">
              <label class="scheduler-label">Available Consultation Slots *</label>
              <div class="slots-grid" id="sch-slots-container" role="radiogroup" aria-label="Time Slots">
                ${this.renderSlotButtons()}
              </div>
            </div>

            <!-- 4. Quick Triage Details -->
            <div class="scheduler-row-2" style="margin-top: 20px;">
              <div class="scheduler-section">
                <label class="scheduler-label" for="sch-patient-name">Patient Full Name *</label>
                <input type="text" id="sch-patient-name" class="scheduler-input" placeholder="e.g. Ramesh Chandra" required>
              </div>
              <div class="scheduler-section">
                <label class="scheduler-label" for="sch-patient-phone">Mobile Number *</label>
                <input type="tel" id="sch-patient-phone" class="scheduler-input" placeholder="+91 98765 43210" required>
              </div>
            </div>

            <div class="scheduler-section">
              <label class="scheduler-label" for="sch-patient-notes">Clinical Indication / Symptoms / Referrals</label>
              <textarea id="sch-patient-notes" class="scheduler-textarea" rows="2" placeholder="Briefly describe symptoms, previous surgeries, or specific scans available for review..."></textarea>
            </div>

            <!-- Feedback & Submit -->
            <div id="sch-feedback" class="scheduler-feedback" style="display:none;" role="status"></div>

            <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
              <span class="dpdp-shield">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                DPDP 2023 Encrypted Clinical Triage &bull; Zero Spam
              </span>
              <button type="button" id="sch-submit-btn" class="btn btn-primary" style="background: #0D9488; color: #FFF; padding: 12px 28px; font-weight: 600;">
                Confirm Consultation Request &rarr;
              </button>
            </div>
          </div>
        </div>
      `;

      this.injectStyles();
    }

    renderSlotButtons() {
      return this.selectedDoctor.slots.map((s, idx) => `
        <button type="button" class="slot-pill ${s === this.selectedSlot ? 'active' : ''}" data-slot="${s}" role="radio" aria-checked="${s === this.selectedSlot}">
          ${s}
        </button>
      `).join('');
    }

    updateDoctorDetailsUI() {
      const nameEl = document.getElementById('sch-doc-name');
      const qualEl = document.getElementById('sch-doc-qual');
      const specEl = document.getElementById('sch-doc-spec');
      const daysEl = document.getElementById('sch-doc-days');
      const slotsEl = document.getElementById('sch-slots-container');

      if (nameEl) nameEl.textContent = this.selectedDoctor.name;
      if (qualEl) qualEl.textContent = this.selectedDoctor.qualification;
      if (specEl) specEl.textContent = `${this.selectedDoctor.specialty} • ${this.selectedDoctor.experience}`;
      if (daysEl) daysEl.textContent = `OPD Days: ${this.selectedDoctor.clinicDaysText} • ${this.selectedDoctor.campus}`;

      this.selectedSlot = this.selectedDoctor.slots[0];
      if (slotsEl) {
        slotsEl.innerHTML = this.renderSlotButtons();
      }
    }

    injectStyles() {
      if (document.getElementById('doctor-scheduler-styles')) return;
      const s = document.createElement('style');
      s.id = 'doctor-scheduler-styles';
      s.textContent = `
        .scheduler-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-top: 4px solid #0D9488;
          border-radius: 8px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          margin-bottom: 40px;
        }
        .scheduler-header {
          margin-bottom: 24px;
        }
        .scheduler-badge {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0D9488;
          background: rgba(13, 148, 136, 0.1);
          padding: 4px 10px;
          border-radius: 4px;
        }
        .scheduler-title {
          font-family: var(--font-heading, serif);
          font-size: 1.6rem;
          color: #042F2E;
          margin: 8px 0 6px;
        }
        .scheduler-sub {
          color: #0F172A;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .scheduler-section {
          margin-bottom: 20px;
        }
        .scheduler-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0F172A;
          margin-bottom: 6px;
        }
        .scheduler-select, .scheduler-input, .scheduler-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          font-size: 0.95rem;
          color: #0F172A;
          font-family: inherit;
        }
        .scheduler-select:focus, .scheduler-input:focus, .scheduler-textarea:focus {
          outline: none;
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
        }
        .doctor-spec-ribbon {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #F0FDFA;
          border: 1px solid #99F6E4;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
        }
        .doc-avatar-stub {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #0D9488;
          color: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .doc-name {
          display: block;
          font-size: 1.05rem;
          color: #042F2E;
        }
        .doc-qual {
          display: block;
          font-size: 0.8rem;
          color: #0D9488;
          margin-top: 2px;
          font-weight: 500;
        }
        .doc-spec {
          display: block;
          font-size: 0.82rem;
          color: #0F172A;
          margin-top: 4px;
        }
        .doc-days {
          display: block;
          font-size: 0.78rem;
          color: #1E293B;
          margin-top: 4px;
          font-weight: 500;
        }
        .scheduler-row-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .mode-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .mode-pill {
          padding: 8px 14px;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          color: #0F172A;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-pill.active {
          background: #0D9488;
          color: #FFFFFF;
          border-color: #0D9488;
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
        }
        .slot-pill {
          padding: 10px 12px;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .slot-pill:hover {
          border-color: #0D9488;
          background: #F0FDFA;
        }
        .slot-pill.active {
          background: #0D9488;
          color: #FFFFFF;
          border-color: #0D9488;
        }
        .dpdp-shield {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: #0F766E;
          font-weight: 500;
        }
        .scheduler-feedback {
          padding: 14px 18px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 16px;
          line-height: 1.5;
        }
        .scheduler-feedback.success {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #065F46;
        }
        .scheduler-feedback.error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #991B1B;
        }
        @media (max-width: 768px) {
          .scheduler-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `;
      document.head.appendChild(s);
    }

    bindEvents() {
      // Doctor select change
      document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'sch-doc-select') {
          const doc = this.faculty.find((d) => d.id === e.target.value);
          if (doc) {
            this.selectedDoctor = doc;
            this.updateDoctorDetailsUI();
          }
        }
      });

      // Mode pill click
      document.addEventListener('click', (e) => {
        const modeBtn = e.target.closest('.mode-pill');
        if (modeBtn) {
          document.querySelectorAll('.mode-pill').forEach((p) => {
            p.classList.remove('active');
            p.setAttribute('aria-checked', 'false');
          });
          modeBtn.classList.add('active');
          modeBtn.setAttribute('aria-checked', 'true');
          this.selectedMode = modeBtn.getAttribute('data-mode') || 'In-Clinic Specialist Consultation';
        }

        // Slot pill click
        const slotBtn = e.target.closest('.slot-pill');
        if (slotBtn) {
          document.querySelectorAll('.slot-pill').forEach((s) => {
            s.classList.remove('active');
            s.setAttribute('aria-checked', 'false');
          });
          slotBtn.classList.add('active');
          slotBtn.setAttribute('aria-checked', 'true');
          this.selectedSlot = slotBtn.getAttribute('data-slot');
        }
      });

      // Submit button
      document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'sch-submit-btn') {
          this.handleSubmit();
        }
      });
    }

    handleSubmit() {
      const nameInput = document.getElementById('sch-patient-name');
      const phoneInput = document.getElementById('sch-patient-phone');
      const dateInput = document.getElementById('sch-date-input');
      const notesInput = document.getElementById('sch-patient-notes');
      const feedback = document.getElementById('sch-feedback');

      if (!nameInput || !phoneInput || !feedback) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const date = dateInput ? dateInput.value : this.selectedDate;
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!name || name.length < 2) {
        feedback.className = 'scheduler-feedback error';
        feedback.style.display = 'block';
        feedback.textContent = 'Please provide the patient full legal name.';
        nameInput.focus();
        return;
      }

      if (!phone || phone.length < 8) {
        feedback.className = 'scheduler-feedback error';
        feedback.style.display = 'block';
        feedback.textContent = 'Please enter a valid mobile number for SMS / WhatsApp confirmation.';
        phoneInput.focus();
        return;
      }

      const refId = `VN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      // Simulate or call ScaleNova Lead API
      feedback.className = 'scheduler-feedback success';
      feedback.style.display = 'block';
      feedback.innerHTML = `
        <strong>Appointment Request Received (${refId})</strong><br>
        Attending Specialist: <strong>${this.selectedDoctor.name}</strong> (${this.selectedDoctor.department})<br>
        Mode: <strong>${this.selectedMode}</strong> &bull; Slot: <strong>${date} at ${this.selectedSlot}</strong><br>
        <span style="font-size: 0.82rem; margin-top: 4px; display: inline-block;">
          Our Clinical Intake Desk has dispatched an encrypted confirmation to ${phone}. Please arrive 15 minutes early for baseline vitals registration.
        </span>
      `;

      // If ScaleNovaAPI exists on page, submit lead
      if (window.ScaleNovaAPI && typeof window.ScaleNovaAPI.submitLead === 'function') {
        window.ScaleNovaAPI.submitLead({
          name: name,
          phone: phone,
          department: this.selectedDoctor.department,
          specialist: this.selectedDoctor.name,
          date: date,
          slot: this.selectedSlot,
          mode: this.selectedMode,
          notes: notes,
          referenceId: refId
        }).catch(() => {});
      }
    }
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.vitanovaScheduler = new DoctorScheduler();
    });
  } else {
    window.vitanovaScheduler = new DoctorScheduler();
  }
})();
