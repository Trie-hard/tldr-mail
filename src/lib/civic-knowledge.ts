import { LetterCategory } from './types';

export interface LegalProtection {
  icon: string;
  title: string;
  description: string;
  legalBasis: string;
}

export interface JargonDefinition {
  term: string;
  definition: string;
  inContext: string;
}

export interface TimelineStage {
  step: number;
  timeframe: string;
  title: string;
  description: string;
  isDangerZone?: boolean;
}

export interface ClinicPrep {
  callScript: string;
  documentsToBring: string[];
}

export interface CategoryCivicPack {
  rights: LegalProtection[];
  jargon: JargonDefinition[];
  timeline: TimelineStage[];
  prep: ClinicPrep;
}

export const CIVIC_KNOWLEDGE: Record<string, CategoryCivicPack> = {
  eviction: {
    rights: [
      {
        icon: '⚖️',
        title: 'A Notice to Vacate is NOT an Eviction',
        description: 'Your landlord cannot remove you, change your locks, or touch your belongings without filing a court lawsuit and winning a judgment before a judge.',
        legalBasis: 'Texas Property Code §24.005',
      },
      {
        icon: '🚫',
        title: 'Illegal Lockouts & Utility Shutoffs are Prohibited',
        description: 'It is strictly illegal for a Texas landlord to disconnect water, electric, or gas service to force a tenant out, even if rent is unpaid.',
        legalBasis: 'Texas Property Code §92.008',
      },
      {
        icon: '🏛️',
        title: 'Right to Free Legal Defense & Court Hearing',
        description: 'You are legally entitled to defend yourself in Justice of the Peace Court. Free attorneys from Texas RioGrande Legal Aid (TRLA) can represent you.',
        legalBasis: 'Travis County Eviction Defense',
      },
      {
        icon: '🤝',
        title: 'Cure Window & Negotiation Rights',
        description: 'You have the right to request a formal written repayment plan or apply for emergency municipal rental relief before any court filing occurs.',
        legalBasis: 'Austin Tenants Council Fair Housing',
      },
    ],
    jargon: [
      {
        term: 'Forcible Detainer',
        definition: 'The official Texas legal term for an eviction lawsuit filed in court by a landlord seeking possession of a property.',
        inContext: 'It does not mean police are coming today; it means court papers would need to be filed first.',
      },
      {
        term: 'Certified Funds',
        definition: 'Guaranteed money issued directly by a bank or post office (cashier\'s check or money order), rather than a personal paper check.',
        inContext: 'Landlords require this to prevent bounced checks when past-due rent is owed.',
      },
      {
        term: 'Notice to Vacate',
        definition: 'A formal written warning demanding payment or departure within a set period (usually 3 days in Texas) before a lawsuit can be filed.',
        inContext: 'This is the warning phase, not the court judgment phase.',
      },
      {
        term: 'Justice of the Peace (JP) Court',
        definition: 'The local county court precinct that handles landlord-tenant disputes, small claims under $20,000, and eviction hearings in Texas.',
        inContext: 'In Austin, Precinct 3 is located on Highway 71 and handles southeast/south Travis County cases.',
      },
    ],
    timeline: [
      {
        step: 1,
        timeframe: 'Day 1–3',
        title: 'Notice Period (You Are Here)',
        description: '72-hour window under Texas law to pay past balance, request a payment plan, or contact legal aid.',
        isDangerZone: true,
      },
      {
        step: 2,
        timeframe: 'Day 4–10',
        title: 'Court Lawsuit Filing',
        description: 'If unresolved, landlord files Forcible Detainer in JP Court. County constable serves you with court citation.',
      },
      {
        step: 3,
        timeframe: 'Day 10–21',
        title: 'Court Trial Hearing',
        description: 'Hearing before Justice of the Peace judge. You present rent receipts, hardship proof, or legal defenses.',
      },
      {
        step: 4,
        timeframe: 'Day 22+',
        title: 'Appeal Window / Move Out',
        description: 'If judgment is issued, tenant has 5 days to file an appeal bond before a Writ of Possession can be executed.',
      },
    ],
    prep: {
      callScript:
        'Hello, my name is [NAME]. I received a 3-Day Notice to Vacate on [DATE] for $[AMOUNT] at [APARTMENT NAME]. I am low-income and need emergency legal advice on negotiating a payment plan or preventing a court filing before my deadline.',
      documentsToBring: [
        'The original Notice to Vacate and envelope showing postmark date',
        'Your current signed residential lease agreement',
        'Bank statements or receipts showing previous rent payments',
        'Proof of current household income (last 30 days pay stubs or SSI letter)',
        'Any text messages or emails exchanged with property management',
      ],
    },
  },
  'utility-shutoff': {
    rights: [
      {
        icon: '🌡️',
        title: 'Extreme Weather Disconnection Moratorium',
        description: 'Austin Energy cannot legally shut off power during National Weather Service Heat Advisories (above 102°F or heat index 108°F) or during winter freezes.',
        legalBasis: 'City of Austin Utility Moratorium Rules',
      },
      {
        icon: '🏥',
        title: 'Critical Care Priority Medical Protection',
        description: 'If anyone in your household depends on electric life-support equipment (oxygen concentrators, dialysis), you are shielded from disconnection by registering.',
        legalBasis: 'Austin Energy Critical Care Program',
      },
      {
        icon: '💰',
        title: 'Customer Assistance Program (CAP) Discounts',
        description: 'Qualifying low-income Austin households receive an automatic 15% to 50% discount on electric, water, and drainage utility charges.',
        legalBasis: 'City of Austin CAP Ordinance',
      },
      {
        icon: '🤝',
        title: 'Mandatory Payment Arrangement Options',
        description: 'You have the right to request a deferred payment arrangement or Plus-1 emergency bill assistance before your scheduled disconnection date.',
        legalBasis: 'Austin City Council Utility Regulations',
      },
    ],
    jargon: [
      {
        term: 'Disconnection Notice',
        definition: 'A final warning issued when an account is past due, specifying the exact date electric or water meters will be shut off remotely.',
        inContext: 'Calling before this date allows customer service to freeze disconnection.',
      },
      {
        term: 'CAP (Customer Assistance Program)',
        definition: 'Austin Energy\'s utility discount program for residents enrolled in SNAP, Medicaid, SSI, or with income below 200% federal poverty level.',
        inContext: 'Can lower your monthly electric bill by $40 to $80 per month permanently.',
      },
      {
        term: 'Critical Care Status',
        definition: 'An official medical registry status that grants priority restoration after storms and prevents sudden service disconnection for health-fragile residents.',
        inContext: 'Requires a physician\'s note confirming life-support equipment.',
      },
      {
        term: 'Deferred Payment Arrangement (DPA)',
        definition: 'An agreement allowing you to pay your past-due utility balance in smaller monthly installments alongside your regular future bills.',
        inContext: 'Stops shutoff immediately once the first installment is scheduled.',
      },
    ],
    timeline: [
      {
        step: 1,
        timeframe: 'Day 1–7',
        title: 'Final Notice Window (You Are Here)',
        description: 'Account past due. 7-day notice period to call Austin Energy and request payment extension or CAP enrollment.',
        isDangerZone: true,
      },
      {
        step: 2,
        timeframe: 'Day 8 (Oct 7)',
        title: 'Scheduled Disconnection Date',
        description: 'Electric meter scheduled for remote shutoff at 8:00 AM unless payment plan or medical hold is active.',
        isDangerZone: true,
      },
      {
        step: 3,
        timeframe: 'Post-Shutoff',
        title: 'Reconnection Fee Assessment',
        description: 'Service turned off. $45 reconnection fee assessed and additional security deposit required to restore power.',
      },
      {
        step: 4,
        timeframe: 'Restoration',
        title: 'Emergency Utility Restoration',
        description: 'Upon payment or Plus-1 funding verification, Austin Energy restores electric service within 24 to 48 hours.',
      },
    ],
    prep: {
      callScript:
        'Hello, my name is [NAME] on account #AE-7829-4451-03. I received a final disconnection notice for October 7 for $340.10. I am experiencing temporary financial hardship and would like to set up a deferred payment plan and apply for the Customer Assistance Program (CAP).',
      documentsToBring: [
        'Your Austin Energy Account Number (#AE-7829-4451-03)',
        'Service address billing statement',
        'Proof of SNAP, Medicaid, or SSI enrollment (for CAP discount)',
        'Physician certification letter if medical equipment is present in home',
      ],
    },
  },
  'benefits-denial': {
    rights: [
      {
        icon: '📋',
        title: 'Federal Written Notice Protections',
        description: 'State agencies cannot cancel your food stamps or Medicaid without advance written notice detailing the exact reasons and providing appeal rights.',
        legalBasis: '7 CFR §273.14 (Federal SNAP Regulations)',
      },
      {
        icon: '⚖️',
        title: 'Right to Fair Hearing with Continued Benefits',
        description: 'If you appeal a benefits cancellation within 10 days of notice, your SNAP and Medicaid benefits must continue uninterrupted while your hearing is pending.',
        legalBasis: 'Texas Administrative Code Title 1 §357.11',
      },
      {
        icon: '📞',
        title: 'Mandatory Phone Interview Rescheduling',
        description: 'If you miss your scheduled phone interview due to work or illness, Texas HHSC must allow you to reschedule without cancelling your case.',
        legalBasis: 'Texas Works Handbook §B-112',
      },
      {
        icon: '🍎',
        title: 'Emergency Food Support Rights',
        description: 'If your household has less than $100 in liquid assets and monthly income below rent, you qualify for Expedited SNAP within 7 days.',
        legalBasis: '7 CFR §273.2(i)',
      },
    ],
    jargon: [
      {
        term: 'Certification Period',
        definition: 'The official span of time (usually 6 or 12 months) during which you are approved to receive food stamps or Medicaid coverage before recertifying.',
        inContext: 'Your certification period ends on October 31, 2026.',
      },
      {
        term: 'Fair Hearing',
        definition: 'An administrative legal trial before an impartial hearing officer where you can challenge a reduction, denial, or cancellation of state benefits.',
        inContext: 'You can request this for free if your renewal paperwork was lost or improperly denied.',
      },
      {
        term: 'Expedited SNAP',
        definition: 'Emergency processing of food stamps delivered within 7 calendar days for destitute households with zero funds.',
        inContext: 'Central Texas Food Bank can help you apply for expedited status if needed.',
      },
      {
        term: 'Form H1020',
        definition: 'The Texas Health and Human Services official request for verification document asking for missing pay stubs or utility proofs.',
        inContext: 'You usually have 10 days to reply to this form.',
      },
    ],
    timeline: [
      {
        step: 1,
        timeframe: 'Now – Oct 10',
        title: 'Gather Income Proofs (You Are Here)',
        description: 'Collect 30 days of pay stubs, current lease/utility bills, and prep for the phone interview.',
      },
      {
        step: 2,
        timeframe: 'Oct 10 (2:30 PM)',
        title: 'Mandatory Phone Interview',
        description: 'Caseworker calls your phone number (512) 555-0198. Keep your phone charged and unblocked.',
        isDangerZone: true,
      },
      {
        step: 3,
        timeframe: 'Oct 15, 2026',
        title: 'Paperwork Submission Deadline',
        description: 'All documents must be uploaded to YourTexasBenefits.com or delivered to local HHSC office.',
        isDangerZone: true,
      },
      {
        step: 4,
        timeframe: 'Nov 1, 2026',
        title: 'Benefits Status Determination',
        description: 'Benefits renewed seamlessly for new period, or termination occurs if renewal was incomplete.',
      },
    ],
    prep: {
      callScript:
        'Hello, my name is Maria Santos, Case #TX-2026-847291. I am calling to confirm my phone interview on October 10 at 2:30 PM and verify which income documents have been received in the system.',
      documentsToBring: [
        'Texas HHSC Case Number (#TX-2026-847291)',
        'Last 30 consecutive days of gross pay stubs for all working household members',
        'Current electric, gas, or water bill showing service address',
        'Valid photo ID (Texas driver license or consular ID) for head of household',
        'Social Security numbers for all family members receiving benefits',
      ],
    },
  },
  'medical-bill': {
    rights: [
      {
        icon: '🛡️',
        title: 'Federal No Surprises Act Protections',
        description: 'Emergency medical services cannot be billed at higher out-of-network rates, and insurers cannot deny emergency diagnostic imaging for lack of prior authorization.',
        legalBasis: 'Public Health Service Act §2799A-1',
      },
      {
        icon: '🚑',
        title: 'EMTALA Emergency Care Protections',
        description: 'Federal law requires emergency departments to screen and stabilize emergency medical conditions regardless of insurance pre-authorization.',
        legalBasis: '42 U.S.C. §1395dd (EMTALA)',
      },
      {
        icon: '🏥',
        title: 'Mandatory Non-Profit Charity Care',
        description: 'Under IRS Code §501(r), tax-exempt hospitals like St. David\'s must provide clear financial assistance policies and sliding-scale bill forgiveness for patients earning under 400% of poverty level.',
        legalBasis: 'Internal Revenue Code §501(r)',
      },
      {
        icon: '📊',
        title: 'Right to Itemized CPT Billing Codes',
        description: 'You have the right to request a line-item bill with medical billing codes (CPT/HCPCS) before paying, which routinely uncovers billing errors and duplicate charges.',
        legalBasis: 'Texas Health & Safety Code §311.002',
      },
    ],
    jargon: [
      {
        term: 'Prior Authorization',
        definition: 'When an insurance company requires a doctor to seek advance permission before performing a procedure. Under federal law, this cannot be required for emergency room care.',
        inContext: 'Your CT scan denial cited prior auth, which is appealable under emergency care regulations.',
      },
      {
        term: 'Contractual Adjustment',
        definition: 'The discount amount that the hospital agreed to write off based on its contract with your insurance provider. You never have to pay this amount.',
        inContext: '$1,430 was deducted from your bill as a contractual adjustment.',
      },
      {
        term: 'Charity Care / Financial Assistance',
        definition: 'Free or discounted healthcare provided by non-profit hospital systems to uninsured or underinsured patients who meet income criteria.',
        inContext: 'St. David\'s Foundation provides grants covering up to 100% of hospital debt.',
      },
      {
        term: 'Level 4 Emergency Visit',
        definition: 'A billing code indicating an emergency department visit requiring high medical complexity and extensive diagnostic workup.',
        inContext: 'Reflects the severity of symptoms evaluated by the attending ER doctor.',
      },
    ],
    timeline: [
      {
        step: 1,
        timeframe: 'Day 1–30',
        title: 'Initial Statement Period (You Are Here)',
        description: 'Received initial bill. 30-day window to request itemized codes and file insurance appeal.',
      },
      {
        step: 2,
        timeframe: 'Oct 20, 2026',
        title: 'Statement Payment Due Date',
        description: 'Standard payment deadline. Call patient financial services to put a 30-day dispute hold on account.',
        isDangerZone: true,
      },
      {
        step: 3,
        timeframe: 'Day 30–60',
        title: 'Insurance Appeal Review',
        description: 'Blue Cross Blue Shield reviews emergency room denial under No Surprises Act criteria.',
      },
      {
        step: 4,
        timeframe: 'Day 90+',
        title: 'Collections Escalation Window',
        description: 'Unresolved accounts risk referral to third-party debt collection agencies if no payment hold was filed.',
        isDangerZone: true,
      },
    ],
    prep: {
      callScript:
        'Hello, my name is James R. Nguyen on account #SDM-2026-09-41872. I am calling to dispute the $2,185 balance for my emergency visit. My insurance denied the CT scan citing prior authorization, which violates emergency care protections under EMTALA. I request an itemized bill and a 30-day hold while I file an appeal with BCBS.',
      documentsToBring: [
        'St. David\'s Statement of Account (#SDM-2026-09-41872)',
        'Blue Cross Blue Shield Explanation of Benefits (EOB) showing CT scan denial reason',
        'Discharge paperwork from the emergency room visit dated August 14, 2026',
        'Proof of household income for St. David\'s Foundation financial assistance application',
      ],
    },
  },
};

export function getCivicKnowledge(category: LetterCategory | string): CategoryCivicPack {
  return CIVIC_KNOWLEDGE[category] || CIVIC_KNOWLEDGE['eviction'];
}
