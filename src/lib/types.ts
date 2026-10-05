export type UrgencyLevel = 'critical' | 'action-required' | 'informational';

export type LetterCategory =
  | 'eviction'
  | 'utility-shutoff'
  | 'benefits-denial'
  | 'medical-bill'
  | 'court-summons'
  | 'tax-notice'
  | 'school-form'
  | 'insurance'
  | 'debt-collection'
  | 'government'
  | 'unknown';

export interface LetterAnalysis {
  tldr: string;
  category: LetterCategory;
  urgency: UrgencyLevel;
  sender: string;
  whatItWants: string;
  deadline: string | null;
  deadlineDate: string | null;
  financialAmount: string | null;
  consequenceOfInaction: string;
  steps: ActionStep[];
  keyFacts: string[];
  isHighStakes: boolean;
  originalLanguageDetected: string;
}

export interface ActionStep {
  order: number;
  action: string;
  timeframe: string;
}

export interface LocalResource {
  name: string;
  description: string;
  phone: string;
  website: string;
  categories: LetterCategory[];
  hours: string;
  isFree: boolean;
  region: string;
}

export interface AppealLetter {
  subject: string;
  body: string;
  recipientName: string;
  recipientAddress: string;
}

export type SupportedLanguage = 'en' | 'es' | 'vi' | 'zh' | 'ar';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  vi: 'Tiếng Việt',
  zh: '中文',
  ar: 'العربية',
};

export interface AnalysisState {
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  result: LetterAnalysis | null;
  error: string | null;
  resources: LocalResource[];
  appealLetter: AppealLetter | null;
}
