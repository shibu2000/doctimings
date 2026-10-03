import {
  Doctor,
  Establishment,
  ScheduleSlot,
  ScheduleOverride,
  CommunityReport,
  HealthTopic,
  HealthArticle,
  AdminUser,
  AuditLogEntry,
  Territory
} from '../types';

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'DOC-BWN-101',
    fullName: 'Dr. Amit Das',
    specialty: 'Dermatology',
    registrationNumber: 'WBMC-49201',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    experienceYears: 14,
    primaryPhone: '+91 98320 54119',
    email: 'dr.amitdas@wbhealth.gov.in',
    languages: ['Bengali', 'Hindi', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'Verified',
    isPracticingToday: true,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-MID-204', 'EST-JHR-301'],
    lastUpdated: '2026-09-25T11:20:00Z'
  },
  {
    id: 'DOC-BWN-102',
    fullName: 'Dr. Priya Banerjee',
    specialty: 'Pediatrics',
    registrationNumber: 'WBMC-52104',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, DCH, MD (Pediatrics)',
    experienceYears: 11,
    primaryPhone: '+91 94340 77123',
    email: 'dr.priyab@gmail.com',
    languages: ['Bengali', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1594824813576-9f4460592b23?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'Verified',
    isPracticingToday: true,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-HGY-034'],
    lastUpdated: '2026-09-24T16:40:00Z'
  },
  {
    id: 'DOC-BWN-103',
    fullName: 'Dr. Subhash Chandra Roy',
    specialty: 'General Medicine',
    registrationNumber: 'WBMC-38190',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MD (Internal Medicine)',
    experienceYears: 22,
    primaryPhone: '+91 98321 00293',
    languages: ['Bengali', 'Hindi', 'English'],
    verificationStatus: 'Verified',
    isPracticingToday: false,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-NAD-119'],
    lastUpdated: '2026-09-22T09:15:00Z'
  },
  {
    id: 'DOC-BWN-104',
    fullName: 'Dr. Ananya Sen',
    specialty: 'Gynecology & Obs',
    registrationNumber: 'WBMC-60291',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MS (Obstetrics & Gynaecology), DGO',
    experienceYears: 9,
    primaryPhone: '+91 94751 88301',
    languages: ['Bengali', 'English'],
    verificationStatus: 'Needs Review',
    isPracticingToday: true,
    affiliatedEstablishmentIds: ['EST-NAD-119'],
    lastUpdated: '2026-09-20T14:30:00Z'
  },
  {
    id: 'DOC-BWN-105',
    fullName: 'Dr. Bikramjit Ghosh',
    specialty: 'Orthopedics',
    registrationNumber: 'WBMC-44118',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MS (Orthopaedics)',
    experienceYears: 16,
    primaryPhone: '+91 98302 44912',
    languages: ['Bengali', 'Hindi', 'English'],
    verificationStatus: 'Verified',
    isPracticingToday: false,
    affiliatedEstablishmentIds: ['EST-HGY-034', 'EST-BHP-501'],
    lastUpdated: '2026-09-23T18:00:00Z'
  },
  {
    id: 'DOC-BWN-106',
    fullName: 'Dr. Tanushree Mukherjee',
    specialty: 'Cardiology',
    registrationNumber: 'WBMC-58203',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    experienceYears: 13,
    primaryPhone: '+91 94344 12890',
    languages: ['Bengali', 'English'],
    verificationStatus: 'Pending',
    isPracticingToday: false,
    affiliatedEstablishmentIds: ['EST-BWN-842'],
    lastUpdated: '2026-09-26T08:10:00Z'
  }
];

