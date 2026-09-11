/**
 * System Validation Test Suite — Demo 05: VitaNova Health
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✖\x1b[0m ${msg}`);
  }
}

console.log('\n\x1b[1m[ScaleNova Demo 05] Validating VitaNova Health Integrity...\x1b[0m\n');

// 1. Pages check
const requiredPages = [
  'index.html', 'about.html', 'specialties.html', 'specialist-detail.html',
  'treatments.html', 'facilities.html', 'patient-experience.html',
  'wellness.html', 'book-appointment.html', 'health-insights.html',
  'contact.html', 'privacy.html'
];
requiredPages.forEach(p => {
  assert(fs.existsSync(path.join(rootDir, p)), `Page exists: ${p}`);
});

// 2. Secret check
const frontendFiles = ['index.html', 'book-appointment.html', 'contact.html', 'src/config/index.js', 'src/services/api.js'];
frontendFiles.forEach(f => {
  const code = fs.readFileSync(path.join(rootDir, f), 'utf8');
  assert(!code.includes('FRAPPE_API_SECRET ='), `${f}: No hardcoded Frappe API secret`);
  assert(!/1[a-zA-Z0-9_-]{43}/.test(code), `${f}: No hardcoded Google Sheet ID`);
});

// 3. Schema & Integration check
const configCode = fs.readFileSync(path.join(rootDir, 'src/config/index.js'), 'utf8');
assert(configCode.includes("demoId: 'DEMO-05'"), 'Config has correct Demo ID: DEMO-05');

const apiCode = fs.readFileSync(path.join(rootDir, 'src/services/api.js'), 'utf8');
assert(apiCode.includes('SN-VIT-'), 'API dispatcher uses SN-VIT- prefix');

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
