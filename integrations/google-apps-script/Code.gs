/**
 * ==============================================================================
 * SCALENOVA SYSTEMS — MASTER CLIENT PRODUCTION INTEGRATION GATEWAY (Code.gs)
 * Standard: ScaleNova Client Production Architecture & Operations Manual v1.0
 * Corporate Entity: ScaleNova Private Limited (CIN: U72900AP2026PTC123456)
 * Official Inquiries: api.integration@scalenovasys.com | support@scalenovasys.com
 * ==============================================================================
 * 
 * ARCHITECTURAL SUMMARY:
 * This single Google Apps Script file powers the centralized lead-capture,
 * database intake, transactional notification, and CRM synchronization engine
 * for all five ScaleNova EliteOS demonstration client websites:
 * 
 *   [Demo 01: Nexora Advisory]        (Professional & B2B Services)
 *   [Demo 02: ForgeCore Industries]   (Manufacturing & Industrial)
 *   [Demo 03: Aurelia Estates]        (Real Estate & Construction)
 *   [Demo 04: Bloombridge Academy]    (Education & Training)
 *   [Demo 05: VitaNova Health]        (Healthcare & Clinics)
 * 
 * Target Central Spreadsheet: "Demo Lead Captures — ScaleNova"
 * Worksheets:
 *  - "Demo 1 - Professional"
 *  - "Demo 2 - Manufacturing"
 *  - "Demo 3 - Real Estate"
 *  - "Demo 4 - Education"
 *  - "Demo 5 - Healthcare"
 *  - "System Log"
 *  - "Configuration Reference"
 * 
 * Target Central Spreadsheet: Demo Lead Captures — ScaleNova
 * ==============================================================================
 * 
 * MODULAR CODE STRUCTURE (17 Sections):
 *  1. CONFIGURATION (getConfig)
 *  2. DEMO CONFIGURATION (DEMO_REGISTRY)
 *  3. HTTP ENTRYPOINTS (doPost, doGet)
 *  4. REQUEST VALIDATION
 *  5. LEAD NORMALIZATION (28 Standard Columns)
 *  6. SUBMISSION ID GENERATION (SN-D0X-YYYYMMDD-XXXX)
 *  7. SHEET ROUTING
 *  8. GOOGLE SHEET FUNCTIONS (28 Standard Columns)
 *  9. EMAIL ENGINE
 * 10. EMAIL TEMPLATES (5 Distinct Brand Identities)
 * 11. FRAPPE API DISPATCHER (getCleanFrappeEndpoint)
 * 12. FRAPPE FIELD MAPPING
 * 13. SYSTEM LOGGING (12 Columns)
 * 14. ERROR HANDLING
 * 15. DUPLICATE PROTECTION
 * 16. RETRY FUNCTIONS (retryFailedFrappeLeads)
 * 17. UTILITY FUNCTIONS
 * ==============================================================================
 */

// ==============================================================================
// 1. CONFIGURATION
// ==============================================================================
function getConfig() {
  var props = PropertiesService.getScriptProperties();

  // Strip trailing slashes, /app/home, or /app from Frappe API URL
  var rawFrappeUrl = props.getProperty('FRAPPE_API_URL') || '';
  var cleanFrappeUrl = rawFrappeUrl ? rawFrappeUrl.trim().replace(/\/+$/, '').replace(/\/app(\/.*)?$/, '') : 'https://demo.scalenovasys.com';

  return {
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || '',
    ownerEmail: props.getProperty('OWNER_EMAIL') || 'support@scalenovasys.com',
    demoEmail: props.getProperty('DEMO_EMAIL') || 'demo@scalenovasys.com',
    frappeApiUrl: cleanFrappeUrl,
    frappeUrl: cleanFrappeUrl,
    frappeApiKey: props.getProperty('FRAPPE_API_KEY') || '',
    frappeApiSecret: props.getProperty('FRAPPE_API_SECRET') || '',
    environment: props.getProperty('ENVIRONMENT') || 'production',
    notificationMode: props.getProperty('NOTIFICATION_MODE') || 'ALL',
    allowedOrigins: props.getProperty('ALLOWED_ORIGINS') || '*',
    enableClientConfirmation:
      String(props.getProperty('ENABLE_CLIENT_CONFIRMATION')).toLowerCase() === 'true'
  };
}

var getGatewayConfig = getConfig;

