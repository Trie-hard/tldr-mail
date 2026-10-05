#!/usr/bin/env node
/**
 * Automated End-to-End Test Verification Suite for TL;DR Mail
 *
 * Verifies:
 * 1. GET http://localhost:3000 (Homepage & SSR HTML output)
 * 2. GET http://localhost:3000/manifest.webmanifest (PWA Web App Manifest)
 * 3. POST http://localhost:3000/api/analyze (All 4 categories: Eviction, Utility, Benefits, Medical)
 * 4. POST http://localhost:3000/api/appeal (Eviction and Medical appeal letters)
 * 5. POST http://localhost:3000/api/chat (Follow-up Q&A for letters)
 * 6. Formatted summary reporting with pass/fail counts and performance metrics
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ANSI colors for clean, professional terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
};

// Sample letter payloads matching production templates
const SAMPLE_LETTERS = {
  eviction: {
    id: 'eviction',
    title: '3-Day Notice to Vacate',
    text: `NOTICE TO VACATE
Date: September 28, 2026
TO: Current Resident, Apartment 4B, 2847 Riverside Drive, Austin, TX 78741
FROM: Riverside Apartments Management, LLC, c/o Greenfield Property Management, 1200 Congress Avenue, Suite 400, Austin, TX 78701
RE: Notice to Vacate Premises — Nonpayment of Rent
Dear Tenant:
Pursuant to Texas Property Code §24.005, you are hereby given notice that you must VACATE the above-referenced premises within THREE (3) DAYS from the date this notice is delivered to you.
Reason for Notice: You have failed to pay rent for the month of September 2026 in the amount of $1,450.00. As of the date of this notice, the total amount due, including late fees, is $1,625.00.
TOTAL DUE: $1,625.00
If you fail to vacate the premises or pay the total amount due within three (3) days, the landlord will file a forcible detainer suit (eviction lawsuit) in Justice of the Peace Court, Precinct 3, Travis County, Texas.
Sincerely, Rachel Torres, Property Manager, Greenfield Property Management (512) 555-0147`,
  },
  utility: {
    id: 'utility',
    title: 'Final Disconnection Notice',
    text: `AUSTIN ENERGY
City of Austin | Austin Energy, P.O. Box 2267, Austin, TX 78768-2267
FINAL NOTICE — DISCONNECTION OF ELECTRIC SERVICE
Account Number: AE-7829-4451-03
Service Address: 5612 Manor Road, Apt 12, Austin, TX 78723
Notice Date: September 30, 2026
Disconnection Date: October 7, 2026
Dear Customer:
Despite our previous notices, your account remains past due. Unless payment is received by October 7, 2026, your electric service will be DISCONNECTED without further notice.
TOTAL AMOUNT DUE: $340.10
TO AVOID DISCONNECTION:
1. Pay $340.10 in full before October 7, 2026
2. Call us at (512) 494-9400 to discuss a payment arrangement
PAYMENT ASSISTANCE:
You may qualify for the Customer Assistance Program (CAP) or Plus-1 emergency bill assistance.
Austin Energy Customer Service: (512) 494-9400`,
  },
  benefits: {
    id: 'benefits',
    title: 'SNAP Benefits Renewal',
    text: `TEXAS HEALTH AND HUMAN SERVICES COMMISSION
4900 N. Lamar Blvd, Austin, TX 78751
IMPORTANT: YOUR BENEFITS ARE ABOUT TO END
Case Number: TX-2026-847291
Date: September 25, 2026
Certification Period End Date: October 31, 2026
Dear Maria Santos,
Your Supplemental Nutrition Assistance Program (SNAP) benefits and Medicaid coverage are scheduled to END on October 31, 2026 unless you complete your renewal.
WHAT YOU NEED TO DO:
1. COMPLETE your renewal application by October 15, 2026
2. PROVIDE proof of income
3. ATTEND your scheduled interview on October 10, 2026 at 2:30 PM
CURRENT BENEFITS: SNAP: $485/month
IF YOU DO NOT RENEW BY OCTOBER 15, 2026, your benefits will stop on November 1, 2026.
NEED HELP? Call 2-1-1 or visit your local HHSC office at 1601 Rutherford Lane, Austin, TX 78754.
Texas Health and Human Services Commission`,
  },
  medical: {
    id: 'medical',
    title: 'Hospital Bill & Insurance Denial',
    text: `ST. DAVID'S MEDICAL CENTER
Billing Department, P.O. Box 90422, Austin, TX 78709-0422
STATEMENT OF ACCOUNT — BALANCE DUE
Patient: James R. Nguyen
Account Number: SDM-2026-09-41872
Date of Service: August 14, 2026
Statement Date: September 20, 2026
Payment Due Date: October 20, 2026
SERVICE DETAILS:
  Emergency Department Visit (Level 4): $3,847.00
  CT Scan — Abdomen/Pelvis w/ contrast: $2,215.00
  TOTAL CHARGES: $7,735.00
INSURANCE APPLIED:
  Blue Cross Blue Shield of Texas
  DENIED — CT Scan (Reason: Prior Auth Required): $0.00
  YOUR RESPONSIBILITY: $2,185.00
IMPORTANT NOTICE REGARDING DENIED CLAIM:
Because this was an EMERGENCY visit, you may have the right to appeal this denial under emergency care protections.
Patient Financial Services: (512) 544-0024`,
  },
};

// Test Runner State
const results = [];
let suiteStartTime = Date.now();

function logHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function recordPass(flow, name, details = '') {
  results.push({ flow, name, passed: true, details });
  console.log(`  ${colors.green}✓ PASS${colors.reset} ${colors.bold}${name}${colors.reset}${details ? ` ${colors.dim}(${details})${colors.reset}` : ''}`);
}

function recordFail(flow, name, error) {
  results.push({ flow, name, passed: false, error: String(error) });
  console.log(`  ${colors.red}✗ FAIL${colors.reset} ${colors.bold}${name}${colors.reset}`);
  console.log(`    ${colors.red}Error: ${error}${colors.reset}`);
}

async function testFetch(url, options = {}) {
  const start = Date.now();
  const res = await fetch(url, options);
  const duration = Date.now() - start;
  return { res, duration };
}

// -----------------------------------------------------------------------------
// Flow 1: Web App Homepage (GET /)
// -----------------------------------------------------------------------------
async function runFlow1() {
  logHeader('Flow 1: Web Application Availability');
  const url = `${BASE_URL}/`;

  try {
    const { res, duration } = await testFetch(url);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 OK, got ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(`Expected Content-Type text/html, got "${contentType}"`);
    }

    const html = await res.text();
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      throw new Error('Response body does not contain valid HTML markup');
    }

    if (!html.includes('TL;DR Mail')) {
      throw new Error('Response HTML missing "TL;DR Mail" application branding');
    }

    recordPass('Homepage', 'GET / returns 200 OK with valid HTML output', `${duration}ms, ${html.length} bytes`);
  } catch (err) {
    recordFail('Homepage', 'GET / returns 200 OK with valid HTML output', err.message);
  }
}

// -----------------------------------------------------------------------------
// Flow 2: PWA Manifest (GET /manifest.webmanifest)
// -----------------------------------------------------------------------------
async function runFlow2() {
  logHeader('Flow 2: Progressive Web App Manifest');
  const url = `${BASE_URL}/manifest.webmanifest`;

  try {
    const { res, duration } = await testFetch(url);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 OK, got ${res.status} ${res.statusText}`);
    }

    const manifest = await res.json();
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Manifest is not a valid JSON object');
    }

    if (!manifest.name || !manifest.name.includes('TL;DR Mail')) {
      throw new Error(`Expected manifest.name to contain "TL;DR Mail", received "${manifest.name}"`);
    }

    if (manifest.short_name !== 'TL;DR Mail') {
      throw new Error(`Expected manifest.short_name === "TL;DR Mail", received "${manifest.short_name}"`);
    }

    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      throw new Error('Manifest does not declare required app icons');
    }

    recordPass('Manifest', 'GET /manifest.webmanifest returns valid PWA config', `${duration}ms, name: "${manifest.name}"`);
  } catch (err) {
    recordFail('Manifest', 'GET /manifest.webmanifest returns valid PWA config', err.message);
  }
}

// -----------------------------------------------------------------------------
// Flow 3: AI Document Analysis (POST /api/analyze across 4 sample categories)
// -----------------------------------------------------------------------------
async function runFlow3() {
  logHeader('Flow 3: AI Letter Analysis API (/api/analyze)');
  const url = `${BASE_URL}/api/analyze`;

  // 3.1 Eviction Letter
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent: SAMPLE_LETTERS.eviction.text }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const { analysis, resources } = data;

    if (!analysis) throw new Error('Missing "analysis" object in response');
    if (analysis.category !== 'eviction') {
      throw new Error(`Expected category "eviction", received "${analysis.category}"`);
    }
    if (analysis.isHighStakes !== true) {
      throw new Error(`Expected isHighStakes === true, received ${analysis.isHighStakes}`);
    }
    if (analysis.urgency !== 'critical') {
      throw new Error(`Expected urgency === "critical", received "${analysis.urgency}"`);
    }

    const hasTRLA = Array.isArray(resources) && resources.some(r =>
      (r.name && r.name.includes('TRLA')) ||
      (r.description && r.description.includes('TRLA')) ||
      (r.name && r.name.includes('Texas RioGrande Legal Aid'))
    );
    if (!hasTRLA) {
      throw new Error(`Expected resources to contain TRLA. Resources received: ${JSON.stringify(resources?.map(r => r.name))}`);
    }

    recordPass(
      'Analysis',
      'Eviction notice: category === "eviction", isHighStakes, urgency === "critical", TRLA resource present',
      `${duration}ms`
    );
  } catch (err) {
    recordFail('Analysis', 'Eviction notice analysis', err.message);
  }

  // 3.2 Utility Letter
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent: SAMPLE_LETTERS.utility.text }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const { analysis, resources } = data;

    if (!analysis) throw new Error('Missing "analysis" object in response');
    if (analysis.category !== 'utility-shutoff') {
      throw new Error(`Expected category "utility-shutoff", received "${analysis.category}"`);
    }
    if (analysis.financialAmount !== '$340.10') {
      throw new Error(`Expected amount "$340.10", received "${analysis.financialAmount}"`);
    }

    const hasAustinEnergy = Array.isArray(resources) && resources.some(r =>
      r.name && r.name.includes('Austin Energy')
    );
    if (!hasAustinEnergy) {
      throw new Error(`Expected resources to contain Austin Energy. Resources received: ${JSON.stringify(resources?.map(r => r.name))}`);
    }

    recordPass(
      'Analysis',
      'Utility notice: category === "utility-shutoff", amount === "$340.10", Austin Energy resource present',
      `${duration}ms`
    );
  } catch (err) {
    recordFail('Analysis', 'Utility notice analysis', err.message);
  }

  // 3.3 Benefits Letter
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent: SAMPLE_LETTERS.benefits.text }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const { analysis, resources } = data;

    if (!analysis) throw new Error('Missing "analysis" object in response');
    if (analysis.category !== 'benefits-denial') {
      throw new Error(`Expected category "benefits-denial", received "${analysis.category}"`);
    }
    if (!analysis.deadlineDate || typeof analysis.deadlineDate !== 'string') {
      throw new Error(`Expected deadlineDate string to be present, received "${analysis.deadlineDate}"`);
    }

    const hasHHSC = Array.isArray(resources) && resources.some(r =>
      (r.name && r.name.includes('HHSC')) ||
      (r.name && r.name.includes('Texas Health and Human Services'))
    );
    if (!hasHHSC) {
      throw new Error(`Expected resources to contain HHSC. Resources received: ${JSON.stringify(resources?.map(r => r.name))}`);
    }

    recordPass(
      'Analysis',
      `Benefits letter: category === "benefits-denial", deadlineDate present ("${analysis.deadlineDate}"), HHSC resource present`,
      `${duration}ms`
    );
  } catch (err) {
    recordFail('Analysis', 'Benefits letter analysis', err.message);
  }

  // 3.4 Medical Letter
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent: SAMPLE_LETTERS.medical.text }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const { analysis } = data;

    if (!analysis) throw new Error('Missing "analysis" object in response');
    if (analysis.category !== 'medical-bill') {
      throw new Error(`Expected category "medical-bill", received "${analysis.category}"`);
    }
    if (analysis.financialAmount !== '$2,185.00') {
      throw new Error(`Expected amount "$2,185.00", received "${analysis.financialAmount}"`);
    }

    recordPass(
      'Analysis',
      'Medical bill: category === "medical-bill", amount === "$2,185.00"',
      `${duration}ms`
    );
  } catch (err) {
    recordFail('Analysis', 'Medical bill analysis', err.message);
  }
}

// -----------------------------------------------------------------------------
// Flow 4: Formal Appeal Letter Generation (POST /api/appeal)
// -----------------------------------------------------------------------------
async function runFlow4() {
  logHeader('Flow 4: Appeal Letter Generation API (/api/appeal)');
  const url = `${BASE_URL}/api/appeal`;

  // 4.1 Eviction Appeal
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'eviction',
        letterContext: SAMPLE_LETTERS.eviction.text,
        language: 'en',
      }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data.appealLetter || typeof data.appealLetter !== 'string' || data.appealLetter.length < 50) {
      throw new Error(`Expected valid appeal letter text, received: "${data.appealLetter}"`);
    }

    recordPass(
      'Appeal',
      'Eviction appeal generated successfully',
      `${duration}ms, ${data.appealLetter.length} chars`
    );
  } catch (err) {
    recordFail('Appeal', 'Eviction appeal generation', err.message);
  }

  // 4.2 Medical Bill Appeal
  try {
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'medical-bill',
        letterContext: SAMPLE_LETTERS.medical.text,
        language: 'en',
      }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data.appealLetter || typeof data.appealLetter !== 'string' || data.appealLetter.length < 50) {
      throw new Error(`Expected valid appeal letter text, received: "${data.appealLetter}"`);
    }

    recordPass(
      'Appeal',
      'Medical insurance appeal generated successfully',
      `${duration}ms, ${data.appealLetter.length} chars`
    );
  } catch (err) {
    recordFail('Appeal', 'Medical insurance appeal generation', err.message);
  }
}

// -----------------------------------------------------------------------------
// Flow 5: Interactive Chat Assistance (POST /api/chat)
// -----------------------------------------------------------------------------
async function runFlow5() {
  logHeader('Flow 5: Interactive Follow-up Chat API (/api/chat)');
  const url = `${BASE_URL}/api/chat`;

  // 5.1 Eviction follow-up
  try {
    const question = 'Do I have to move out immediately within 3 days or do they need a court order?';
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        letterContext: SAMPLE_LETTERS.eviction.text,
        language: 'en',
      }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data.answer || typeof data.answer !== 'string' || data.answer.trim().length === 0) {
      throw new Error(`Expected valid chat answer, received: "${data.answer}"`);
    }

    recordPass(
      'Chat',
      'Chat answers eviction inquiry with rights guidance',
      `${duration}ms, response: "${data.answer.slice(0, 60)}..."`
    );
  } catch (err) {
    recordFail('Chat', 'Chat eviction question response', err.message);
  }

  // 5.2 Medical follow-up
  try {
    const question = 'Can the hospital bill me for emergency care if prior auth was denied?';
    const { res, duration } = await testFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        letterContext: SAMPLE_LETTERS.medical.text,
        language: 'en',
      }),
    });

    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (!data.answer || typeof data.answer !== 'string' || data.answer.trim().length === 0) {
      throw new Error(`Expected valid chat answer, received: "${data.answer}"`);
    }

    recordPass(
      'Chat',
      'Chat answers medical denial inquiry with emergency care protections',
      `${duration}ms, response: "${data.answer.slice(0, 60)}..."`
    );
  } catch (err) {
    recordFail('Chat', 'Chat medical question response', err.message);
  }
}

// -----------------------------------------------------------------------------
// Report Summary
// -----------------------------------------------------------------------------
function printSummary() {
  const totalDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  const totalCount = results.length;

  console.log(`\n${colors.bold}======================================================${colors.reset}`);
  console.log(`${colors.bold}             END-TO-END VERIFICATION SUMMARY         ${colors.reset}`);
  console.log(`${colors.bold}======================================================${colors.reset}`);
  console.log(`Target Host:       ${colors.cyan}${BASE_URL}${colors.reset}`);
  console.log(`Total Test Cases:  ${colors.bold}${totalCount}${colors.reset}`);
  console.log(`Passed:            ${colors.green}${colors.bold}${passedCount}${colors.reset}`);
  console.log(`Failed:            ${failedCount > 0 ? colors.red : colors.green}${colors.bold}${failedCount}${colors.reset}`);
  console.log(`Execution Time:    ${totalDuration}s`);
  console.log(`------------------------------------------------------`);

  // Grouped breakdown
  const flows = [...new Set(results.map(r => r.flow))];
  for (const flow of flows) {
    const flowResults = results.filter(r => r.flow === flow);
    const flowPassed = flowResults.every(r => r.passed);
    const statusIcon = flowPassed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  [${statusIcon}] ${colors.bold}${flow}${colors.reset} (${flowResults.filter(r => r.passed).length}/${flowResults.length} checks)`);
  }

  console.log(`======================================================`);
  if (failedCount === 0) {
    console.log(`\n${colors.bgGreen}  ✓ ALL END-TO-END FLOWS VERIFIED SUCCESSFULLY  ${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bgRed}  ✗ ${failedCount} FLOW VERIFICATION(S) FAILED  ${colors.reset}\n`);
    process.exit(1);
  }
}

async function main() {
  console.log(`\n${colors.bold}${colors.magenta}🚀 Starting TL;DR Mail Automated Flow Verification Suite...${colors.reset}`);
  console.log(`Targeting base URL: ${colors.cyan}${BASE_URL}${colors.reset}\n`);

  await runFlow1();
  await runFlow2();
  await runFlow3();
  await runFlow4();
  await runFlow5();

  printSummary();
}

main().catch(err => {
  console.error(`\n${colors.red}Fatal test runner error:${colors.reset}`, err);
  process.exit(1);
});