export const INITIAL_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'EST-BWN-842',
    name: 'Maa Medical Store & Attached Chamber',
    type: 'Pharmacy',
    district: 'Jhargram',
    subDistrict: 'Gopiballavpur',
    address: 'Station Road, Near Central Bus Stand, Gopiballavpur',
    pinCode: '721506',
    phone: '+91 94340 22109',
    proprietorName: 'Amit Kumar',
    licenseNumber: 'WB-CL-7215-09',
    latitude: 22.2134,
    longitude: 86.9012,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true,
    doctorCount: 4,
    practiceLocations: [
      {
        id: 'LOC-MMC-01',
        establishmentId: 'EST-BWN-842',
        name: 'Chamber 1 (Ground Floor Attached)',
        roomDesignation: 'Room 1',
        floor: 'Ground Floor',
        isActive: true
      },
      {
        id: 'LOC-MMC-02',
        establishmentId: 'EST-BWN-842',
        name: 'Chamber 2 (Specialist Consultation)',
        roomDesignation: 'Room 2',
        floor: 'First Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-26T10:15:00Z'
  },
  {
    id: 'EST-NAD-119',
    name: 'Ranaghat Matri Sadan Polyclinic',
    type: 'Polyclinic',
    district: 'Nadia',
    subDistrict: 'Ranaghat',
    address: 'Court Para, Hospital Road, Ranaghat',
    pinCode: '741201',
    phone: '+91 98311 44550',
    proprietorName: 'Dr. Debabrata Roy',
    licenseNumber: 'WB-CL-7412-14',
    latitude: 23.1812,
    longitude: 88.5833,
    verificationStatus: 'Needs Review',
    accountStatus: 'Invitation Pending',
    isActive: true,
    doctorCount: 6,
    practiceLocations: [
      {
        id: 'LOC-RMS-01',
        establishmentId: 'EST-NAD-119',
        name: 'OPD Suite A',
        roomDesignation: 'Suite A',
        floor: 'Ground Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-24T12:00:00Z'
  },
  {
    id: 'EST-HGY-034',
    name: 'Hooghly Apex Medicare & Diagnostic',
    type: 'Diagnostic Center',
    district: 'Hooghly',
    subDistrict: 'Chinsurah',
    address: 'GT Road, Near Chinsurah Railway Station',
    pinCode: '712101',
    phone: '+91 94330 99881',
    proprietorName: 'Sandip Chattopadhyay',
    licenseNumber: 'WB-CL-7121-02',
    latitude: 22.9011,
    longitude: 88.3954,
    verificationStatus: 'Verified',
    accountStatus: 'Invitation Pending',
    isActive: true,
    doctorCount: 8,
    practiceLocations: [
      {
        id: 'LOC-HAM-01',
        establishmentId: 'EST-HGY-034',
        name: 'Diagnostic Consultation Desk',
        roomDesignation: 'Room 101',
        floor: 'First Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-25T14:10:00Z'
  },
  {
    id: 'EST-BHP-501',
    name: 'Bolpur Seva Niketan Clinic',
    type: 'Clinic',
    district: 'Birbhum',
    subDistrict: 'Bolpur',
    address: 'Santiniketan Road, Opposite Post Office, Bolpur',
    pinCode: '731204',
    phone: '+91 98322 11990',
    proprietorName: 'Monojit Sen',
    licenseNumber: 'WB-CL-7312-88',
    latitude: 23.6702,
    longitude: 87.7214,
    verificationStatus: 'Verified',
    accountStatus: 'Platform Managed',
    isActive: true,
    doctorCount: 5,
    practiceLocations: [
      {
        id: 'LOC-BSN-01',
        establishmentId: 'EST-BHP-501',
        name: 'Chamber 1',
        roomDesignation: 'Cabin 1',
        floor: 'Ground Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-21T11:00:00Z'
  },
  {
    id: 'EST-MID-204',
    name: 'Shanti Clinic & Diagnostic',
    type: 'Clinic',
    district: 'Paschim Medinipur',
    subDistrict: 'Midnapore Sadar',
    address: 'Keranitola More, Midnapore Town',
    pinCode: '721101',
    phone: '+91 94341 00223',
    proprietorName: 'Dr. G. C. Mondal',
    licenseNumber: 'WB-CL-7211-55',
    latitude: 22.4257,
    longitude: 87.3199,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true,
    doctorCount: 7,
    practiceLocations: [
      {
        id: 'LOC-SC-01',
        establishmentId: 'EST-MID-204',
        name: 'Main OPD Chamber',
        roomDesignation: 'Room 3',
        floor: 'Ground Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-25T09:30:00Z'
  },
  {
    id: 'EST-JHR-301',
    name: 'Jhargram Poly-Care Center',
    type: 'Doctor Chamber',
    district: 'Jhargram',
    subDistrict: 'Jhargram Sadar',
    address: 'Station Road, Ward 4, Jhargram',
    pinCode: '721507',
    phone: '+91 98328 66100',
    proprietorName: 'Biswanath Mahato',
    licenseNumber: 'WB-CL-7215-77',
    latitude: 22.4511,
    longitude: 86.9854,
    verificationStatus: 'Pending',
    accountStatus: 'Platform Managed',
    isActive: true,
    doctorCount: 3,
    practiceLocations: [
      {
        id: 'LOC-JPC-01',
        establishmentId: 'EST-JHR-301',
        name: 'Consultation Suite 1',
        roomDesignation: 'Room 1',
        floor: 'Ground Floor',
        isActive: true
      }
    ],
    lastUpdated: '2026-09-26T07:45:00Z'
  }
];

export const INITIAL_SCHEDULE_SLOTS: ScheduleSlot[] = [
  {
    id: 'SCH-MB-01',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-MMC-01',
    dayOfWeek: 'Monday',
    startTime: '05:00 PM',
    endTime: '08:00 PM',
    shiftName: 'Evening Chamber',
    roomNumber: 'Room 1 (Ground Fl.)',
    tokenPolicy: 'First-come-first-served, max ~25 tokens at pharmacy counter',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-MB-02',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-MMC-01',
    dayOfWeek: 'Wednesday',
    startTime: '05:00 PM',
    endTime: '08:00 PM',
    shiftName: 'Evening Chamber',
    roomNumber: 'Room 1 (Ground Fl.)',
    tokenPolicy: 'First-come-first-served, max ~25 tokens at pharmacy counter',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-MB-03',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-MMC-01',
    dayOfWeek: 'Friday',
    startTime: '05:00 PM',
    endTime: '08:00 PM',
    shiftName: 'Evening Chamber',
    roomNumber: 'Room 1 (Ground Fl.)',
    tokenPolicy: 'First-come-first-served, max ~25 tokens at pharmacy counter',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-MB-04',
    doctorId: 'DOC-BWN-102',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-MMC-02',
    dayOfWeek: 'Tuesday',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    shiftName: 'Morning Pediatric Clinic',
    roomNumber: 'Room 2 (First Fl.)',
    tokenPolicy: 'Token distribution starts at 8:30 AM',
    maxTokens: 30,
    isActive: true
  },
  {
    id: 'SCH-MB-05',
    doctorId: 'DOC-BWN-102',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-MMC-02',
    dayOfWeek: 'Saturday',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    shiftName: 'Morning Pediatric Clinic',
    roomNumber: 'Room 2 (First Fl.)',
    tokenPolicy: 'Token distribution starts at 8:30 AM',
    maxTokens: 30,
    isActive: true
  }
];

export const INITIAL_OVERRIDES: ScheduleOverride[] = [
  {
    id: 'OVR-101',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    date: '2026-09-28',
    dayOfWeek: 'Monday',
    overrideType: 'unavailable',
    standardShift: '5:00 PM – 8:00 PM (Chamber 1)',
    publicReason: 'Personal leave / Attending medical conference',
    internalNote: 'Informed via pharmacist Amit Kumar (phone) at 10:30 AM on 25 Sep.',
    reportedBy: 'Rajesh Sharma',
    createdAt: '2026-09-25T11:20:00Z'
  },
  {
    id: 'OVR-102',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    date: '2026-10-02',
    dayOfWeek: 'Friday',
    overrideType: 'changed',
    standardShift: '5:00 PM – 8:00 PM (Chamber 1)',
    newStartTime: '06:00 PM',
    newEndTime: '08:00 PM',
    publicReason: 'National holiday shift modification (Gandhi Jayanti)',
    internalNote: 'Proprietor confirmation via WhatsApp memo. Delayed start by 1 hr.',
    reportedBy: 'Rajesh Sharma',
    createdAt: '2026-09-24T16:45:00Z'
  },
  {
    id: 'OVR-103',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    date: '2026-10-15',
    dayOfWeek: 'Thursday',
    overrideType: 'additional',
    standardShift: 'Not usually rostered on Thursdays',
    newStartTime: '10:00 AM',
    newEndTime: '01:00 PM',
    publicReason: 'Pre-Puja seasonal health screening camp',
    internalNote: 'Special community OPD session requested by chamber.',
    reportedBy: 'Dr. Amit Das (Self)',
    createdAt: '2026-09-22T09:15:00Z'
  }
];

export const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'RPT-1042',
    signalRef: 'SIG-202609-JH7',
    incidentUuid: 'f82a90-rpt',
    doctorId: 'DOC-BWN-101',
    doctorName: 'Dr. Amit Das',
    establishmentId: 'EST-BWN-842',
    establishmentName: 'Maa Medical Centre & Chamber',
    practiceLocationId: 'LOC-MMC-01',
    issueType: 'doc_unavailable',
    issueTitle: 'Doctor was not available at listed time',
    userQuote: 'I visited the clinic at 5 PM today, but the doctor was not there.',
    observedTimestamp: '25 Sep 2026, 05:42 PM IST',
    reporterTerritory: 'Gopiballavpur Cluster, Jhargram',
    status: 'pending',
    assignedAdmin: 'Rajesh Sharma',
    verificationMethod: 'Telephonic Call to Proprietor',
    adminNotes: 'Spoke directly with proprietor Amit Kumar at 10:15 AM on 26 Sep. Confirmed Dr. Das was delayed due to rural emergency surgery at Sub-Divisional Hospital. He arrived at 6:15 PM and attended all 18 waiting patients. The scheduled slot remains generally valid.',
    resolutionOutcome: 'checked_no_change',
    resolutionSummary: 'One-off transit delay due to emergency clinical call at Jhargram Sub-Divisional Hospital. Doctor completed chamber session from 6:15 PM to 8:30 PM. Weekly schedule slot remains valid and accurate. No recurring platform data change warranted.',
    scheduleSlotId: 'SCH-MB-01'
  },
  {
    id: 'RPT-1043',
    signalRef: 'SIG-202609-ND2',
    incidentUuid: 'c39d11-rpt',
    doctorId: 'DOC-BWN-104',
    doctorName: 'Dr. Ananya Sen',
    establishmentId: 'EST-NAD-119',
    establishmentName: 'Ranaghat Matri Sadan Polyclinic',
    issueType: 'sched_change',
    issueTitle: 'Schedule timing shifted from morning to evening',
    userQuote: 'Doctor now sits from 4 PM onwards on Tuesdays, not 10 AM as shown in app.',
    observedTimestamp: '25 Sep 2026, 11:15 AM IST',
    reporterTerritory: 'Ranaghat Sadar, Nadia',
    status: 'review',
    assignedAdmin: 'Priya Mukherjee'
  },
  {
    id: 'RPT-1044',
    signalRef: 'SIG-202609-HG4',
    incidentUuid: 'a88f42-rpt',
    doctorId: 'DOC-BWN-105',
    doctorName: 'Dr. Bikramjit Ghosh',
    establishmentId: 'EST-HGY-034',
    establishmentName: 'Hooghly Apex Medicare',
    issueType: 'no_longer_practices',
    issueTitle: 'Doctor has shifted to private nursing home',
    userQuote: 'Desk compounder informed that Dr. Ghosh no longer visits this chamber.',
    observedTimestamp: '24 Sep 2026, 03:00 PM IST',
    reporterTerritory: 'Chinsurah, Hooghly',
    status: 'review',
    assignedAdmin: 'Rajesh Sharma'
  },
  {
    id: 'RPT-1040',
    signalRef: 'SIG-202609-BW1',
    incidentUuid: 'e11b99-rpt',
    doctorId: 'DOC-BWN-103',
    doctorName: 'Dr. Subhash Chandra Roy',
    establishmentId: 'EST-BWN-842',
    establishmentName: 'Maa Medical Store',
    issueType: 'sched_change',
    issueTitle: 'Timing discrepancy resolved',
    userQuote: 'Morning tokens finish by 9 AM.',
    observedTimestamp: '23 Sep 2026, 09:30 AM IST',
    reporterTerritory: 'Burdwan Sadar',
    status: 'resolved',
    assignedAdmin: 'Priya Mukherjee',
    resolvedAt: '2026-09-24T10:00:00Z',
    resolvedBy: 'Priya Mukherjee',
    resolutionOutcome: 'confirmed_updated',
    resolutionSummary: 'Updated morning token distribution notice from 9:30 AM to 8:30 AM as confirmed by counter staff.'
  },
  {
    id: 'RPT-1039',
    signalRef: 'SIG-202609-MD9',
    incidentUuid: 'd55c70-rpt',
    doctorId: 'DOC-BWN-101',
    doctorName: 'Dr. Amit Das',
    establishmentId: 'EST-MID-204',
    establishmentName: 'Shanti Clinic & Diagnostic',
    issueType: 'info_incorrect',
    issueTitle: 'Duplicate report discard',
    userQuote: 'Old clinic phone number given.',
    observedTimestamp: '22 Sep 2026, 02:15 PM IST',
    reporterTerritory: 'Midnapore Sadar',
    status: 'rejected',
    assignedAdmin: 'Rajesh Sharma',
    resolvedAt: '2026-09-23T11:30:00Z',
    resolvedBy: 'Rajesh Sharma',
    resolutionOutcome: 'incorrect',
    resolutionSummary: 'Phone number verified via test call. Counter staff answered correctly. No change needed.'
  }
];

export const INITIAL_HEALTH_TOPICS: HealthTopic[] = [
  {
    id: 'HT-01',
    nameEn: 'Skin Problems & Rashes',
    nameBn: 'চামড়ার সমস্যা ও চুলকানি',
    specialty: 'Dermatology',
    iconName: 'coronavirus',
    colloquialBengaliTerms: ['চুলকানি', 'দাদ', 'হাজা', 'অ্যালার্জি', 'ফোড়া', 'চামড়া লাল'],
    articleCount: 6,
    isActive: true
  },
  {
    id: 'HT-02',
    nameEn: 'Child Health, Fever & Cough',
    nameBn: 'শিশুর স্বাস্থ্য, জ্বর ও সর্দি',
    specialty: 'Pediatrics',
    iconName: 'child_care',
    colloquialBengaliTerms: ['বাচ্চার জ্বর', 'হাঁচি সর্দি', 'বাচ্চার পেট খারাপ', 'শিশুর কাশি'],
    articleCount: 8,
    isActive: true
  },
  {
    id: 'HT-03',
    nameEn: 'Joint Pain & Orthopedics',
    nameBn: 'হাড় ও গাঁটের ব্যথা',
    specialty: 'Orthopedics',
    iconName: 'accessibility_new',
    colloquialBengaliTerms: ['হাঁটু ব্যথা', 'কোমর ব্যথা', 'বাত', 'হাড় মচকে যাওয়া'],
    articleCount: 5,
    isActive: true
  },
  {
    id: 'HT-04',
    nameEn: 'Women Health & Pregnancy',
    nameBn: 'মহিলাদের স্বাস্থ্য ও প্রসূতি',
    specialty: 'Gynecology & Obs',
    iconName: 'pregnant_woman',
    colloquialBengaliTerms: ['মাসিকের সমস্যা', 'গর্ভকালীন যত্ন', 'পেটের যন্ত্রণা', 'মহিলা ডাক্তার'],
    articleCount: 7,
    isActive: true
  },
  {
    id: 'HT-05',
    nameEn: 'General Illness & Fever',
    nameBn: 'সাধারণ রোগ ও জ্বর',
    specialty: 'General Medicine',
    iconName: 'stethoscope',
    colloquialBengaliTerms: ['জ্বর', 'মাথা ব্যথা', 'গায়ে ব্যথা', 'দুর্বলতা', 'পেট ব্যথা'],
    articleCount: 9,
    isActive: true
  },
  {
    id: 'HT-06',
    nameEn: 'Eye & Vision Care',
    nameBn: 'চোখের সমস্যা ও দৃষ্টি',
    specialty: 'Ophthalmology',
    iconName: 'visibility',
    colloquialBengaliTerms: ['চোখ লাল', 'চোখ চুলকানি', 'ঝাপসা দেখা', 'চোখ দিয়ে জল পড়া'],
    articleCount: 4,
    isActive: true
  }
];

export const INITIAL_HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'ART-201',
    title: 'When Should You See a Skin Doctor (Dermatologist)?',
    topicId: 'HT-01',
    topicName: 'Skin Problems & Rashes',
    language: 'BOTH',
    excerpt: 'Recognize common skin symptoms like fungal infections, persistent eczema, and unexplained rashes that require specialist consultation.',
    bodyContent: 'Skin conditions are widespread across rural and suburban Bengal, especially during humid monsoon and summer months. Common complaints range from ringworm (দাদ) and fungal intertrigo (হাজা) between toes to persistent allergic dermatitis. While over-the-counter soothing creams may provide brief relief, steroid-based topical preparations can aggravate fungal infections significantly.',
    whenToSeeDoctor: [
      'Rash or itching spreads rapidly and does not improve after 48 hours',
      'Presence of blisters, pus, or severe localized skin pain',
      'Fungal infection recurs despite home hygiene measures',
      'Discoloration or new pigmented mole that changes shape or size',
      'Infant or elderly family member developing widespread redness'
    ],
    targetSpecialty: 'Dermatology',
    status: 'Published',
    viewsCount: 3842,
    updatedAt: '2026-09-24T14:15:00Z'
  },
  {
    id: 'ART-202',
    title: 'Recognizing Warning Signs in Child Fever',
    topicId: 'HT-02',
    topicName: 'Child Health, Fever & Cough',
    language: 'BOTH',
    excerpt: 'Essential checklist for parents when a young child has a fever or breathing difficulty.',
    bodyContent: 'Pediatric fevers are often triggered by viral upper respiratory infections. In hot climates, keeping the child hydrated with clean ORS water and breast milk is critical. Avoid cold sponging with ice water, and never administer adult pain medications or aspirin to children.',
    whenToSeeDoctor: [
      'Child is unusually drowsy, lethargic, or difficult to awaken',
      'Fast breathing, chest flaring, or wheezing sounds',
      'Fever exceeds 102°F (39°C) or lasts more than 3 consecutive days',
      'Child refuses all fluids and passes no urine for over 6 hours',
      'Development of sudden purple or dark red pinprick rashes'
    ],
    targetSpecialty: 'Pediatrics',
    status: 'Published',
    viewsCount: 5120,
    updatedAt: '2026-09-22T10:00:00Z'
  },
  {
    id: 'ART-203',
    title: 'Managing Knee and Lower Back Pain in Daily Work',
    topicId: 'HT-03',
    topicName: 'Joint Pain & Orthopedics',
    language: 'EN',
    excerpt: 'Practical ergonomic advice and when to seek orthopedic consultation for persistent joint stiffness.',
    bodyContent: 'Agricultural work, continuous standing, and daily travel on uneven roads place substantial mechanical stress on lumbar vertebrae and knee cartilage. Regular gentle stretches and calcium-rich nutrition help maintain joint mobility.',
    whenToSeeDoctor: [
      'Inability to bear weight on the affected limb after a trip or fall',
      'Joint appears visibly swollen, hot to the touch, or deformed',
      'Numbness or tingling radiating down the leg or foot',
      'Persistent night pain that disrupts regular sleep'
    ],
    targetSpecialty: 'Orthopedics',
    status: 'Published',
    viewsCount: 2280,
    updatedAt: '2026-09-20T16:30:00Z'
  },
  {
    id: 'ART-204',
    title: 'Recognizing Heat Exhaustion vs. Dehydration',
    topicId: 'HT-05',
    topicName: 'General Illness & Fever',
    language: 'BOTH',
    excerpt: 'Differentiating mild summer dehydration from clinical heat exhaustion requiring prompt medical intervention.',
    bodyContent: 'High ambient humidity hampers sweat evaporation, causing rapid core temperature spikes. Immediate hydration and cool shaded rest are vital first-line measures.',
    whenToSeeDoctor: [
      'Confusion, slurred speech, or fainting episode',
      'Vomiting prevents intake of oral fluids',
      'Rapid heart rate with dry, hot skin and cessation of sweating',
      'High fever in elderly individuals'
    ],
    targetSpecialty: 'General Medicine',
    status: 'Draft',
    viewsCount: 140,
    updatedAt: '2026-09-25T11:00:00Z'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-001',
    name: 'Shibu Dhara',
    email: 'shibu.dhara@docnear.org',
    phone: '+91 98320 00001',
    role: 'Platform Admin',
    status: 'Active',
    lastActive: 'Just now',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'USR-002',
    name: 'Rajesh Sharma',
    email: 'admin.ops@docnear.org',
    phone: '+91 94340 12345',
    role: 'Operations Admin',
    status: 'Active',
    lastActive: '5 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'USR-003',
    name: 'Priya Mukherjee',
    email: 'priya.m@docnear.org',
    phone: '+91 98311 99002',
    role: 'Verification Admin',
    status: 'Active',
    lastActive: '45 mins ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'USR-004',
    name: 'Amit Kumar (Chemist Desk)',
    email: 'maamedical.desk@gmail.com',
    phone: '+91 94340 22109',
    role: 'Establishment Admin',
    scopedEstablishmentId: 'EST-BWN-842',
    scopedEstablishmentName: 'Maa Medical Store',
    status: 'Active',
    lastActive: 'Yesterday',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'USR-005',
    name: 'Ranaghat Matri Sadan Desk',
    email: 'rms.opd@outlook.com',
    phone: '+91 98311 44550',
    role: 'Establishment Admin',
    scopedEstablishmentId: 'EST-NAD-119',
    scopedEstablishmentName: 'Ranaghat Matri Sadan',
    status: 'Pending',
    lastActive: 'Invited 2 days ago'
  }
];

export const INITIAL_TERRITORIES: Territory[] = [
  {
    id: 'TER-01',
    district: 'Jhargram',
    subDistrict: 'Gopiballavpur',
    pinCodes: ['721506', '721517'],
    establishmentCount: 24,
    doctorCount: 38,
    verificationCoveragePercent: 88.5
  },
  {
    id: 'TER-02',
    district: 'Purba Bardhaman',
    subDistrict: 'Burdwan Sadar',
    pinCodes: ['713101', '713102', '713103'],
    establishmentCount: 92,
    doctorCount: 164,
    verificationCoveragePercent: 82.0
  },
  {
    id: 'TER-03',
    district: 'Nadia',
    subDistrict: 'Ranaghat',
    pinCodes: ['741201', '741202'],
    establishmentCount: 46,
    doctorCount: 78,
    verificationCoveragePercent: 74.2
  },
  {
    id: 'TER-04',
    district: 'Hooghly',
    subDistrict: 'Chinsurah',
    pinCodes: ['712101', '712102'],
    establishmentCount: 52,
    doctorCount: 90,
    verificationCoveragePercent: 79.8
  },
  {
    id: 'TER-05',
    district: 'Birbhum',
    subDistrict: 'Bolpur',
    pinCodes: ['731204', '731235'],
    establishmentCount: 34,
    doctorCount: 42,
    verificationCoveragePercent: 71.4
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-8891',
    timestamp: '2026-09-26T10:15:00Z',
    actorName: 'Rajesh Sharma',
    actorRole: 'Operations Admin',
    action: 'Resolved Report #RPT-1042',
    entityType: 'Report',
    entityId: 'RPT-1042',
    entityName: 'Dr. Amit Das Availability Discrepancy',
    details: 'Verified phone call with chemist Amit Kumar. Doctor delayed due to emergency duty. Checked - no recurring roster change required.'
  },
  {
    id: 'LOG-8890',
    timestamp: '2026-09-25T11:20:00Z',
    actorName: 'Rajesh Sharma',
    actorRole: 'Operations Admin',
    action: 'Added Schedule Override',
    entityType: 'Override',
    entityId: 'OVR-101',
    entityName: 'Dr. Amit Das (28 Sep 2026)',
    details: 'Marked unavailable for 28 Sep 2026 at Maa Medical Store due to medical conference.'
  },
  {
    id: 'LOG-8889',
    timestamp: '2026-09-25T09:30:00Z',
    actorName: 'Priya Mukherjee',
    actorRole: 'Verification Admin',
    action: 'Issued Verification Badge',
    entityType: 'Establishment',
    entityId: 'EST-MID-204',
    entityName: 'Shanti Clinic & Diagnostic',
    details: 'Completed physical registry check and updated WB-CL license expiration verification.'
  },
  {
    id: 'LOG-8888',
    timestamp: '2026-09-24T16:45:00Z',
    actorName: 'Rajesh Sharma',
    actorRole: 'Operations Admin',
    action: 'Updated Schedule Slot',
    entityType: 'Schedule',
    entityId: 'SCH-MB-01',
    entityName: 'Dr. Amit Das Monday Chamber',
    details: 'Adjusted evening chamber start time to 5:00 PM and clarified token cap of 25.'
  },
  {
    id: 'LOG-8887',
    timestamp: '2026-09-24T14:15:00Z',
    actorName: 'Shibu Dhara',
    actorRole: 'Platform Admin',
    action: 'Published Health Article',
    entityType: 'Article',
    entityId: 'ART-201',
    entityName: 'When Should You See a Skin Doctor?',
    details: 'Reviewed and published educational article with linked dermatology specialty router.'
  }
];