// ==============================================================================
// 2. DEMO CONFIGURATION
// ==============================================================================
var DEMO_REGISTRY = {
  'DEMO-01': {
    demoId: 'DEMO-01',
    name: 'Nexora Advisory',
    industry: 'Professional & B2B Services',
    sheetName: 'Demo 1 - Professional',
    idPrefix: 'SN-D01',
    primaryColor: '#0B132B',
    secondaryColor: '#00B4D8',
    domain: 'demo1.scalenovasys.com',
    websiteName: 'Nexora Advisory Portal',
    emailGreeting: 'Strategic Advisory & Enterprise Transformation',
    emailFooter: 'Nexora Advisory • ScaleNova EliteOS Client Platform',
    supportContact: 'advisory@scalenovasys.com',
    primaryAction: 'Book Consultation'
  },
  'DEMO-02': {
    demoId: 'DEMO-02',
    name: 'ForgeCore Industries',
    industry: 'Manufacturing & Industrial',
    sheetName: 'Demo 2 - Manufacturing',
    idPrefix: 'SN-D02',
    primaryColor: '#121214',
    secondaryColor: '#F59E0B',
    domain: 'demo2.scalenovasys.com',
    websiteName: 'ForgeCore Industrial Portal',
    emailGreeting: 'Precision Engineering & Industrial Fabrication',
    emailFooter: 'ForgeCore Industries • ScaleNova EliteOS Client Platform',
    supportContact: 'engineering@scalenovasys.com',
    primaryAction: 'Request Quote'
  },
  'DEMO-03': {
    demoId: 'DEMO-03',
    name: 'Aurelia Estates',
    industry: 'Real Estate & Construction',
    sheetName: 'Demo 3 - Real Estate',
    idPrefix: 'SN-D03',
    primaryColor: '#1E1C1A',
    secondaryColor: '#C5A880',
    domain: 'demo3.scalenovasys.com',
    websiteName: 'Aurelia Estates Luxury Showcase',
    emailGreeting: 'Luxury Living & Turnkey Architectural Excellence',
    emailFooter: 'Aurelia Estates • ScaleNova EliteOS Client Platform',
    supportContact: 'concierge@scalenovasys.com',
    primaryAction: 'Schedule Visit'
  },
  'DEMO-04': {
    demoId: 'DEMO-04',
    name: 'Bloombridge Academy',
    industry: 'Education & Training',
    sheetName: 'Demo 4 - Education',
    idPrefix: 'SN-D04',
    primaryColor: '#2D1B69',
    secondaryColor: '#7C3AED',
    domain: 'demo4.scalenovasys.com',
    websiteName: 'Bloombridge Academy Learning Portal',
    emailGreeting: 'Empowering Next-Generation Leaders & Innovators',
    emailFooter: 'Bloombridge Academy • ScaleNova EliteOS Client Platform',
    supportContact: 'admissions@scalenovasys.com',
    primaryAction: 'Book Counselling'
  },
  'DEMO-05': {
    demoId: 'DEMO-05',
    name: 'VitaNova Health',
    industry: 'Healthcare & Clinics',
    sheetName: 'Demo 5 - Healthcare',
    idPrefix: 'SN-D05',
    primaryColor: '#0A2540',
    secondaryColor: '#0D9488',
    domain: 'demo5.scalenovasys.com',
    websiteName: 'VitaNova Clinical Health Portal',
    emailGreeting: 'Advanced Multi-Specialty Clinical Excellence',
    emailFooter: 'VitaNova Health • ScaleNova EliteOS Client Platform',
    supportContact: 'care@scalenovasys.com',
    primaryAction: 'Book Appointment'
  }
};

var ALLOWED_LEAD_TYPES = [
  'LEAD',
  'CONTACT',
  'BOOKING',
  'CONSULTATION',
  'QUOTE_REQUEST',
  'BROCHURE_REQUEST',
  'APPOINTMENT',
  'COUNSELLING',
  'ADMISSION'
];

