import { LocalResource } from './types';

export const LOCAL_RESOURCES: LocalResource[] = [
  {
    name: 'Texas RioGrande Legal Aid (TRLA)',
    description: 'Free legal help for low-income Texans facing eviction, foreclosure, and housing issues.',
    phone: '1-888-988-9996',
    website: 'https://www.trla.org',
    categories: ['eviction', 'court-summons', 'debt-collection'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: true,
    region: 'Austin, TX / Central Texas',
  },
  {
    name: 'Austin Tenants Council',
    description: 'Free housing counseling, tenant rights education, and fair housing complaint assistance.',
    phone: '(512) 474-1961',
    website: 'https://www.housing-rights.org',
    categories: ['eviction', 'utility-shutoff'],
    hours: 'Mon-Fri 9:00 AM - 5:00 PM',
    isFree: true,
    region: 'Austin, TX',
  },
  {
    name: 'Austin Energy Customer Assistance Program (CAP)',
    description: 'Discounts on monthly electric bills for qualifying low-income Austin Energy customers.',
    phone: '(512) 494-9400',
    website: 'https://austinenergy.com/ae/residential/your-bill/customer-assistance-program',
    categories: ['utility-shutoff'],
    hours: 'Mon-Fri 7:30 AM - 6:00 PM',
    isFree: true,
    region: 'Austin, TX',
  },
  {
    name: 'Texas Health and Human Services (HHSC)',
    description: 'Apply for or renew SNAP, Medicaid, TANF, and other public benefits programs.',
    phone: '2-1-1',
    website: 'https://www.hhs.texas.gov/services/financial/benefits-services',
    categories: ['benefits-denial', 'government'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: true,
    region: 'Texas (Statewide)',
  },
  {
    name: 'Central Texas Food Bank',
    description: 'Emergency food assistance and SNAP application help for Central Texas families.',
    phone: '(512) 282-2111',
    website: 'https://www.centraltexasfoodbank.org',
    categories: ['benefits-denial', 'government'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: true,
    region: 'Austin, TX / Central Texas',
  },
  {
    name: 'Travis County Health & Human Services',
    description: 'Emergency utility bill assistance through CEAP, MAP health coverage, and social services.',
    phone: '(512) 854-4120',
    website: 'https://www.traviscountytx.gov/health-human-services',
    categories: ['utility-shutoff', 'medical-bill', 'benefits-denial'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: true,
    region: 'Travis County, TX',
  },
  {
    name: 'Lone Star Legal Aid',
    description: 'Free civil legal services including debt defense, tax disputes, and consumer protection.',
    phone: '1-800-733-8394',
    website: 'https://www.lonestarlegal.org',
    categories: ['debt-collection', 'tax-notice', 'court-summons', 'insurance'],
    hours: 'Mon-Fri 9:00 AM - 5:00 PM',
    isFree: true,
    region: 'Texas (Statewide)',
  },
  {
    name: 'Foundation Communities - Financial Coaching',
    description: 'Free financial coaching, tax preparation, and health insurance enrollment assistance.',
    phone: '(512) 610-7349',
    website: 'https://foundcom.org',
    categories: ['medical-bill', 'tax-notice', 'insurance', 'debt-collection'],
    hours: 'Mon-Sat, varies by location',
    isFree: true,
    region: 'Austin, TX',
  },
  {
    name: 'CommUnity Care Health Centers',
    description: 'Sliding-scale primary care, dental, and behavioral health for uninsured and underinsured patients.',
    phone: '(512) 978-9015',
    website: 'https://communitycaretx.org',
    categories: ['medical-bill', 'insurance'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: false,
    region: 'Austin, TX / Travis County',
  },
  {
    name: 'Texas 2-1-1 (United Way)',
    description: 'Statewide helpline connecting residents to local social services, food, shelter, and crisis support.',
    phone: '2-1-1',
    website: 'https://www.211texas.org',
    categories: ['eviction', 'utility-shutoff', 'benefits-denial', 'medical-bill', 'court-summons', 'tax-notice', 'school-form', 'insurance', 'debt-collection', 'government', 'unknown'],
    hours: '24/7',
    isFree: true,
    region: 'Texas (Statewide)',
  },
  {
    name: 'Texas Access to Justice Foundation',
    description: 'Connects low-income Texans with free legal aid for civil matters including housing, family, and consumer law.',
    phone: '(512) 320-0099',
    website: 'https://www.teajf.org',
    categories: ['eviction', 'court-summons', 'debt-collection', 'government'],
    hours: 'Mon-Fri 9:00 AM - 5:00 PM',
    isFree: true,
    region: 'Texas (Statewide)',
  },
  {
    name: 'St. David\'s Foundation Financial Assistance',
    description: 'Financial assistance for medical bills at St. David\'s HealthCare hospitals for qualifying patients.',
    phone: '(512) 544-0024',
    website: 'https://stdavidsfoundation.org',
    categories: ['medical-bill'],
    hours: 'Mon-Fri 8:00 AM - 5:00 PM',
    isFree: true,
    region: 'Austin, TX',
  },
];

export function getResourcesForCategory(category: string): LocalResource[] {
  const norm = (category || '').toLowerCase();
  const matched = LOCAL_RESOURCES.filter((r) =>
    r.categories.some((cat) => norm.includes(cat) || cat.includes(norm))
  );
  return matched.length > 0
    ? matched
    : LOCAL_RESOURCES.filter((r) => r.categories.includes('unknown'));
}
