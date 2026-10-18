export const SPECIALTIES = [
  'General Medicine',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Dermatology',
  'Orthopedics',
  'Cardiology',
  'ENT',
  'Ophthalmology',
  'Dentistry',
  'General Surgery',
  'Pulmonology',
  'Gastroenterology',
  'Neurology',
  'Psychiatry',
  'Urology',
  'Nephrology',
  'Endocrinology',
  'Oncology'
];

export const ESTABLISHMENT_TYPES = [
  'Pharmacy',
  'Doctor Chamber',
  'Clinic',
  'Polyclinic',
  'Nursing Home',
  'Hospital',
  'Diagnostic Center'
];

export const WEST_BENGAL_DISTRICTS = [
  'Alipurduar',
  'Bankura',
  'Birbhum',
  'Cooch Behar',
  'Dakshin Dinajpur',
  'Darjeeling',
  'Hooghly',
  'Howrah',
  'Jalpaiguri',
  'Jhargram',
  'Kalimpong',
  'Kolkata',
  'Malda',
  'Murshidabad',
  'Nadia',
  'North 24 Parganas',
  'Paschim Bardhaman',
  'Paschim Medinipur',
  'Purba Bardhaman',
  'Purba Medinipur',
  'Purulia',
  'South 24 Parganas',
  'Uttar Dinajpur'
];

export const LANGUAGES = ['Bengali', 'English', 'Hindi', 'Santali', 'Odia'];

export const AWAY_REASONS = ['On leave', 'Unwell', 'Emergency', 'Holiday', 'Attending a camp'];

export const STAFF_ROLES = ['Super Admin', 'Operations Admin', 'District Lead', 'Verifier', 'Staff'] as const;

export const REPORT_TYPES: Record<string, string> = {
  doc_unavailable: 'Doctor was not available',
  sched_change: 'Timing has changed',
  no_longer_practices: 'Doctor no longer sits here',
  info_incorrect: 'Wrong information',
  est_closed: 'Place is closed',
  other: 'Other'
};