// ==============================================================================
// 3. HTTP ENTRYPOINTS (doPost, doGet)
// ==============================================================================
function doPost(e) {
  var config = getConfig();
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(15000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      logSystemEvent('GATEWAY', 'NONE', 'REQUEST_REJECTED', 'FAILED', 'Empty payload received', 'EMPTY_PAYLOAD', 'No postData in event', 0, config);
      return sendJsonResponse({
        success: false,
        submission_id: null,
        message: "We couldn't complete your request right now. Please try again in a moment."
      }, 400);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (jsonErr) {
      logSystemEvent('GATEWAY', 'NONE', 'REQUEST_REJECTED', 'FAILED', 'Malformed JSON payload: ' + jsonErr.message, 'INVALID_JSON', jsonErr.toString(), 0, config);
      return sendJsonResponse({
        success: false,
        submission_id: null,
        message: 'Unable to process the request'
      }, 400);
    }

    // Honeypot check
    if (checkHoneypot(payload)) {
      Logger.log('[Security Guard] Spam honeypot triggered. Silently dropped.');
      return sendJsonResponse({
        success: true,
        submission_id: 'SN-SPAM-FILTERED',
        message: 'Submission received successfully'
      }, 200);
    }

    // Validation
    var validationResult = validateLeadRequest(payload);
    if (!validationResult.valid) {
      logSystemEvent(payload.demo_id || payload.demoId || 'UNKNOWN', 'NONE', 'VALIDATION_FAILED', 'FAILED', validationResult.message, 'VALIDATION_ERROR', validationResult.message, 0, config);
      return sendJsonResponse({
        success: false,
        submission_id: null,
        message: validationResult.message
      }, 422);
    }

    var demoDef = validationResult.demoDef;
    var demoId = demoDef.demoId;

    // Duplicate check
    if (isDuplicateSubmission(payload)) {
      Logger.log('[Notice] Duplicate submission suppressed for email: ' + payload.email);
      return sendJsonResponse({
        success: true,
        submission_id: payload.submission_id || 'SN-DUPLICATE-SUPPRESSED',
        demo_id: demoId,
        lead_type: validationResult.leadType,
        message: 'Submission received successfully'
      }, 200);
    }

    // Generate Submission ID
    var submissionId = generateSubmissionId(demoDef.idPrefix);

    // Normalize Lead
    var leadRecord = normalizeLeadRecord(payload, demoDef, submissionId);

    // Write to Google Sheet (Permanent Capture Layer)
    var sheetWriteResult = writeLeadToSheet(leadRecord, demoDef, config);

    // Dispatch Emails
    var emailStatus = dispatchTransactionalEmails(leadRecord, demoDef, config);
    leadRecord.emailStatus = emailStatus;

    // Create Frappe CRM Lead (Fail-Safe)
    var frappeResult = forwardLeadToFrappeCRM(leadRecord, demoDef, config);
    leadRecord.frappeStatus = frappeResult.status;
    leadRecord.frappeLeadId = frappeResult.leadId;

    // Update row in Sheet with Frappe Status & Email Status
    if (sheetWriteResult.success && sheetWriteResult.sheet && sheetWriteResult.rowIndex) {
      updateSheetRowStatus(sheetWriteResult.sheet, sheetWriteResult.rowIndex, emailStatus, frappeResult.status, frappeResult.leadId);
    }

    // Write System Log
    logSystemEvent(
      demoId,
      submissionId,
      'LEAD_INGESTION',
      'SUCCESS',
      'Lead captured in sheet "' + demoDef.sheetName + '". Email: ' + emailStatus + '. Frappe: ' + frappeResult.status,
      frappeResult.status === 'SUCCESS' ? 'NONE' : 'FRAPPE_WARN',
      frappeResult.message || 'Complete cycle processed',
      0,
      config
    );

    // Return Clean Success JSON
    return sendJsonResponse({
      success: true,
      submission_id: submissionId,
      demo_id: demoId,
      lead_type: leadRecord.leadType,
      message: 'Submission received successfully'
    }, 200);

  } catch (err) {
    Logger.log('[Critical Failure] ' + err.toString() + '\n' + err.stack);
    logSystemEvent('GATEWAY', 'CRITICAL', 'SYSTEM_EXCEPTION', 'FAILED', err.message, 'SERVER_ERROR', err.stack, 0, config);
    return sendJsonResponse({
      success: false,
      submission_id: null,
      message: 'Unable to process the request'
    }, 500);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function doGet(e) {
  var config = getConfig();
  return sendJsonResponse({
    service: 'ScaleNova Master Client Production Gateway',
    version: '1.0.0',
    entity: 'ScaleNova Private Limited (CIN: U72900AP2026PTC123456)',
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    configuration: {
      hasSpreadsheetId: Boolean(config.spreadsheetId),
      hasOwnerEmail: Boolean(config.ownerEmail),
      hasFrappeApiKey: Boolean(config.frappeApiKey),
      demoEmail: config.demoEmail,
      environment: config.environment
    },
    supportedDemos: Object.keys(DEMO_REGISTRY).map(function(key) {
      var d = DEMO_REGISTRY[key];
      return {
        demoId: d.demoId,
        clientName: d.name,
        industry: d.industry,
        sheetTab: d.sheetName,
        domain: d.domain
      };
    })
  }, 200);
}

// ==============================================================================
// 4. REQUEST VALIDATION
// ==============================================================================
function validateLeadRequest(payload) {
  var rawDemoId = (payload.demo_id || payload.demoId || '').toString().trim().toUpperCase();
  if (!rawDemoId) {
    return { valid: false, message: 'Missing mandatory parameter: demo_id.' };
  }

  var demoDef = DEMO_REGISTRY[rawDemoId];
  if (!demoDef) {
    return { valid: false, message: 'Invalid demo_id: ' + rawDemoId + '. Supported IDs: DEMO-01 through DEMO-05.' };
  }

  var name = (payload.name || payload.full_name || '').toString().trim();
  if (!name || name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long.' };
  }

  var email = (payload.email || payload.email_id || '').toString().trim();
  var emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }

  var rawLeadType = (payload.lead_type || payload.leadType || 'LEAD').toString().trim().toUpperCase();
  if (ALLOWED_LEAD_TYPES.indexOf(rawLeadType) === -1) {
    rawLeadType = 'LEAD';
  }

  return {
    valid: true,
    demoDef: demoDef,
    leadType: rawLeadType
  };
}

// ==============================================================================
// 5. LEAD NORMALIZATION (28 Standard Columns)
// ==============================================================================
function normalizeLeadRecord(payload, demoDef, submissionId) {
  var nowIso = new Date().toISOString();
  var leadType = (payload.lead_type || payload.leadType || 'LEAD').toString().trim().toUpperCase();
  if (ALLOWED_LEAD_TYPES.indexOf(leadType) === -1) {
    leadType = 'LEAD';
  }

  return {
    submissionId: submissionId,
    createdAt: nowIso,
    demoId: demoDef.demoId,
    industry: demoDef.industry,
    clientName: demoDef.name,
    leadType: leadType,
    name: cleanString(payload.name || payload.full_name),
    email: cleanString(payload.email || payload.email_id).toLowerCase(),
    phone: cleanPhone(payload.phone || payload.mobile_no),
    company: cleanString(payload.company || payload.company_name) || 'Direct Client',
    service: cleanString(payload.service || payload.service_interest || payload.property || payload.course || payload.doctor || payload.department) || 'General Inquiry',
    requirement: cleanString(payload.requirement || payload.project_scope || payload.symptoms || payload.quantity) || 'Standard Inquiry',
    projectType: cleanString(payload.project_type || payload.projectType || payload.category) || 'Commercial',
    budget: cleanString(payload.budget || payload.budget_range || payload.budgetRange) || 'Confidential',
    preferredDate: cleanString(payload.preferred_date || payload.preferredDate || payload.date),
    preferredTime: cleanString(payload.preferred_time || payload.preferredTime || payload.time),
    message: cleanString(payload.message || payload.notes || payload.inquiry),
    source: cleanString(payload.source || payload.source_website) || 'Website',
    sourcePage: cleanString(payload.source_page || payload.sourcePage || payload.page) || 'Home',
    userAgent: cleanString(payload.user_agent || payload.userAgent || 'Web Browser (Cloudflare Edge)'),
    ipReference: cleanString(payload.ip_reference || payload.ipReference || 'REQ-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss')),
    status: 'Open',
    owner: 'ScaleNova Partner',
    emailStatus: 'PENDING',
    frappeStatus: 'PENDING',
    frappeLeadId: '',
    lastContacted: '',
    notes: 'Ingested via ScaleNova ' + demoDef.name + ' (' + (payload.source_page || 'Home') + ')'
  };
}

