/**
 * ==============================================================================
 * SCALENOVA SYSTEMS — MASTER CLIENT PRODUCTION GATEWAY (Code.gs)
 * Standard: ScaleNova Client Production Architecture & Operations Manual v1.0
 * Entity: ScaleNova Private Limited (CIN: U72900AP2026PTC123456)
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
 * Target Central Spreadsheet: "Demo Lead Captures — ScaleNova"
 * Worksheets:
 *  - "Demo 1 - Professional"
 *  - "Demo 2 - Manufacturing"
 *  - "Demo 3 - Real Estate"
 *  - "Demo 4 - Education"
 *  - "Demo 5 - Healthcare"
 *  - "System Log"
 *
 * Standard 23-Column Schema:
 *  1. Submission ID
 *  2. Created At
 *  3. Demo ID
 *  4. Industry
 *  5. Client Name
 *  6. Name
 *  7. Email
 *  8. Phone
 *  9. Company
 * 10. Service
 * 11. Lead Type
 * 12. Requirement
 * 13. Budget
 * 14. Preferred Date
 * 15. Preferred Time
 * 16. Message
 * 17. Source
 * 18. Source Page
 * 19. Status
 * 20. Owner
 * 21. Frappe Status
 * 22. Last Contacted
 * 23. Notes
 *
 * SENDER IDENTITY:
 *  demo@scalenovasys.com (configured via Script Property DEMO_EMAIL)
 *
 * NOTIFICATION FLOW:
 *  1. Owner / Sales Notification Alert (HTML Hot Lead Alert)
 *  2. Branded Customer Confirmation Email (Unique per Demo Client)
 *  3. Frappe CRM REST API Push (Fail-Safe, never blocks Google Sheet capture)
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Script Properties Configuration Accessor
// ------------------------------------------------------------------------------
function getGatewayConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    spreadsheetId: props['SPREADSHEET_ID'] || '',
    ownerEmail: props['OWNER_EMAIL'] || props['NOTIFICATION_EMAIL'] || 'support@scalenovasys.com',
    notificationEmail: props['NOTIFICATION_EMAIL'] || props['OWNER_EMAIL'] || 'support@scalenovasys.com',
    demoEmail: props['DEMO_EMAIL'] || 'demo@scalenovasys.com',
    frappeUrl: (props['FRAPPE_API_URL'] || 'https://demo.scalenovasys.com').replace(/\/+$/, ''),
    frappeApiKey: props['FRAPPE_API_KEY'] || '',
    frappeApiSecret: props['FRAPPE_API_SECRET'] || '',
    environment: props['ENVIRONMENT'] || 'production',
    enableClientConfirmation: props['ENABLE_CLIENT_CONFIRMATION'] !== 'false'
  };
}

// ------------------------------------------------------------------------------
// 2. Demo Registry & Industry Mapping
// ------------------------------------------------------------------------------
var DEMO_REGISTRY = {
  'DEMO-01': {
    name: 'Nexora Advisory',
    industry: 'Professional & B2B Services',
    sheetName: 'Demo 1 - Professional',
    idPrefix: 'SN-NEX',
    accentColor: '#0B132B',
    accentHighlight: '#00B4D8',
    domain: 'demo1.scalenovasys.com'
  },
  'DEMO-02': {
    name: 'ForgeCore Industries',
    industry: 'Manufacturing & Industrial SMEs',
    sheetName: 'Demo 2 - Manufacturing',
    idPrefix: 'SN-FOR',
    accentColor: '#121214',
    accentHighlight: '#F59E0B',
    domain: 'demo2.scalenovasys.com'
  },
  'DEMO-03': {
    name: 'Aurelia Estates',
    industry: 'Real Estate & Construction',
    sheetName: 'Demo 3 - Real Estate',
    idPrefix: 'SN-AUR',
    accentColor: '#141312',
    accentHighlight: '#C5A880',
    domain: 'demo3.scalenovasys.com'
  },
  'DEMO-04': {
    name: 'Bloombridge Academy',
    industry: 'Education & Training',
    sheetName: 'Demo 4 - Education',
    idPrefix: 'SN-BLO',
    accentColor: '#2D1B69',
    accentHighlight: '#7C3AED',
    domain: 'demo4.scalenovasys.com'
  },
  'DEMO-05': {
    name: 'VitaNova Health',
    industry: 'Healthcare & Clinics',
    sheetName: 'Demo 5 - Healthcare',
    idPrefix: 'SN-VIT',
    accentColor: '#0A2540',
    accentHighlight: '#0D9488',
    domain: 'demo5.scalenovasys.com'
  }
};

// ------------------------------------------------------------------------------
// 3. HTTPS POST Webhook Entrypoint
// ------------------------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = lock.tryLock(15000); // 15-second concurrency guard

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

    // Bot mitigation: Honeypot trap check
    if (payload.website_hp || payload.booking_hp || payload.company_hp || payload.website_trap) {
      Logger.log('[Security Notice] Honeypot trap triggered. Request silently dropped.');
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
    var name = clean(payload.name || payload.full_name);
    var email = clean(payload.email || payload.email_id);
    var phone = clean(payload.phone || payload.mobile_no);
    var company = clean(payload.company || payload.company_name) || 'Direct Client';
    var service = clean(payload.service || payload.service_interest) || 'General Inquiry';
    var requirement = clean(payload.requirement || payload.projectType || payload.treatment || payload.program) || 'Standard Scope';
    var budget = clean(payload.budget || payload.budgetRange) || 'Confidential';
    var preferredDate = clean(payload.preferredDate || payload.date || payload.appointment_date);
    var preferredTime = clean(payload.preferredTime || payload.time || payload.appointment_time);
    var message = clean(payload.message || payload.inquiry || payload.notes);
    var source = clean(payload.sourceWebsite || payload.source) || (demoDef.name + ' Website');
    var page = clean(payload.page || payload.source_page) || 'Home';
    var leadType = clean(payload.leadType || payload.type || 'LEAD').toUpperCase();
    var createdAt = new Date().toISOString();

    if (!name || !email) {
      return sendJsonResponse({
        status: 'error',
        code: 'MISSING_FIELDS',
        message: 'Name and email are mandatory fields.'
      }, 422);
    }

    // Generate Unique Submission ID
    var submissionId = generateSubmissionId(demoDef.idPrefix);

    // 1. Write Record to Google Sheet (23 Columns)
    var record = {
      submissionId: submissionId,
      createdAt: createdAt,
      demoId: demoId,
      industry: demoDef.industry,
      clientName: demoDef.name,
      name: name,
      email: email,
      phone: phone,
      company: company,
      service: service,
      leadType: leadType,
      requirement: requirement,
      budget: budget,
      preferredDate: preferredDate,
      preferredTime: preferredTime,
      message: message,
      source: source,
      page: page,
      status: 'Open',
      owner: 'ScaleNova Partner',
      frappeStatus: 'PENDING',
      lastContacted: '',
      notes: 'Ingested via ScaleNova ' + demoDef.name + ' (' + page + ')'
    };

    var sheetResult = writeRecordToSheet(record, demoDef, config);

    // 2. Dispatch Notifications (Owner Alert + Branded Customer Confirmation)
    sendTransactionalEmails({
      record: record,
      demoDef: demoDef,
      config: config
    });

    // 3. Asynchronously Forward to Frappe CRM REST API
    var frappeStatus = forwardToFrappeCRM(record, demoDef, config);

    // Update Frappe status in sheet if row was appended
    if (sheetResult.success && sheetResult.sheet && sheetResult.rowIndex) {
      try {
        // Column 21 is Frappe Status
        sheetResult.sheet.getRange(sheetResult.rowIndex, 21).setValue(frappeStatus);
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
      sheetTab: demoDef.sheetName,
      frappeStatus: frappeStatus,
      message: 'Submission successfully recorded in ScaleNova Operating System.'
    });

  } catch (err) {
    Logger.log('[Critical Failure] ' + err.toString() + '\n' + err.stack);
    logToSystemLog(err.toString(), 'ERROR', getGatewayConfig());
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
// 4. HTTPS GET Health Check Handler
// ------------------------------------------------------------------------------
function doGet(e) {
  var config = getGatewayConfig();
  return sendJsonResponse({
    status: 'ok',
    service: 'ScaleNova Five Industry EliteOS Integration Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    configured: {
      hasSpreadsheetId: Boolean(config.spreadsheetId),
      hasOwnerEmail: Boolean(config.ownerEmail),
      hasFrappeCredentials: Boolean(config.frappeUrl && config.frappeApiKey),
      demoEmail: config.demoEmail,
      environment: config.environment
    },
    supportedDemos: Object.keys(DEMO_REGISTRY).map(function(key) {
      return {
        demoId: key,
        client: DEMO_REGISTRY[key].name,
        industry: DEMO_REGISTRY[key].industry,
        sheetTab: DEMO_REGISTRY[key].sheetName,
        domain: DEMO_REGISTRY[key].domain
      };
    })
  });
}

// ------------------------------------------------------------------------------
// 5. Google Sheet Writer (Exact 23 Standard Columns)
// ------------------------------------------------------------------------------
var STANDARD_HEADERS = [
  'Submission ID',
  'Created At',
  'Demo ID',
  'Industry',
  'Client Name',
  'Name',
  'Email',
  'Phone',
  'Company',
  'Service',
  'Lead Type',
  'Requirement',
  'Budget',
  'Preferred Date',
  'Preferred Time',
  'Message',
  'Source',
  'Source Page',
  'Status',
  'Owner',
  'Frappe Status',
  'Last Contacted',
  'Notes'
];

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
      sheet.appendRow(STANDARD_HEADERS);
      formatSheetHeaders(sheet, demoDef.accentColor);
    }

    sheet.appendRow([
      data.submissionId,
      data.createdAt,
      data.demoId,
      data.industry,
      data.clientName,
      data.name,
      data.email,
      data.phone,
      data.company,
      data.service,
      data.leadType,
      data.requirement,
      data.budget,
      data.preferredDate,
      data.preferredTime,
      data.message,
      data.source,
      data.page,
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
  var range = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length);
  range.setBackground(headerBgColor || '#0B132B');
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function logToSystemLog(message, level, config) {
  try {
    var ss = config.spreadsheetId ? SpreadsheetApp.openById(config.spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    var logSheet = ss.getSheetByName('System Log');
    if (!logSheet) {
      logSheet = ss.insertSheet('System Log');
      logSheet.appendRow(['Timestamp', 'Level', 'Message']);
      var range = logSheet.getRange(1, 1, 1, 3);
      range.setBackground('#1E293B');
      range.setFontColor('#FFFFFF');
      logSheet.setFrozenRows(1);
    }
    logSheet.appendRow([new Date().toISOString(), level || 'INFO', message]);
  } catch (e) {
    // Fail silently to prevent cascade errors
  }
}

// ------------------------------------------------------------------------------
// 6. Transactional Email Engine (Dual Workflow)
// ------------------------------------------------------------------------------
function sendTransactionalEmails(params) {
  var data = params.record;
  var demoDef = params.demoDef;
  var config = params.config;
  var senderEmail = config.demoEmail || 'demo@scalenovasys.com';

  // A. Internal Hot Lead Alert to ScaleNova Team
  var recipient = config.ownerEmail || config.notificationEmail;
  if (recipient) {
    try {
      var subject = 'NEW LEAD ALERT: [' + demoDef.name + '] ' + data.service + ' — Ref #' + data.submissionId;
      var whatsappLink = data.phone ? 'https://wa.me/' + data.phone.replace(/[^0-9]/g, '') : '';
      
      var ownerHtml = 
        '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width:640px; margin:auto; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">' +
          '<div style="background:' + demoDef.accentColor + '; padding:24px; color:#FFFFFF;">' +
            '<span style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:' + demoDef.accentHighlight + '; font-weight:700;">ScaleNova Hot Lead Alert • Action Required <30m</span>' +
            '<h2 style="margin:6px 0 0; font-size:22px; font-weight:600;">' + demoDef.name + '</h2>' +
            '<p style="margin:4px 0 0; font-size:13px; color:#CBD5E1;">' + demoDef.industry + ' • Action: ' + data.leadType + '</p>' +
          '</div>' +
          '<div style="padding:24px; color:#1E293B; font-size:14px; line-height:1.6;">' +
            '<table style="width:100%; border-collapse:collapse; margin-bottom:18px;">' +
              '<tr><td style="padding:6px 0; color:#64748B; width:140px;">Submission Ref:</td><td style="font-weight:700; color:#0F172A;">#' + data.submissionId + '</td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Prospect Name:</td><td style="font-weight:600;">' + data.name + '</td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Business Email:</td><td><a href="mailto:' + data.email + '" style="color:' + demoDef.accentHighlight + ';">' + data.email + '</a></td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Phone:</td><td>' + (data.phone || '—') + (whatsappLink ? ' &nbsp;<a href="' + whatsappLink + '" style="color:#10B981; font-weight:600; text-decoration:none;">[Chat on WhatsApp]</a>' : '') + '</td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Organization:</td><td>' + data.company + '</td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Service / Offering:</td><td style="font-weight:600;">' + data.service + '</td></tr>' +
              '<tr><td style="padding:6px 0; color:#64748B;">Requirement:</td><td>' + data.requirement + '</td></tr>' +
              (data.preferredDate ? '<tr><td style="padding:6px 0; color:#64748B;">Preferred Slot:</td><td style="font-weight:700; color:' + demoDef.accentHighlight + ';">' + data.preferredDate + ' @ ' + data.preferredTime + '</td></tr>' : '') +
              (data.budget && data.budget !== 'Confidential' ? '<tr><td style="padding:6px 0; color:#64748B;">Budget Range:</td><td>' + data.budget + '</td></tr>' : '') +
              '<tr><td style="padding:6px 0; color:#64748B;">Source Page:</td><td>' + data.page + ' (' + data.source + ')</td></tr>' +
            '</table>' +
            '<div style="background:#FFFFFF; border:1px solid #E2E8F0; padding:16px; border-radius:6px; margin-top:12px;">' +
              '<strong style="color:#475569; font-size:12px; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:6px;">Inquiry / Scope Message:</strong>' +
              (data.message || 'No additional scope notes provided.').replace(/\n/g, '<br>') +
            '</div>' +
          '</div>' +
          '<div style="background:#F1F5F9; padding:14px; font-size:12px; color:#64748B; text-align:center; border-top:1px solid #E2E8F0;">' +
            'ScaleNova Business OS Unified Gateway • Dispatched from ' + senderEmail +
          '</div>' +
        '</div>';

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: ownerHtml,
        replyTo: data.email
      });
    } catch (ownerErr) {
      Logger.log('[Owner Email Warning] ' + ownerErr.message);
    }
  }

  // B. Branded Customer Confirmation Email
  if (config.enableClientConfirmation && data.email) {
    try {
      var clientSubject = 'Thank You for Contacting ' + demoDef.name + ' — Ref #' + data.submissionId;
      var clientHtml = 
        '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width:600px; margin:auto; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">' +
          '<div style="background:' + demoDef.accentColor + '; padding:28px; color:#FFFFFF;">' +
            '<span style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:' + demoDef.accentHighlight + '; font-weight:700;">' + demoDef.industry + '</span>' +
            '<h2 style="margin:4px 0 0; font-size:24px; font-weight:600;">' + demoDef.name + '</h2>' +
          '</div>' +
          '<div style="padding:28px; color:#1E293B; font-size:15px; line-height:1.7;">' +
            '<p style="margin-top:0;">Dear ' + data.name + ',</p>' +
            '<p>Thank you for reaching out to <strong>' + demoDef.name + '</strong>. We have registered your inquiry under reference <strong>#' + data.submissionId + '</strong>.</p>' +
            (data.preferredDate ? 
              '<div style="background:#F8FAFC; border-left:4px solid ' + demoDef.accentHighlight + '; padding:16px; margin:20px 0; border-radius:4px;">' +
                '<strong style="color:#0F172A; display:block; margin-bottom:4px;">Requested Consultation Slot:</strong>' +
                'Date: <strong>' + data.preferredDate + '</strong><br>' +
                'Time: <strong>' + data.preferredTime + '</strong>' +
              '</div>' : '') +
            '<p>Our advisory and technical team is reviewing your requirement (' + data.service + ') and will contact you within 24 business hours.</p>' +
            '<p>If you have urgent questions, reply directly to this email or visit our portal at <a href="https://' + demoDef.domain + '" style="color:' + demoDef.accentHighlight + '; font-weight:600;">' + demoDef.domain + '</a>.</p>' +
            '<p style="margin-bottom:0;">Warm regards,<br><strong>The ' + demoDef.name + ' Client Care Team</strong></p>' +
          '</div>' +
          '<div style="background:#F8FAFC; padding:16px; font-size:12px; color:#94A3B8; text-align:center; border-top:1px solid #E2E8F0;">' +
            demoDef.name + ' • ScaleNova EliteOS Client Platform • All rights reserved.' +
          '</div>' +
        '</div>';

      MailApp.sendEmail({
        to: data.email,
        subject: clientSubject,
        htmlBody: clientHtml,
        replyTo: senderEmail
      });
    } catch (clientErr) {
      Logger.log('[Client Email Warning] ' + clientErr.message);
    }
  }
}

// ------------------------------------------------------------------------------
// 7. Frappe CRM REST API Integration (Fail-Safe)
// ------------------------------------------------------------------------------
function forwardToFrappeCRM(data, demoDef, config) {
  if (!config.frappeUrl || !config.frappeApiKey || !config.frappeApiSecret) {
    Logger.log('[Info] Frappe credentials not fully configured in Script Properties.');
    return 'PENDING_CONFIG';
  }

  var endpoint = config.frappeUrl + '/api/resource/Lead';
  var leadPayload = {
    doctype: 'Lead',
    lead_name: data.name,
    email_id: data.email,
    mobile_no: data.phone,
    company_name: data.company,
    source: 'ScaleNova Demo — ' + demoDef.industry,
    status: 'Lead',
    custom_demo_id: data.demoId,
    custom_submission_id: data.submissionId,
    notes: 'Demo ID: ' + data.demoId + '\nClient: ' + demoDef.name + '\nIndustry: ' + demoDef.industry + 
           '\nSubmission ID: ' + data.submissionId + '\nLead Type: ' + data.leadType + 
           '\nService: ' + data.service + '\nRequirement: ' + data.requirement + 
           '\nBudget: ' + data.budget + 
           (data.preferredDate ? '\nPreferred Slot: ' + data.preferredDate + ' @ ' + data.preferredTime : '') + 
           '\nSource Page: ' + data.page + '\n\nMessage: ' + data.message
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
// 8. Utility Functions
// ------------------------------------------------------------------------------
function generateSubmissionId(prefix) {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'GMT', 'yyyyMMdd');
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
