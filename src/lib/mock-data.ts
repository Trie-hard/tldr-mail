import { LetterAnalysis } from './types';

export interface SampleLetterMock {
  id: string;
  analysis: Record<string, LetterAnalysis>;
  appeal: Record<string, string>;
  chatResponses: Record<string, string>;
}

export const MOCK_ANALYSES: Record<string, SampleLetterMock> = {
  eviction: {
    id: 'eviction',
    analysis: {
      en: {
        tldr: 'You must pay $1,625.00 in past-due rent and fees within 3 days, or move out to prevent your landlord from filing an eviction lawsuit in court.',
        category: 'eviction',
        urgency: 'critical',
        sender: 'Riverside Apartments Management, LLC / Greenfield Property Management',
        whatItWants: 'Pay $1,625.00 in cashier\'s check or money order at the management office, or vacate apartment 4B within 3 days.',
        deadline: 'Within 3 days of delivery (October 1, 2026)',
        deadlineDate: '2026-10-01',
        financialAmount: '$1,625.00',
        consequenceOfInaction: 'The landlord will file an eviction lawsuit (forcible detainer) against you in Travis County Justice of the Peace Court, Precinct 3, which could result in a formal eviction record and court judgment.',
        steps: [
          { order: 1, action: 'Call Texas RioGrande Legal Aid (TRLA) immediately at 1-888-988-9996 for free legal advice before talking to your landlord.', timeframe: 'Today' },
          { order: 2, action: 'Contact Austin Tenants Council at (512) 474-1961 to learn your rights regarding the notice period.', timeframe: 'Today' },
          { order: 3, action: 'If you have the money, pay $1,625.00 only using a cashier\'s check or money order and get a written, signed receipt.', timeframe: 'Within 3 days' },
          { order: 4, action: 'If you cannot pay in full, request a written payment arrangement or apply for emergency rental relief.', timeframe: 'Tomorrow' },
        ],
        keyFacts: [
          'Rent owed: $1,450.00 for September 2026 plus $175 in fees',
          'Notice given under Texas Property Code §24.005',
          'Notice was delivered via hand delivery',
          'Legal venue: JP Court Precinct 3, Travis County, Texas',
        ],
        isHighStakes: true,
        originalLanguageDetected: 'English',
      },
      es: {
        tldr: 'Debe pagar $1,625.00 de renta atrasada y cargos dentro de 3 días, o desalojar para evitar una demanda de desalojo en la corte.',
        category: 'eviction',
        urgency: 'critical',
        sender: 'Riverside Apartments Management, LLC',
        whatItWants: 'Pague $1,625.00 con cheque de caja o giro postal en la oficina, o desocupe el apartamento en 3 días.',
        deadline: 'En 3 días a partir de la entrega (1 de octubre de 2026)',
        deadlineDate: '2026-10-01',
        financialAmount: '$1,625.00',
        consequenceOfInaction: 'El propietario presentará una demanda de desalojo formal en la Corte de Paz del Condado de Travis, afectando su récord de vivienda.',
        steps: [
          { order: 1, action: 'Llame de inmediato a Texas RioGrande Legal Aid (TRLA) al 1-888-988-9996 para ayuda legal gratuita en español.', timeframe: 'Hoy' },
          { order: 2, action: 'Comuníquese con el Austin Tenants Council al (512) 474-1961.', timeframe: 'Hoy' },
          { order: 3, action: 'Si paga, use solo cheque de caja y pida un recibo firmado por escrito.', timeframe: 'Antes de 3 días' },
          { order: 4, action: 'Pida un plan de pago por escrito si no puede pagar todo de inmediato.', timeframe: 'Mañana' },
        ],
        keyFacts: [
          'Total debido: $1,625.00 ($1,450 renta + $175 cargos)',
          'Citación bajo el Código de Propiedad de Texas §24.005',
          'Corte: Precinto 3 del Condado de Travis, Texas',
        ],
        isHighStakes: true,
        originalLanguageDetected: 'English',
      },
    },
    appeal: {
      en: `September 29, 2026\n\nTO:\nRiverside Apartments Management, LLC\nc/o Greenfield Property Management\n1200 Congress Avenue, Suite 400\nAustin, TX 78701\n\nFROM:\n[YOUR NAME]\n2847 Riverside Drive, Apt 4B\nAustin, TX 78741\nPhone: [YOUR PHONE NUMBER]\nEmail: [YOUR EMAIL]\n\nRE: Response to Notice to Vacate — Formal Request for Payment Plan\n\nDear Ms. Torres,\n\nI am writing in response to the Notice to Vacate dated September 28, 2026 regarding my tenancy at Apartment 4B. I take my lease obligations seriously and wish to resolve this balance amicably.\n\nDue to unexpected temporary financial hardship, I was unable to pay the September rent on time. I am actively seeking emergency rental assistance and propose the following repayment schedule for the $1,625.00 balance:\n\n1. Initial payment of $[AMOUNT] on [DATE]\n2. Second installment of $[AMOUNT] on [DATE]\n3. Final balance payment of $[AMOUNT] on [DATE]\n\nI request that you confirm receipt of this letter in writing and agree to pause any court filings while we finalize this arrangement. I value my home at Riverside Apartments and appreciate your cooperation.\n\nSincerely,\n\n[YOUR SIGNATURE]\n[YOUR PRINTED NAME]`,
      es: `29 de septiembre de 2026\n\nPARA:\nRiverside Apartments Management, LLC\nc/o Greenfield Property Management\n1200 Congress Avenue, Suite 400\nAustin, TX 78701\n\nDE:\n[SU NOMBRE]\n2847 Riverside Drive, Apt 4B\nAustin, TX 78741\n\nASUNTO: Respuesta a Notificación de Desalojo — Solicitud de Plan de Pagos\n\nEstimada Sra. Torres:\n\nLe escribo en respuesta al Aviso de Desalojo del 28 de septiembre de 2026. Deseo resolver el saldo pendiente de $1,625.00 de manera cooperativa.\n\nHe solicitado asistencia financiera de emergencia y propongo un plan de pago en cuotas. Le solicito cordialmente que pause cualquier trámite judicial mientras formalizamos este acuerdo por escrito.\n\nAtentamente,\n\n[SU NOMBRE Y FIRMA]`,
    },
    chatResponses: {
      default: 'Under Texas law, a 3-Day Notice to Vacate is NOT an immediate eviction by the police. A landlord cannot physically remove you or change your locks without first winning a lawsuit in court. However, you should contact Texas RioGrande Legal Aid (TRLA) at 1-888-988-9996 today to safeguard your rights.',
    },
  },
  utility: {
    id: 'utility',
    analysis: {
      en: {
        tldr: 'Austin Energy will shut off your electricity on October 7, 2026 unless you pay $340.10 or call to set up a payment plan.',
        category: 'utility-shutoff',
        urgency: 'critical',
        sender: 'City of Austin | Austin Energy',
        whatItWants: 'Pay the total balance of $340.10 or call (512) 494-9400 to establish a payment arrangement before October 7.',
        deadline: 'October 7, 2026 (Service disconnection date)',
        deadlineDate: '2026-10-07',
        financialAmount: '$340.10',
        consequenceOfInaction: 'Your power will be disconnected, a $45 disconnection/reconnection fee will be applied, and a new security deposit may be required before power is turned back on.',
        steps: [
          { order: 1, action: 'Call Austin Energy Customer Service at (512) 494-9400 immediately to request a payment arrangement or extension.', timeframe: 'Today' },
          { order: 2, action: 'If someone in your home uses medical life-support equipment, notify Austin Energy immediately to get Critical Care designation.', timeframe: 'Today' },
          { order: 3, action: 'Apply for the Customer Assistance Program (CAP) discount or Plus-1 emergency utility funds.', timeframe: 'Tomorrow' },
          { order: 4, action: 'Pay as much as you can toward the $340.10 balance via austinenergy.com/ae/pay to show good faith.', timeframe: 'Before Oct 7' },
        ],
        keyFacts: [
          'Account #: AE-7829-4451-03 at 5612 Manor Road, Apt 12',
          'Total amount due: $340.10',
          'Disconnect date: October 7, 2026',
          'Reconnection fee if disconnected: $45.00',
        ],
        isHighStakes: true,
        originalLanguageDetected: 'English',
      },
    },
    appeal: {
      en: `October 1, 2026\n\nAustin Energy Customer Assistance\nP.O. Box 2267\nAustin, TX 78768-2267\n\nRE: Request for Deferred Payment Plan & Plus-1 Assistance — Account #AE-7829-4451-03\n\nDear Customer Service Department,\n\nI am writing to formally request a deferred payment arrangement for my electric account #AE-7829-4451-03 at 5612 Manor Road, Apt 12, Austin, TX 78723.\n\nI received the disconnection notice dated September 30, 2026 for $340.10 with a disconnection date of October 7, 2026. I am experiencing temporary financial hardship and cannot pay the total amount at once. However, I can pay an initial payment of $[AMOUNT] immediately and the remaining balance split across my next two billing cycles.\n\nI also request an evaluation for the Austin Energy Customer Assistance Program (CAP) and Plus-1 Emergency Assistance fund. Please confirm receipt and place a temporary hold on disconnection.\n\nSincerely,\n\n[YOUR NAME]\nPhone: [YOUR PHONE NUMBER]`,
    },
    chatResponses: {
      default: 'Austin Energy allows customers to set up payment arrangements if you call (512) 494-9400 BEFORE the disconnection date of October 7. Also ask about the Plus-1 Financial Assistance fund and Travis County CEAP utility grants.',
    },
  },
  benefits: {
    id: 'benefits',
    analysis: {
      en: {
        tldr: 'Your food stamps (SNAP $485/month) and Medicaid will be stopped on November 1, 2026 unless you renew by October 15 and complete your phone interview on October 10.',
        category: 'benefits-denial',
        urgency: 'critical',
        sender: 'Texas Health and Human Services Commission (HHSC)',
        whatItWants: 'Submit your renewal application and income proofs by October 15, and answer your mandatory telephone interview on October 10 at 2:30 PM.',
        deadline: 'Interview: Oct 10 at 2:30 PM; Renewal Deadline: Oct 15, 2026',
        deadlineDate: '2026-10-15',
        financialAmount: '$485/month in SNAP benefits at risk',
        consequenceOfInaction: 'Your household will completely lose $485/month in food assistance and all family Medicaid healthcare coverage on November 1, 2026.',
        steps: [
          { order: 1, action: 'Put the phone interview on your calendar: October 10, 2026 at 2:30 PM. Keep your phone charged and nearby.', timeframe: 'Immediate' },
          { order: 2, action: 'Gather your last 30 days of pay stubs, current utility bill, and household IDs.', timeframe: 'This week' },
          { order: 3, action: 'Log into YourTexasBenefits.com or call 2-1-1 to submit your renewal paperwork before October 15.', timeframe: 'Before Oct 15' },
          { order: 4, action: 'If you need help completing the forms, contact Central Texas Food Bank SNAP assistance at (512) 282-2111.', timeframe: 'This week' },
        ],
        keyFacts: [
          'Case Number: TX-2026-847291 (Maria Santos, 4-person household)',
          'Monthly SNAP at stake: $485.00',
          'Phone interview date: October 10, 2026 at 2:30 PM',
          'Final paperwork deadline: October 15, 2026',
        ],
        isHighStakes: true,
        originalLanguageDetected: 'English',
      },
    },
    appeal: {
      en: `October 1, 2026\n\nTexas Health and Human Services Commission\n1601 Rutherford Lane\nAustin, TX 78754\n\nRE: Renewal Documentation Submission — Case #TX-2026-847291 (Maria Santos)\n\nTo Whom It May Concern,\n\nPlease find attached the required renewal documentation for my SNAP and Medicaid benefits under Case #TX-2026-847291.\n\nIncluded in this package:\n1. Completed renewal application form\n2. Proof of income (pay stubs for past 30 days)\n3. Current utility bill for residence verification\n4. Identification copies for household members\n\nI confirm that I am available for my telephone interview scheduled for October 10, 2026 at 2:30 PM at phone number (512) 555-0198. Please confirm receipt of these documents.\n\nSincerely,\n\nMaria Santos\nPhone: (512) 555-0198`,
    },
    chatResponses: {
      default: 'Be sure to answer calls from private or unlisted numbers on October 10 at 2:30 PM because state caseworkers often call from blocked lines. If you miss the call, dial 2-1-1 immediately to reschedule so your benefits are not cancelled.',
    },
  },
  medical: {
    id: 'medical',
    analysis: {
      en: {
        tldr: 'You were billed $2,185.00 for an ER visit because your insurance denied a CT scan ($2,215), but emergency services cannot legally be denied for lacking prior authorization.',
        category: 'medical-bill',
        urgency: 'action-required',
        sender: 'St. David\'s Medical Center (Billing Department)',
        whatItWants: 'Pay $2,185.00 by October 20, 2026, or appeal the denied CT scan with your insurance company, or apply for hospital financial aid.',
        deadline: 'October 20, 2026 (Payment or appeal due date)',
        deadlineDate: '2026-10-20',
        financialAmount: '$2,185.00',
        consequenceOfInaction: 'If unresolved within 90 days, the hospital may send the $2,185 balance to collections, damaging your credit score.',
        steps: [
          { order: 1, action: 'Call Blue Cross Blue Shield at 1-800-521-2227 to dispute the CT scan denial under the federal No Surprises Act and Emergency Care rules.', timeframe: 'Today' },
          { order: 2, action: 'Call St. David\'s Patient Financial Services at (512) 544-0024 and ask for an itemized bill with CPT billing codes.', timeframe: 'Today' },
          { order: 3, action: 'Ask St. David\'s to put a 30-day hold on the account while the insurance appeal is processed.', timeframe: 'Today' },
          { order: 4, action: 'Apply for St. David\'s Foundation Financial Assistance (charity care) at stdavidsfoundation.org to reduce or forgive the balance.', timeframe: 'This week' },
        ],
        keyFacts: [
          'Total emergency bill: $7,735.00; Patient balance: $2,185.00',
          'Insurance denied: CT scan ($2,215) citing "prior authorization needed"',
          'Emergency room visits do not require prior authorization under federal law',
          'Account #: SDM-2026-09-41872',
        ],
        isHighStakes: false,
        originalLanguageDetected: 'English',
      },
    },
    appeal: {
      en: `October 1, 2026\n\nBlue Cross Blue Shield of Texas\nAppeals & Grievances Department\nP.O. Box 660044\nDallas, TX 75266\n\nRE: Formal Appeal of Claim Denial — Emergency Care Services\nPatient: James R. Nguyen\nPolicy Number: BCB-7741928\nAccount / Claim Number: SDM-2026-09-41872\nDate of Service: August 14, 2026\nFacility: St. David's Medical Center Emergency Department\n\nDear Appeals Committee,\n\nI am writing to formally appeal your denial of coverage for the abdominal/pelvis CT scan performed on August 14, 2026 during my emergency department visit at St. David's Medical Center.\n\nYour denial notice stated that coverage was withheld due to a lack of \"Prior Authorization.\" Under both federal law (the Emergency Medical Treatment and Labor Act - EMTALA and the No Surprises Act) as well as Texas Insurance Code §1301.155, emergency medical screening and stabilizing diagnostic testing cannot be subjected to prior authorization requirements.\n\nI presented to the emergency room with acute symptoms requiring immediate diagnostic evaluation. The attending emergency physician determined the CT scan was medically necessary to rule out life-threatening conditions.\n\nI request an immediate reversal of this denial and prompt payment to St. David's Medical Center. Please respond in writing within 30 days.\n\nSincerely,\n\nJames R. Nguyen\nPhone: (512) 555-0144`,
    },
    chatResponses: {
      default: 'Under federal law and the No Surprises Act, emergency room diagnostic scans do not require prior authorization! Insurance companies routinely issue automated denials that get reversed when you submit a formal written appeal citing emergency care protections.',
    },
  },
};