// ==============================================================================
// 6. SUBMISSION ID GENERATION (SN-D0X-YYYYMMDD-XXXX)
// ==============================================================================
function generateSubmissionId(prefix) {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'GMT', 'yyyyMMdd');
  var rand = ('000' + Math.floor(1 + Math.random() * 9999)).slice(-4);
  return prefix + '-' + dateStr + '-' + rand;
}

// ==============================================================================
// 7. SHEET ROUTING
// ==============================================================================
function getTargetWorksheet(ss, demoDef) {
  var sheet = ss.getSheetByName(demoDef.sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(demoDef.sheetName);
    provisionDemoSheetHeaders(sheet, demoDef.primaryColor);
  }
  return sheet;
}

// ==============================================================================
// 8. GOOGLE SHEET FUNCTIONS (28 Standard Columns)
// ==============================================================================
var MASTER_DEMO_HEADERS = [
  'Submission ID',
  'Created At',
  'Demo ID',
  'Industry',
  'Client Name',
  'Lead Type',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Service',
  'Requirement',
  'Project Type',
  'Budget',
  'Preferred Date',
  'Preferred Time',
  'Message',
  'Source',
  'Source Page',
  'User Agent',
  'IP / Request Reference',
  'Status',
  'Owner',
  'Email Status',
  'Frappe Status',
  'Frappe Lead ID',
  'Last Contacted',
  'Notes'
];

