export interface SampleLetter {
  id: string;
  title: string;
  emoji: string;
  description: string;
  imageBase64?: string;
  textContent: string;
}

export const SAMPLE_LETTERS: SampleLetter[] = [
  {
    id: 'eviction',
    title: '3-Day Notice to Vacate',
    emoji: '🏠',
    description: 'Travis County eviction notice',
    textContent: `NOTICE TO VACATE

Date: September 28, 2026

TO: Current Resident
    Apartment 4B
    2847 Riverside Drive
    Austin, TX 78741

FROM: Riverside Apartments Management, LLC
      c/o Greenfield Property Management
      1200 Congress Avenue, Suite 400
      Austin, TX 78701

RE: Notice to Vacate Premises — Nonpayment of Rent

Dear Tenant:

Pursuant to Texas Property Code §24.005, you are hereby given notice that you must VACATE the above-referenced premises within THREE (3) DAYS from the date this notice is delivered to you.

Reason for Notice: You have failed to pay rent for the month of September 2026 in the amount of $1,450.00. As of the date of this notice, the total amount due, including late fees, is $1,625.00.

Payment Breakdown:
- September 2026 rent: $1,450.00
- Late fee (assessed 09/05/2026): $125.00
- Notice processing fee: $50.00
- TOTAL DUE: $1,625.00

If you fail to vacate the premises or pay the total amount due within three (3) days, the landlord will file a forcible detainer suit (eviction lawsuit) in Justice of the Peace Court, Precinct 3, Travis County, Texas.

You may cure this notice by paying the full amount of $1,625.00 in certified funds (cashier's check or money order only) to the management office at the address listed above during business hours (Mon-Fri, 9:00 AM - 5:00 PM).

This notice is being delivered by: [X] Hand delivery  [ ] Regular mail  [ ] Posting on inside of main entry door

Sincerely,
Rachel Torres
Property Manager
Greenfield Property Management
(512) 555-0147`,
  },
  {
    id: 'utility',
    title: 'Final Disconnection Notice',
    emoji: '⚡',
    description: 'Austin Energy utility shutoff warning',
    textContent: `AUSTIN ENERGY
City of Austin | Austin Energy
P.O. Box 2267
Austin, TX 78768-2267

FINAL NOTICE — DISCONNECTION OF ELECTRIC SERVICE

Account Number: AE-7829-4451-03
Service Address: 5612 Manor Road, Apt 12, Austin, TX 78723
Notice Date: September 30, 2026
Disconnection Date: October 7, 2026

Dear Customer:

Despite our previous notices, your account remains past due. Unless payment is received by October 7, 2026, your electric service will be DISCONNECTED without further notice.

Account Summary:
  Previous Balance:                $187.43
  Payment Received (08/15):       -$50.00
  Current Charges (Sep 2026):      $142.67
  Late Payment Charge:              $15.00
  Disconnect/Reconnect Fee:         $45.00
  TOTAL AMOUNT DUE:               $340.10

TO AVOID DISCONNECTION:
1. Pay $340.10 in full before October 7, 2026
2. Call us at (512) 494-9400 to discuss a payment arrangement
3. Visit austinenergy.com/ae/pay to pay online

PAYMENT ASSISTANCE:
You may qualify for the Customer Assistance Program (CAP) or Plus-1 emergency bill assistance. Call (512) 494-9400 or visit our Customer Service Center at 721 Barton Springs Road, Austin, TX 78704.

IMPORTANT: If anyone in your household depends on electric-powered life-support equipment, please contact us immediately at (512) 494-9400 to register for critical care status.

If service is disconnected, a reconnection fee of $45.00 will apply, and a security deposit may be required before service is restored.

Austin Energy Customer Service
Phone: (512) 494-9400
Online: austinenergy.com`,
  },
  {
    id: 'benefits',
    title: 'SNAP Benefits Renewal',
    emoji: '📋',
    description: 'Texas HHSC Medicaid/SNAP renewal form',
    textContent: `TEXAS HEALTH AND HUMAN SERVICES COMMISSION
4900 N. Lamar Blvd
Austin, TX 78751

IMPORTANT: YOUR BENEFITS ARE ABOUT TO END

Case Number: TX-2026-847291
Date: September 25, 2026
Certification Period End Date: October 31, 2026

Dear Maria Santos,

Your Supplemental Nutrition Assistance Program (SNAP) benefits and Medicaid coverage are scheduled to END on October 31, 2026 unless you complete your renewal.

WHAT YOU NEED TO DO:

1. COMPLETE your renewal application by October 15, 2026
   - Online at YourTexasBenefits.com
   - By phone: 2-1-1 (option 2)
   - In person at your local HHSC office

2. PROVIDE the following documents:
   - Proof of income for all household members (last 30 days of pay stubs, SSI/SSDI award letter, or self-employment records)
   - Current utility bill or rent/mortgage statement
   - Photo ID for head of household
   - Social Security numbers for all household members

3. ATTEND your scheduled interview:
   Date: October 10, 2026
   Time: 2:30 PM
   Location: Phone interview — we will call you at (512) 555-0198
   If you cannot attend, call 2-1-1 to reschedule BEFORE your interview date.

CURRENT BENEFITS:
  - SNAP: $485/month (4-person household)
  - Medicaid: Active for all household members

IF YOU DO NOT RENEW BY OCTOBER 15, 2026:
  - Your SNAP benefits will STOP on November 1, 2026
  - Your Medicaid coverage will STOP on November 1, 2026
  - You will need to submit a NEW application and may experience a gap in coverage

NEED HELP?
  - Call 2-1-1 (available 24/7)
  - Visit YourTexasBenefits.com
  - Visit your local HHSC office: 1601 Rutherford Lane, Austin, TX 78754
    Office hours: Mon-Fri 8:00 AM - 4:30 PM

This notice is required under 7 CFR §273.14.

Texas Health and Human Services Commission`,
  },
  {
    id: 'medical',
    title: 'Hospital Bill & Insurance Denial',
    emoji: '🏥',
    description: 'Medical bill with partial insurance denial',
    textContent: `ST. DAVID'S MEDICAL CENTER
Billing Department
P.O. Box 90422
Austin, TX 78709-0422

STATEMENT OF ACCOUNT — BALANCE DUE

Patient: James R. Nguyen
Account Number: SDM-2026-09-41872
Date of Service: August 14, 2026
Statement Date: September 20, 2026
Payment Due Date: October 20, 2026

Dear James R. Nguyen,

Thank you for choosing St. David's Medical Center for your care. Below is a summary of charges for your recent emergency department visit.

SERVICE DETAILS:
  Emergency Department Visit (Level 4):    $3,847.00
  CT Scan — Abdomen/Pelvis w/ contrast:    $2,215.00
  Laboratory Services:                       $486.00
  Pharmacy/Medications:                      $312.00
  Physician Fee (Emergency Medicine):        $875.00
  ─────────────────────────────────────
  TOTAL CHARGES:                           $7,735.00

INSURANCE APPLIED:
  Insurance Carrier: Blue Cross Blue Shield of Texas
  Policy #: BCB-7741928
  Insurance Paid:                         -$4,120.00
  Contractual Adjustment:                 -$1,430.00
  DENIED — CT Scan (Reason: Prior Auth Required): $0.00
  ─────────────────────────────────────
  YOUR RESPONSIBILITY:                     $2,185.00

IMPORTANT NOTICE REGARDING DENIED CLAIM:
Your insurance company denied coverage for the CT Scan ($2,215.00 billed; $785.00 after contractual adjustment) stating that prior authorization was required. Because this was an EMERGENCY visit, you may have the right to appeal this denial. Contact your insurance company or call our Patient Financial Services team for help.

PAYMENT OPTIONS:
  1. Pay in full by October 20, 2026
  2. Set up a monthly payment plan: Call (512) 544-0024
  3. Apply for Financial Assistance: Visit stdavids.com/financialassistance
  4. Appeal the insurance denial: Call BCBS at 1-800-521-2227

FAILURE TO PAY OR ARRANGE PAYMENT:
Accounts not resolved within 90 days may be referred to a collection agency, which could affect your credit score.

Patient Financial Services: (512) 544-0024
Hours: Mon-Fri 8:00 AM - 6:00 PM
Online: MyStDavids.com/billing`,
  },
];