export function getMockAnalysisForText(text: string, lang: string = 'en'): LetterAnalysis | null {
  const normalized = text.toLowerCase();
  let key: string | null = null;
  if (normalized.includes('notice to vacate') || normalized.includes('riverside apartments') || normalized.includes('eviction')) {
    key = 'eviction';
  } else if (normalized.includes('austin energy') || normalized.includes('disconnection of electric service') || normalized.includes('utility')) {
    key = 'utility';
  } else if (normalized.includes('snap') || normalized.includes('texas health and human services') || normalized.includes('medicaid')) {
    key = 'benefits';
  } else if (normalized.includes('st. david') || normalized.includes('hospital bill') || normalized.includes('ct scan') || normalized.includes('medical center')) {
    key = 'medical';
  }

  if (!key || !MOCK_ANALYSES[key]) return null;

  const mock = MOCK_ANALYSES[key];
  return mock.analysis[lang] || mock.analysis['en'] || null;
}

export function getMockAppealForCategory(category: string, lang: string = 'en'): string | null {
  for (const mock of Object.values(MOCK_ANALYSES)) {
    const analysis = mock.analysis['en'];
    if (analysis && analysis.category === category) {
      return mock.appeal[lang] || mock.appeal['en'] || null;
    }
  }
  return null;
}

export function getMockChatResponse(question: string, letterContext: string): string {
  const normLetter = letterContext.toLowerCase();
  for (const [key, mock] of Object.entries(MOCK_ANALYSES)) {
    if (normLetter.includes(key) || (key === 'eviction' && normLetter.includes('vacate')) || (key === 'utility' && normLetter.includes('electric'))) {
      return mock.chatResponses.default;
    }
  }
  return 'TL;DR Mail tip: Be sure to check the exact deadline on your letter, gather all requested documentation, and contact one of the free local aid organizations listed below for personalized assistance.';
}