function writeLeadToSheet(record, demoDef, config) {
  try {
    var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('[Warning] Target spreadsheet could not be opened.');
      return { success: false, reason: 'SPREADSHEET_UNREACHABLE' };
    }

    var sheet = getTargetWorksheet(ss, demoDef);

    sheet.appendRow([
      record.submissionId,
      record.createdAt,
      record.demoId,
      record.industry,
      record.clientName,
      record.leadType,
      record.name,
      record.email,
      record.phone,
      record.company,
      record.service,
      record.requirement,
      record.projectType,
      record.budget,
      record.preferredDate,
      record.preferredTime,
      record.message,
      record.source,
      record.sourcePage,
      record.userAgent,
      record.ipReference,
      record.status,
      record.owner,
      record.emailStatus,
      record.frappeStatus,
      record.frappeLeadId,
      record.lastContacted,
      record.notes
    ]);

    var rowIndex = sheet.getLastRow();
    return { success: true, sheet: sheet, rowIndex: rowIndex };

  } catch (err) {
    Logger.log('[Sheet Append Error] ' + err.message);
    logSystemEvent(demoDef.demoId, record.submissionId, 'SHEET_WRITE_ERROR', 'FAILED', err.message, 'SHEET_ERROR', err.stack, 0, config);
    return { success: false, error: err.message };
  }
}

function provisionDemoSheetHeaders(sheet, headerColor) {
  sheet.appendRow(MASTER_DEMO_HEADERS);
  var range = sheet.getRange(1, 1, 1, MASTER_DEMO_HEADERS.length);
  range.setBackground(headerColor || '#0B132B');
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  range.setFontSize(10);
  range.setWrap(true);
  sheet.setFrozenRows(1);
}

function updateSheetRowStatus(sheet, rowIndex, emailStatus, frappeStatus, frappeLeadId) {
  try {
    sheet.getRange(rowIndex, 24).setValue(emailStatus);
    sheet.getRange(rowIndex, 25).setValue(frappeStatus);
    if (frappeLeadId) {
      sheet.getRange(rowIndex, 26).setValue(frappeLeadId);
    }
  } catch (e) {
    Logger.log('[Warning] Could not update sheet row status: ' + e.message);
  }
}

// ==============================================================================
// 9. EMAIL ENGINE (Dual Notification Pipeline)
// ==============================================================================
function dispatchTransactionalEmails(record, demoDef, config) {
  if (config.notificationMode === 'SILENT') {
    return 'SILENT_BYPASSED';
  }

  var ownerSuccess = false;
  var customerSuccess = false;

  if (config.notificationMode === 'ALL' || config.notificationMode === 'OWNER_ONLY') {
    ownerSuccess = sendOwnerAlertEmail(record, demoDef, config);
  }

  if (config.enableClientConfirmation && (config.notificationMode === 'ALL' || config.notificationMode === 'CUSTOMER_ONLY')) {
    customerSuccess = sendCustomerConfirmationEmail(record, demoDef, config);
  }

  if (ownerSuccess && customerSuccess) return 'BOTH_SENT';
  if (ownerSuccess) return 'OWNER_SENT';
  if (customerSuccess) return 'CUSTOMER_SENT';
  return 'FAILED';
}

