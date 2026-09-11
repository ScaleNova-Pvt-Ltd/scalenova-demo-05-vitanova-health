/**
 * System Validation Test Suite — VitaNova Health (DEMO-05)
 * Standard: ScaleNova Client Production Architecture & Operations Manual v1.0
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

console.log('\n\x1b[1m[ScaleNova DEMO-05] Validating VitaNova Health Production Integrity...\x1b[0m\n');

// 1. Pages check
const requiredPages = ["index.html","about.html","specialties.html","specialist-detail.html","treatments.html","facilities.html","patient-experience.html","book-appointment.html","health-insights.html","contact.html","wellness.html","privacy.html"];
requiredPages.forEach(p => {
  assert(fs.existsSync(path.join(rootDir, p)), `Page exists: ${p}`);
});

// 2. Secret check
const frontendFiles = ['index.html', 'contact.html', 'src/config/index.js', 'src/services/api.js'];
frontendFiles.forEach(f => {
  const p = path.join(rootDir, f);
  if (fs.existsSync(p)) {
    const code = fs.readFileSync(p, 'utf8');
    assert(!code.includes('FRAPPE_API_SECRET ='), `${f}: No hardcoded Frappe API secret`);
    assert(!/1[a-zA-Z0-9_-]{43}/.test(code), `${f}: No hardcoded Google Sheet ID`);
  }
});

// 3. Cloudflare Workers Configuration
assert(fs.existsSync(path.join(rootDir, 'wrangler.toml')), 'wrangler.toml exists');
assert(fs.existsSync(path.join(rootDir, 'src/worker.js')), 'src/worker.js exists');

// 4. Operations Manual Documentation
const requiredDocs = [
  'docs/ARCHITECTURE.md', 'docs/DEPLOYMENT.md', 'docs/CLOUDFLARE.md',
  'docs/GOOGLE-SHEETS.md', 'docs/APPS-SCRIPT.md', 'docs/FRAPPE.md',
  'docs/EMAIL.md', 'docs/SECURITY.md', 'docs/TESTING.md',
  'docs/TROUBLESHOOTING.md', 'docs/DEMO-SCRIPT.md'
];
requiredDocs.forEach(d => {
  assert(fs.existsSync(path.join(rootDir, d)), `Documentation exists: ${d}`);
});

// 5. Code.gs Verification
const codeGs = fs.readFileSync(path.join(rootDir, 'integrations/google-apps-script/Code.gs'), 'utf8');
assert(codeGs.includes('Demo Lead Captures — ScaleNova'), 'Code.gs targets "Demo Lead Captures — ScaleNova"');
assert(codeGs.includes('Demo 5 - Healthcare'), 'Code.gs targets "Demo 5 - Healthcare"');
assert(codeGs.includes('demo@scalenovasys.com'), 'Code.gs configures sender demo@scalenovasys.com');

console.log(`\nResults for VitaNova Health: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
