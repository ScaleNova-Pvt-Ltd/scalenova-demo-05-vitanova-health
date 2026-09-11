/**
 * ==============================================================================
 * SCALENOVA SYSTEMS — FIVE INDUSTRY ELITEOS DEMO INTEGRATION GATEWAY
 * Master Google Apps Script Web App Broker (Code.gs)
 * ==============================================================================
 * 
 * ARCHITECTURE:
 * Five Industry Client Frontends:
 *  - DEMO-01: Nexora Advisory (Professional & B2B Services)
 *  - DEMO-02: ForgeCore Industries (Manufacturing & Industrial SMEs)
 *  - DEMO-03: Aurelia Estates (Real Estate & Construction)
 *  - DEMO-04: Bloombridge Academy (Education & Training)
 *  - DEMO-05: VitaNova Health (Healthcare & Clinics)
 * 
 *                  │ HTTPS POST (Unified JSON Envelope)
 *                  ▼
 *        [Google Apps Script Gateway]
 *                  │
 *       ┌──────────┼──────────┐
 *       ▼          ▼          ▼
 * [Google Sheet] [Emails] [Frappe CRM API]
 * 
 * SECURITY:
 * Pure server-side secret isolation via Script Properties.
 * Zero tokens, credentials, or private sheet IDs in frontend code.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Script Properties Configuration Accessor
// ------------------------------------------------------------------------------
function getGatewayConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    spreadsheetId: props['SPREADSHEET_ID'] || '',
    ownerEmail: props['OWNER_EMAIL'] || '',
    notificationEmail: props['NOTIFICATION_EMAIL'] || '',
    frappeUrl: (props['FRAPPE_API_URL'] || '').replace(/\/+$/, ''),
    frappeApiKey: props['FRAPPE_API_KEY'] || '',
    frappeApiSecret: props['FRAPPE_API_SECRET'] || '',
    enableClientConfirmation: props['ENABLE_CLIENT_CONFIRMATION'] !== 'false'
  };
}

// Industry & Demo Mapping Registry
var DEMO_REGISTRY = {
  'DEMO-01': {
    name: 'Nexora Advisory',
    industry: 'Professional & B2B Services',
    sheetName: 'Demo1_Professional',
    idPrefix: 'SN-NEX',
    accentColor: '#0B132B',
    accentHighlight: '#00B4D8'
  },
  'DEMO-02': {
    name: 'ForgeCore Industries',
    industry: 'Manufacturing & Industrial SMEs',
    sheetName: 'Demo2_Manufacturing',
    idPrefix: 'SN-FOR',
    accentColor: '#121214',
    accentHighlight: '#F59E0B'
  },
  'DEMO-03': {
    name: 'Aurelia Estates',
    industry: 'Real Estate & Construction',
    sheetName: 'Demo3_RealEstate',
    idPrefix: 'SN-AUR',
    accentColor: '#141312',
    accentHighlight: '#C5A880'
  },
  'DEMO-04': {
    name: 'Bloombridge Academy',
    industry: 'Education & Training',
    sheetName: 'Demo4_Education',
    idPrefix: 'SN-BLO',
    accentColor: '#2D1B69',
    accentHighlight: '#7C3AED'
  },
  'DEMO-05': {
    name: 'VitaNova Health',
    industry: 'Healthcare & Clinics',
    sheetName: 'Demo5_Healthcare',
    idPrefix: 'SN-VIT',
    accentColor: '#0A2540',
    accentHighlight: '#0D9488'
  }
};

// ------------------------------------------------------------------------------
// 2. HTTPS POST Webhook Handler
// ------------------------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(10000); // Concurrency guard

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return sendJsonResponse({
        status: 'error',
        code: 'EMPTY_PAYLOAD',
        message: 'No payload detected in incoming request.'
      }, 400);
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return sendJsonResponse({
        status: 'error',
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload: ' + parseErr.message
      }, 400);
    }

    // Honeypot spam trap
    if (payload.website_hp || payload.booking_hp || payload.company_hp) {
      Logger.log('[Security Notice] Honeypot triggered. Silent drop.');
      return sendJsonResponse({
        status: 'success',
        submissionId: 'SN-SPAM-FILTERED',
        message: 'Inquiry received.'
      });
    }

    // Resolve Demo Definition
    var demoId = (payload.demoId || payload.demo_id || 'DEMO-01').toUpperCase();
    var demoDef = DEMO_REGISTRY[demoId] || DEMO_REGISTRY['DEMO-01'];
    var config = getGatewayConfig();

    // Data Extraction & Sanitization
    var name = clean(payload.name);
    var email = clean(payload.email);
    var phone = clean(payload.phone);
    var company = clean(payload.company) || 'Direct Client';
    var service = clean(payload.service) || 'General Inquiry';
    var requirement = clean(payload.requirement) || clean(payload.projectType) || 'Standard Scope';
    var budget = clean(payload.budget) || clean(payload.budgetRange) || 'Confidential';
    var preferredDate = clean(payload.preferredDate || payload.date);
    var preferredTime = clean(payload.preferredTime || payload.time);
    var message = clean(payload.message);
    var source = clean(payload.sourceWebsite || payload.source) || (demoDef.name + ' Website');
    var page = clean(payload.page) || 'Home';
    var leadType = clean(payload.leadType || payload.type || 'LEAD').toUpperCase();
    var createdAt = new Date().toISOString();

    if (!name || !email) {
      return sendJsonResponse({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'Name and email are mandatory fields.'
      }, 422);
    }

    // Generate Deterministic Submission ID
    var submissionId = generateSubmissionId(demoDef.idPrefix);

    // 1. Write to Google Sheet (Operational Capture Layer)
    var sheetResult = writeRecordToSheet({
      submissionId: submissionId,
      createdAt: createdAt,
      demoId: demoId,
      industry: demoDef.industry,
      name: name,
      email: email,
      phone: phone,
      company: company,
      service: service,
      requirement: requirement,
      budget: budget,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      message: message,
      source: source,
      page: page,
      leadType: leadType,
      status: 'Open',
      owner: 'ScaleNova Partner',
      frappeStatus: 'PENDING',
      lastContacted: '',
      notes: 'Ingested via ScaleNova ' + demoDef.name
    }, demoDef, config);

    // 2. Dispatch Emails
    sendTransactionalEmails({
      submissionId: submissionId,
      demoDef: demoDef,
      leadType: leadType,
      name: name,
      email: email,
      phone: phone,
      company: company,
      service: service,
      requirement: requirement,
      budget: budget,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      message: message,
      source: source,
      createdAt: createdAt
    }, config);

    // 3. Dispatch to Frappe CRM REST API
    var frappeStatus = forwardToFrappeCRM({
      submissionId: submissionId,
      demoId: demoId,
      industry: demoDef.industry,
      demoName: demoDef.name,
      leadType: leadType,
      name: name,
      email: email,
      phone: phone,
      company: company,
      service: service,
      requirement: requirement,
      budget: budget,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      message: message,
      source: source,
      createdAt: createdAt
    }, config);

    // Update Frappe status in sheet if row was added
    if (sheetResult.success && sheetResult.sheet && sheetResult.rowIndex) {
      try {
        sheetResult.sheet.getRange(sheetResult.rowIndex, 20).setValue(frappeStatus);
      } catch (updateErr) {
        Logger.log('[Warning] Could not update Frappe status column: ' + updateErr.message);
      }
    }

    return sendJsonResponse({
      status: 'success',
      submissionId: submissionId,
      demoId: demoId,
      leadType: leadType,
      sheetLogged: sheetResult.success,
      frappeStatus: frappeStatus,
      message: 'Submission successfully recorded in ScaleNova Operating System.'
    });

  } catch (err) {
    Logger.log('[Critical Failure] ' + err.toString() + '\n' + err.stack);
    logToSystemLog(err.toString(), 'ERROR', config);
    return sendJsonResponse({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal gateway processing error: ' + err.message
    }, 500);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

// ------------------------------------------------------------------------------
// 3. HTTPS GET Health Check Handler
// ------------------------------------------------------------------------------
function doGet(e) {
  var config = getGatewayConfig();
  return sendJsonResponse({
    status: 'ok',
    service: 'ScaleNova Five Industry EliteOS Integration Gateway',
    timestamp: new Date().toISOString(),
    configured: {
      hasSpreadsheetId: Boolean(config.spreadsheetId),
      hasOwnerEmail: Boolean(config.ownerEmail),
      hasFrappeCredentials: Boolean(config.frappeUrl && config.frappeApiKey)
    },
    demosSupported: Object.keys(DEMO_REGISTRY)
  });
}

// ------------------------------------------------------------------------------
// 4. Google Sheet Writer (Auto-Provisioning 22 Standard Columns)
// ------------------------------------------------------------------------------
function writeRecordToSheet(data, demoDef, config) {
  try {
    var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('[Warning] Target spreadsheet not accessible.');
      return { success: false, reason: 'NO_SPREADSHEET' };
    }

    var sheet = ss.getSheetByName(demoDef.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(demoDef.sheetName);
      // Auto-Provision 22 Columns
      sheet.appendRow([
        'Submission ID', 'Created At', 'Demo ID', 'Industry', 'Name',
        'Email', 'Phone', 'Company', 'Service', 'Requirement',
        'Budget', 'Preferred Date', 'Preferred Time', 'Message', 'Source',
        'Page', 'Lead Type', 'Status', 'Owner', 'Frappe Status',
        'Last Contacted', 'Notes'
      ]);
      formatSheetHeaders(sheet, demoDef.accentColor);
    }

    sheet.appendRow([
      data.submissionId,
      data.createdAt,
      data.demoId,
      data.industry,
      data.name,
      data.email,
      data.phone,
      data.company,
      data.service,
      data.requirement,
      data.budget,
      data.preferredDate,
      data.preferredTime,
      data.message,
      data.source,
      data.page,
      data.leadType,
      data.status,
      data.owner,
      data.frappeStatus,
      data.lastContacted,
      data.notes
    ]);

    var lastRow = sheet.getLastRow();
    return { success: true, sheet: sheet, rowIndex: lastRow };
  } catch (err) {
    Logger.log('[Sheet Write Error] ' + err.message);
    logToSystemLog('Sheet Write Error: ' + err.message, 'WARN', config);
    return { success: false, error: err.message };
  }
}

function formatSheetHeaders(sheet, headerBgColor) {
  var range = sheet.getRange(1, 1, 1, 22);
  range.setBackground(headerBgColor || '#0B132B');
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function logToSystemLog(message, level, config) {
  try {
    var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    var logSheet = ss.getSheetByName('System_Log');
    if (!logSheet) {
      logSheet = ss.insertSheet('System_Log');
      logSheet.appendRow(['Timestamp', 'Level', 'Message']);
      var range = logSheet.getRange(1, 1, 1, 3);
      range.setBackground('#333333');
      range.setFontColor('#FFFFFF');
      logSheet.setFrozenRows(1);
    }
    logSheet.appendRow([new Date().toISOString(), level || 'INFO', message]);
  } catch (e) {
    // Silent fail
  }
}

// ------------------------------------------------------------------------------
// 5. Transactional Email Dispatcher
// ------------------------------------------------------------------------------
function sendTransactionalEmails(data, config) {
  var recipient = config.ownerEmail || config.notificationEmail;

  // A. Internal Owner Alert
  if (recipient) {
    try {
      var subject = 'New ' + data.leadType + ' — ' + data.demoDef.demoId + ' — ' + data.demoDef.name + ' — #' + data.submissionId;
      var html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:640px; margin:auto; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; overflow:hidden;">
          <div style="background:${data.demoDef.accentColor}; padding:24px; color:#FFFFFF;">
            <span style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:${data.demoDef.accentHighlight}; font-weight:600;">ScaleNova Operations Alert</span>
            <h2 style="margin:6px 0 0; font-size:22px; font-weight:600;">${data.demoDef.name}</h2>
            <p style="margin:4px 0 0; font-size:13px; color:#CBD5E1;">${data.demoDef.industry} • Action: ${data.leadType}</p>
          </div>
          <div style="padding:24px; color:#1E293B; font-size:14px; line-height:1.6;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
              <tr><td style="padding:6px 0; color:#64748B; width:140px;">Submission Ref:</td><td style="font-weight:700; color:#0F172A;">${data.submissionId}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Client Name:</td><td style="font-weight:600;">${data.name}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Email:</td><td><a href="mailto:${data.email}" style="color:${data.demoDef.accentHighlight};">${data.email}</a></td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Phone:</td><td>${data.phone || '—'}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Organization:</td><td>${data.company || '—'}</td></tr>
              <tr><td style="padding:6px 0; color:#64748B;">Service / Subject:</td><td>${data.service}</td></tr>
              ${data.preferredDate ? `<tr><td style="padding:6px 0; color:#64748B;">Preferred Slot:</td><td style="font-weight:600; color:${data.demoDef.accentHighlight};">${data.preferredDate} @ ${data.preferredTime}</td></tr>` : ''}
              ${data.budget ? `<tr><td style="padding:6px 0; color:#64748B;">Budget Range:</td><td>${data.budget}</td></tr>` : ''}
            </table>
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; padding:16px; border-radius:4px; margin-top:12px;">
              <strong style="color:#475569; font-size:12px; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:6px;">Inquiry Brief:</strong>
              ${(data.message || 'No additional message provided.').replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="background:#F1F5F9; padding:14px; font-size:12px; color:#64748B; text-align:center; border-top:1px solid #E2E8F0;">
            ScaleNova Systems Unified Operating Gateway • Synced to Frappe CRM
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: html
      });
    } catch (e) {
      Logger.log('[Owner Email Warning] ' + e.message);
    }
  }

  // B. Customer Confirmation Email
  if (config.enableClientConfirmation && data.email) {
    try {
      var clientSubject = 'Thank you for contacting ' + data.demoDef.name + ' — #' + data.submissionId;
      var clientHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:600px; margin:auto; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; overflow:hidden;">
          <div style="background:${data.demoDef.accentColor}; padding:28px; color:#FFFFFF;">
            <h2 style="margin:0; font-size:24px; font-weight:600;">${data.demoDef.name}</h2>
            <p style="margin:4px 0 0; font-size:13px; color:#94A3B8;">${data.demoDef.industry}</p>
          </div>
          <div style="padding:28px; color:#1E293B; font-size:15px; line-height:1.7;">
            <p style="margin-top:0;">Dear ${data.name},</p>
            <p>Thank you for reaching out to ${data.demoDef.name}. We have registered your request under reference <strong>${data.submissionId}</strong>.</p>
            
            ${data.preferredDate ? `
              <div style="background:#F8FAFC; border-left:4px solid ${data.demoDef.accentHighlight}; padding:16px; margin:20px 0; border-radius:2px;">
                <strong style="color:#0F172A; display:block; margin-bottom:4px;">Requested Appointment:</strong>
                Date: <strong>${data.preferredDate}</strong><br>
                Time: <strong>${data.preferredTime}</strong>
              </div>
            ` : ''}

            <p>Our advisory and technical team will review your requirements and respond within one business day.</p>
            <p style="margin-bottom:0;">Sincerely,<br><strong>The ${data.demoDef.name} Client Team</strong></p>
          </div>
        </div>
      `;

      MailApp.sendEmail({
        to: data.email,
        subject: clientSubject,
        htmlBody: clientHtml
      });
    } catch (e) {
      Logger.log('[Client Email Warning] ' + e.message);
    }
  }
}

// ------------------------------------------------------------------------------
// 6. Frappe CRM REST Integration (Fail-Safe)
// ------------------------------------------------------------------------------
function forwardToFrappeCRM(data, config) {
  if (!config.frappeUrl || !config.frappeApiKey || !config.frappeApiSecret) {
    Logger.log('[Info] Frappe credentials not configured in Script Properties.');
    return 'NOT_CONFIGURED';
  }

  var endpoint = config.frappeUrl + '/api/resource/Lead';
  var leadPayload = {
    doctype: 'Lead',
    lead_name: data.name,
    email_id: data.email,
    mobile_no: data.phone,
    company_name: data.company,
    source: 'ScaleNova Demo — ' + data.industry,
    status: 'Lead',
    notes: 'Demo ID: ' + data.demoId + '\nClient: ' + data.demoName + '\nSubmission ID: ' + data.submissionId + '\nAction: ' + data.leadType + '\nService: ' + data.service + '\nRequirement: ' + data.requirement + '\nBudget: ' + data.budget + '\n\nMessage: ' + data.message
  };

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
    if (code >= 200 && code < 300) {
      Logger.log('[Frappe Sync Success] Code: ' + code);
      return 'SYNCED';
    } else {
      Logger.log('[Frappe Sync Failed] Code: ' + code + ' Response: ' + response.getContentText());
      return 'FAILED';
    }
  } catch (err) {
    Logger.log('[Frappe Exception] ' + err.message);
    return 'FAILED';
  }
}

// ------------------------------------------------------------------------------
// 7. Helpers
// ------------------------------------------------------------------------------
function generateSubmissionId(prefix) {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'GMT', 'yyyyMM');
  var rand = Math.floor(1000 + Math.random() * 9000);
  return prefix + '-' + dateStr + '-' + rand;
}

function clean(val) {
  if (!val) return '';
  return String(val).trim();
}

function sendJsonResponse(obj, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