function sendOwnerAlertEmail(record, demoDef, config) {
  try {
    var recipient = config.ownerEmail || 'support@scalenovasys.com';
    var subject = 'New Lead — ' + demoDef.demoId + ' — ' + demoDef.name + ' — #' + record.submissionId;
    var whatsappUrl = record.phone ? 'https://wa.me/' + record.phone.replace(/[^0-9]/g, '') : '';

    var html = 
      '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width:640px; margin:auto; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">' +
        '<div style="background:' + demoDef.primaryColor + '; padding:24px; color:#FFFFFF;">' +
          '<span style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:' + demoDef.secondaryColor + '; font-weight:700;">ScaleNova Hot Lead Alert</span>' +
          '<h2 style="margin:6px 0 0; font-size:22px; font-weight:600;">' + demoDef.name + '</h2>' +
          '<p style="margin:4px 0 0; font-size:13px; color:#CBD5E1;">' + demoDef.industry + ' • Lead Type: ' + record.leadType + '</p>' +
        '</div>' +
        '<div style="padding:24px; color:#1E293B; font-size:14px; line-height:1.6;">' +
          '<table style="width:100%; border-collapse:collapse; margin-bottom:18px;">' +
            '<tr><td style="padding:6px 0; color:#64748B; width:150px;">Submission Ref:</td><td style="font-weight:700; color:#0F172A;">#' + record.submissionId + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Prospect Name:</td><td style="font-weight:600;">' + record.name + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Business Email:</td><td><a href="mailto:' + record.email + '" style="color:' + demoDef.secondaryColor + ';">' + record.email + '</a></td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Phone:</td><td>' + (record.phone || '—') + (whatsappUrl ? ' &nbsp;<a href="' + whatsappUrl + '" style="color:#10B981; font-weight:600; text-decoration:none;">[WhatsApp Chat]</a>' : '') + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Organization:</td><td>' + record.company + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Service:</td><td style="font-weight:600;">' + record.service + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Requirement:</td><td>' + record.requirement + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Project Type:</td><td>' + record.projectType + '</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Budget:</td><td>' + record.budget + '</td></tr>' +
            (record.preferredDate ? '<tr><td style="padding:6px 0; color:#64748B;">Preferred Slot:</td><td style="font-weight:700; color:' + demoDef.secondaryColor + ';">' + record.preferredDate + ' @ ' + record.preferredTime + '</td></tr>' : '') +
            '<tr><td style="padding:6px 0; color:#64748B;">Source / Page:</td><td>' + record.sourcePage + ' (' + record.source + ')</td></tr>' +
            '<tr><td style="padding:6px 0; color:#64748B;">Created At:</td><td>' + record.createdAt + '</td></tr>' +
          '</table>' +
          '<div style="background:#FFFFFF; border:1px solid #E2E8F0; padding:16px; border-radius:6px; margin-top:12px;">' +
            '<strong style="color:#475569; font-size:12px; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:6px;">Client Message:</strong>' +
            (record.message || 'No additional message provided.').replace(/\n/g, '<br>') +
          '</div>' +
        '</div>' +
        '<div style="background:#F1F5F9; padding:14px; font-size:12px; color:#64748B; text-align:center; border-top:1px solid #E2E8F0;">' +
          'ScaleNova Business OS Master Gateway • Dispatched to ' + recipient +
        '</div>' +
      '</div>';

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: html,
      replyTo: record.email
    });
    return true;
  } catch (e) {
    Logger.log('[Owner Email Dispatch Error] ' + e.message);
    return false;
  }
}

function sendCustomerConfirmationEmail(record, demoDef, config) {
  try {
    var subject = 'Thank you for contacting ' + demoDef.name + ' — #' + record.submissionId;
    var html = buildCustomerEmailTemplate(record, demoDef, config);

    MailApp.sendEmail({
      to: record.email,
      subject: subject,
      htmlBody: html,
      replyTo: config.demoEmail || 'demo@scalenovasys.com'
    });
    return true;
  } catch (e) {
    Logger.log('[Customer Email Dispatch Error] ' + e.message);
    return false;
  }
}

// ==============================================================================
// 10. EMAIL TEMPLATES (5 Brand-Specific Experiences)
// ==============================================================================
function buildCustomerEmailTemplate(record, demoDef, config) {
  var appointmentBlock = '';
  if (record.preferredDate) {
    appointmentBlock = 
      '<div style="background:#F8FAFC; border-left:4px solid ' + demoDef.secondaryColor + '; padding:16px; margin:20px 0; border-radius:4px;">' +
        '<strong style="color:#0F172A; display:block; margin-bottom:4px;">Requested Appointment / Slot:</strong>' +
        'Date: <strong>' + record.preferredDate + '</strong><br>' +
        'Time: <strong>' + record.preferredTime + '</strong><br>' +
        'Type: <strong>' + record.leadType + '</strong>' +
      '</div>';
  }

  return (
    '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width:600px; margin:auto; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">' +
      '<div style="background:' + demoDef.primaryColor + '; padding:30px; color:#FFFFFF;">' +
        '<span style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:' + demoDef.secondaryColor + '; font-weight:700;">' + demoDef.industry + '</span>' +
        '<h2 style="margin:4px 0 0; font-size:24px; font-weight:600;">' + demoDef.name + '</h2>' +
      '</div>' +
      '<div style="padding:30px; color:#1E293B; font-size:15px; line-height:1.7;">' +
        '<p style="margin-top:0;">Dear ' + record.name + ',</p>' +
        '<p>Thank you for contacting <strong>' + demoDef.name + '</strong>. We have successfully received your inquiry regarding <strong>' + record.service + '</strong>.</p>' +
        '<p>Your inquiry reference code is <strong>#' + record.submissionId + '</strong>.</p>' +
        appointmentBlock +
        '<p>Our advisory and technical team is reviewing your requirements and will contact you shortly.</p>' +
        '<p>For immediate inquiries, reply directly to this email or visit <a href="https://' + demoDef.domain + '" style="color:' + demoDef.secondaryColor + '; font-weight:600; text-decoration:none;">' + demoDef.domain + '</a>.</p>' +
        '<p style="margin-bottom:0; margin-top:24px;">Warm regards,<br><strong>The ' + demoDef.name + ' Client Care Team</strong></p>' +
      '</div>' +
      '<div style="background:#F8FAFC; padding:16px; font-size:12px; color:#94A3B8; text-align:center; border-top:1px solid #E2E8F0;">' +
        demoDef.emailFooter + ' • All rights reserved.' +
      '</div>' +
    '</div>'
  );
}

// ==============================================================================
// 11. FRAPPE API DISPATCHER & FAIL-SAFE SYNCHRONIZATION
// ==============================================================================
function getCleanFrappeEndpoint(rawUrl) {
  if (!rawUrl) return '';
  var cleaned = rawUrl.trim().replace(/\/+$/, '').replace(/\/app(\/.*)?$/, '');
  return cleaned + '/api/resource/Lead';
}

function forwardLeadToFrappeCRM(record, demoDef, config) {
  if (!config.frappeApiKey || !config.frappeApiSecret) {
    Logger.log('[Notice] Frappe credentials not configured. Lead safely buffered in Google Sheets.');
    return {
      status: 'PENDING_CONFIG',
      leadId: '',
      message: 'Frappe credentials not configured in Script Properties.'
    };
  }

  var endpoint = getCleanFrappeEndpoint(config.frappeApiUrl || config.frappeUrl);
  if (!endpoint) {
    return {
      status: 'PENDING_CONFIG',
      leadId: '',
      message: 'Invalid Frappe API endpoint.'
    };
  }

  var leadPayload = buildFrappeLeadPayload(record, demoDef);

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'token ' + config.frappeApiKey + ':' + config.frappeApiSecret,
      'Accept': 'application/json'
    },
    payload: JSON.stringify(leadPayload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(endpoint, options);
    var code = response.getResponseCode();
    var responseText = response.getContentText();

    if (code >= 200 && code < 300) {
      var leadId = '';
      try {
        var parsed = JSON.parse(responseText);
        leadId = (parsed.data && parsed.data.name) ? parsed.data.name : 'LEAD-' + record.submissionId;
      } catch (parseEx) {
        leadId = 'LEAD-' + record.submissionId;
      }
      Logger.log('[Frappe Success] Code: ' + code + ' Lead ID: ' + leadId);
      return { status: 'SUCCESS', leadId: leadId, message: 'CRM record created' };
    } else {
      Logger.log('[Frappe API Warn] Code: ' + code + ' Response: ' + responseText);
      return { status: 'FAILED', leadId: '', message: 'HTTP ' + code + ': ' + responseText };
    }
  } catch (err) {
    Logger.log('[Frappe Exception] ' + err.message);
    return { status: 'FAILED', leadId: '', message: err.message };
  }
}

// ==============================================================================
// 12. FRAPPE FIELD MAPPING
// ==============================================================================
function buildFrappeLeadPayload(record, demoDef) {
  return {
    doctype: 'Lead',
    lead_name: record.name,
    email_id: record.email,
    mobile_no: record.phone,
    company_name: record.company,
    source: 'ScaleNova Demo — ' + demoDef.industry,
    status: 'Lead',
    custom_demo_id: record.demoId,
    custom_submission_id: record.submissionId,
    notes: 
      'Demo ID: ' + record.demoId + '\n' +
      'Client: ' + demoDef.name + ' (' + demoDef.industry + ')\n' +
      'Submission ID: ' + record.submissionId + '\n' +
      'Lead Type: ' + record.leadType + '\n' +
      'Service: ' + record.service + '\n' +
      'Requirement: ' + record.requirement + '\n' +
      'Project Type: ' + record.projectType + '\n' +
      'Budget: ' + record.budget + '\n' +
      (record.preferredDate ? 'Requested Slot: ' + record.preferredDate + ' @ ' + record.preferredTime + '\n' : '') +
      'Source Page: ' + record.sourcePage + ' (' + record.source + ')\n\n' +
      'Inquiry Message:\n' + record.message
  };
}

// ==============================================================================
// 13. SYSTEM LOGGING (12 Columns)
// ==============================================================================
var SYSTEM_LOG_HEADERS = [
  'Log ID',
  'Timestamp',
  'Demo ID',
  'Submission ID',
  'Event Type',
  'Status',
  'Message',
  'Frappe Status',
  'Email Status',
  'Error Code',
  'Error Details',
  'Retry Count'
];

function logSystemEvent(demoId, submissionId, eventType, status, message, errorCode, errorDetails, retryCount, config) {
  try {
    var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;

    var sheet = ss.getSheetByName('System Log');
    if (!sheet) {
      sheet = ss.insertSheet('System Log');
      sheet.appendRow(SYSTEM_LOG_HEADERS);
      var range = sheet.getRange(1, 1, 1, SYSTEM_LOG_HEADERS.length);
      range.setBackground('#1E293B');
      range.setFontColor('#FFFFFF');
      range.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var logId = 'LOG-' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);
    var timestamp = new Date().toISOString();

    sheet.appendRow([
      logId,
      timestamp,
      demoId || 'GATEWAY',
      submissionId || 'N/A',
      eventType || 'SYSTEM',
      status || 'INFO',
      cleanString(message),
      status === 'SUCCESS' ? 'SUCCESS' : 'WARN',
      'N/A',
      errorCode || 'NONE',
      cleanString(errorDetails),
      retryCount || 0
    ]);
  } catch (e) {
    Logger.log('[System Log Failure] ' + e.message);
  }
}

// ==============================================================================
// 14. ERROR HANDLING
// ==============================================================================
function cleanString(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function cleanPhone(phone) {
  if (!phone) return '';
  var cleaned = String(phone).trim();
  var digits = cleaned.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    return '+91 ' + digits.substring(0, 5) + ' ' + digits.substring(5);
  }
  return cleaned;
}

// ==============================================================================
// 15. DUPLICATE PROTECTION & SPAM MITIGATION
// ==============================================================================
function checkHoneypot(payload) {
  var traps = ['website_hp', 'booking_hp', 'company_hp', 'website_trap', 'security_trap'];
  for (var i = 0; i < traps.length; i++) {
    if (payload[traps[i]]) {
      return true;
    }
  }
  return false;
}

function isDuplicateSubmission(payload) {
  var cache = CacheService.getScriptCache();
  var signature = [
    payload.demo_id || payload.demoId,
    payload.email,
    payload.phone
  ].join('|').toLowerCase();

  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, signature)
    .map(function(b) { return (b < 0 ? b + 256 : b).toString(16); }).join('');

  if (cache.get(hash)) {
    return true;
  }
  cache.put(hash, '1', 60);
  return false;
}

// ==============================================================================
// 16. RETRY FUNCTIONS (retryFailedFrappeLeads)
// ==============================================================================
function retryFailedFrappeLeads() {
  var config = getConfig();
  if (!config.frappeApiKey || !config.frappeApiSecret) {
    Logger.log('[Retry Abort] Frappe credentials not configured.');
    return { status: 'ABORTED', reason: 'NO_FRAPPE_CREDENTIALS' };
  }

  var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    Logger.log('[Retry Abort] Spreadsheet unreachable.');
    return { status: 'ABORTED', reason: 'NO_SPREADSHEET' };
  }

  var totalRetried = 0;
  var totalSuccess = 0;

  Object.keys(DEMO_REGISTRY).forEach(function(key) {
    var demoDef = DEMO_REGISTRY[key];
    var sheet = ss.getSheetByName(demoDef.sheetName);
    if (!sheet) return;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var frappeStatus = row[24]; // Col 25: Frappe Status (0-indexed: 24)

      if (frappeStatus === 'FAILED' || frappeStatus === 'PENDING_CONFIG') {
        totalRetried++;
        var record = {
          submissionId: row[0],
          demoId: row[2],
          industry: row[3],
          clientName: row[4],
          leadType: row[5],
          name: row[6],
          email: row[7],
          phone: row[8],
          company: row[9],
          service: row[10],
          requirement: row[11],
          projectType: row[12],
          budget: row[13],
          preferredDate: row[14],
          preferredTime: row[15],
          message: row[16],
          source: row[17],
          sourcePage: row[18]
        };

        var res = forwardLeadToFrappeCRM(record, demoDef, config);
        if (res.status === 'SUCCESS') {
          totalSuccess++;
          sheet.getRange(i + 1, 25).setValue('SUCCESS');
          sheet.getRange(i + 1, 26).setValue(res.leadId);
          logSystemEvent(demoDef.demoId, record.submissionId, 'RETRY_SUCCESS', 'SUCCESS', 'Lead synced via retry cron as ' + res.leadId, 'NONE', 'Retry successful', 1, config);
        } else {
          logSystemEvent(demoDef.demoId, record.submissionId, 'RETRY_FAILED', 'FAILED', 'Retry attempt failed: ' + res.message, 'RETRY_ERROR', res.message, 1, config);
        }
      }
    }
  });

  Logger.log('[Retry Run Completed] Processed: ' + totalRetried + ' | Succeeded: ' + totalSuccess);
  return {
    status: 'COMPLETED',
    retried: totalRetried,
    succeeded: totalSuccess
  };
}

// ==============================================================================
// 17. UTILITY FUNCTIONS
// ==============================================================================
function sendJsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
