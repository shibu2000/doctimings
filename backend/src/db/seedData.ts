export const SEED_USERS = [
  {
    id: 'USR-ADMIN-01',
    name: 'Shibu Dhara',
    email: 'admin@docnear.internal',
    phone: '+91 98000 11223',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Super Admin',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-OPS-02',
    name: 'Ananya Mukherjee',
    email: 'ananya@docnear.internal',
    phone: '+91 98320 44556',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Operations Admin',
    status: 'Active',
    lastActive: '10 mins ago'
  },
  {
    id: 'USR-OPS-03',
    name: 'Rajesh Sharma',
    email: 'admin.ops@docnear.org',
    phone: '+91 94340 12345',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Operations Admin',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-PTR-01',
    name: 'Rakesh Das',
    email: 'rakesh@example.com',
    phone: '+91 98765 43210',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Staff',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'USR-PTR-02',
    name: 'Rakesh Das',
    email: 'partner@docnear.org',
    phone: '+91 98765 43210',
    passwordHash: '$2a$10$wN1k6K.6Z6b2jW9fE12X.ezFjK9U8qY5Xq3wN1k6K.6Z6b2jW9fE1',
    role: 'Staff',
    status: 'Active',
    lastActive: 'Just now'
  }
];

export const SEED_DOCTORS = [
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
    isActive: true,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-MID-204', 'EST-JHR-301', 'EST-CKN-501', 'EST-GHT-503']
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
    isActive: true,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-HGY-034', 'EST-KHP-502', 'EST-CKN-501']
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
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'Verified',
    isActive: true,
    affiliatedEstablishmentIds: ['EST-MID-204', 'EST-CKN-501']
  },
  {
    id: 'DOC-BWN-104',
    fullName: 'Dr. Tanmoy Ghosh',
    specialty: 'Orthopedics',
    registrationNumber: 'WBMC-50891',
    council: 'West Bengal Medical Council',
    qualifications: 'MBBS, MS (Orthopedics), D.Ortho',
    experienceYears: 16,
    primaryPhone: '+91 98322 88471',
    languages: ['Bengali', 'English'],
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    verificationStatus: 'Verified',
    isActive: true,
    affiliatedEstablishmentIds: ['EST-BWN-842', 'EST-GHT-503']
  }
];

export const SEED_ESTABLISHMENTS = [
  {
    id: 'EST-BWN-842',
    name: 'Roy Pharmacy & Polyclinic',
    type: 'Pharmacy',
    district: 'Purba Bardhaman',
    subDistrict: 'Bardhaman Sadar North',
    address: 'Near Town Hall More, GT Road, Bardhaman',
    pinCode: '713101',
    phone: '+91 342 266 1209',
    proprietorName: 'Debabrata Roy',
    licenseNumber: 'WB-DL-BWN-2018-8421',
    latitude: 23.2428,
    longitude: 87.8634,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true
  },
  {
    id: 'EST-MID-204',
    name: 'Maa Tara Medical & Doctor Chamber',
    type: 'Doctor Chamber',
    district: 'Purba Bardhaman',
    subDistrict: 'Kalna',
    address: 'Station Road, Kalna Bus Stand',
    pinCode: '713409',
    phone: '+91 94341 55601',
    proprietorName: 'Swapan Kumar Paul',
    licenseNumber: 'WB-DL-KLN-2019-3320',
    latitude: 23.2201,
    longitude: 88.3644,
    verificationStatus: 'Verified',
    accountStatus: 'Platform Managed',
    isActive: true
  },
  {
    id: 'EST-JHR-301',
    name: 'Maa Medical Centre',
    type: 'Clinic',
    district: 'Jhargram',
    subDistrict: 'Gopiballavpur',
    address: 'Station Road, Gopiballavpur, Jhargram, West Bengal — 721506',
    pinCode: '721506',
    phone: '+91 98765 43210',
    proprietorName: 'Rakesh Das',
    licenseNumber: 'WB-DL-JHR-2021-9981',
    latitude: 22.2152,
    longitude: 86.9021,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true
  },
  {
    id: 'EST-CKN-501',
    name: 'Chandrakona Polyclinic & Seva Sadan',
    type: 'Doctor Chamber',
    district: 'Paschim Medinipur',
    subDistrict: 'Chandrakona',
    address: 'Near Hospital More, Chandrakona Town',
    pinCode: '721201',
    phone: '+91 94342 81901',
    proprietorName: 'Dr. S. K. Mandal',
    licenseNumber: 'WB-DL-CKN-2020-5120',
    latitude: 22.7303,
    longitude: 87.5255,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true
  },
  {
    id: 'EST-KHP-502',
    name: 'Khirpai Health Point & Pharmacy',
    type: 'Pharmacy',
    district: 'Paschim Medinipur',
    subDistrict: 'Khirpai',
    address: 'Bus Stand More, Khirpai',
    pinCode: '721232',
    phone: '+91 94343 92812',
    proprietorName: 'Ashok Kumar Roy',
    licenseNumber: 'WB-DL-KHP-2021-3918',
    latitude: 22.7095,
    longitude: 87.6186,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true
  },
  {
    id: 'EST-GHT-503',
    name: 'Ghatal Life Care Diagnostic & Chamber',
    type: 'Clinic',
    district: 'Paschim Medinipur',
    subDistrict: 'Ghatal',
    address: 'Kushpata More, Ghatal Hospital Road',
    pinCode: '721212',
    phone: '+91 3225 255 108',
    proprietorName: 'Tapan Mukherjee',
    licenseNumber: 'WB-DL-GHT-2017-8891',
    latitude: 22.6700,
    longitude: 87.7200,
    verificationStatus: 'Verified',
    accountStatus: 'Account Active',
    isActive: true
  }
];

export const SEED_PRACTICE_LOCATIONS = [
  {
    id: 'LOC-BWN-842-1',
    establishmentId: 'EST-BWN-842',
    name: 'Chamber 1 (Main Road Entry)',
    roomDesignation: 'Chamber 1 (Ground Floor)',
    floor: 'Ground Floor',
    isActive: true
  },
  {
    id: 'LOC-BWN-842-2',
    establishmentId: 'EST-BWN-842',
    name: 'Chamber 2 (Specialist Wing)',
    roomDesignation: 'Chamber 2 (1st Floor)',
    floor: '1st Floor',
    isActive: true
  },
  {
    id: 'LOC-MID-204-1',
    establishmentId: 'EST-MID-204',
    name: 'Ground Floor OPD Room',
    roomDesignation: 'Chamber A',
    floor: 'Ground Floor',
    isActive: true
  },
  {
    id: 'LOC-JHR-301-1',
    establishmentId: 'EST-JHR-301',
    name: 'Chamber 1 (Ground Floor)',
    roomDesignation: 'Chamber 1 · Ground Floor',
    floor: 'Ground Floor',
    isActive: true
  },
  {
    id: 'LOC-JHR-301-2',
    establishmentId: 'EST-JHR-301',
    name: 'Chamber 2 (Specialist Wing)',
    roomDesignation: 'Chamber 2 · 1st Floor',
    floor: '1st Floor',
    isActive: true
  },
  {
    id: 'LOC-CKN-501-1',
    establishmentId: 'EST-CKN-501',
    name: 'OPD Chamber 1',
    roomDesignation: 'Chamber 1 (Ground Floor)',
    floor: 'Ground Floor',
    isActive: true
  },
  {
    id: 'LOC-KHP-502-1',
    establishmentId: 'EST-KHP-502',
    name: 'Visiting Specialist Room',
    roomDesignation: 'Specialist Chamber',
    floor: 'Ground Floor',
    isActive: true
  },
  {
    id: 'LOC-GHT-503-1',
    establishmentId: 'EST-GHT-503',
    name: 'OPD Suite 101',
    roomDesignation: 'Chamber 101',
    floor: 'Ground Floor',
    isActive: true
  }
];

export const SEED_SCHEDULES = [
  {
    id: 'SCH-001',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-BWN-842-1',
    dayOfWeek: 'Monday',
    startTime: '16:00',
    endTime: '20:00',
    shiftName: 'Evening Skin OPD',
    roomNumber: 'Chamber 1',
    tokenPolicy: 'First Come First Served',
    maxTokens: 35,
    isActive: true
  },
  {
    id: 'SCH-002',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-BWN-842-1',
    dayOfWeek: 'Wednesday',
    startTime: '16:00',
    endTime: '20:00',
    shiftName: 'Evening Skin OPD',
    roomNumber: 'Chamber 1',
    tokenPolicy: 'First Come First Served',
    maxTokens: 35,
    isActive: true
  },
  {
    id: 'SCH-003',
    doctorId: 'DOC-BWN-102',
    establishmentId: 'EST-BWN-842',
    practiceLocationId: 'LOC-BWN-842-2',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '13:00',
    shiftName: 'Morning Pediatric Clinic',
    roomNumber: 'Chamber 2',
    tokenPolicy: 'Tokens via Compounder Desk',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-004',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-JHR-301',
    practiceLocationId: 'LOC-JHR-301-1',
    dayOfWeek: 'Thursday',
    startTime: '17:00',
    endTime: '19:00',
    shiftName: 'Evening Consultation',
    roomNumber: 'Chamber 1 (Ground Floor)',
    tokenPolicy: 'First Come First Served',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-005',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-JHR-301',
    practiceLocationId: 'LOC-JHR-301-1',
    dayOfWeek: 'Friday',
    startTime: '16:00',
    endTime: '18:30',
    shiftName: 'Specialist OPD',
    roomNumber: 'Chamber 1 (Ground Floor)',
    tokenPolicy: 'First Come First Served',
    maxTokens: 20,
    isActive: true
  },
  {
    id: 'SCH-CKN-001',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-CKN-501',
    practiceLocationId: 'LOC-CKN-501-1',
    dayOfWeek: 'Saturday',
    startTime: '10:00',
    endTime: '13:00',
    shiftName: 'Morning Skin OPD',
    roomNumber: 'Chamber 1 (Ground Floor)',
    tokenPolicy: 'First Come First Served',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-KHP-002',
    doctorId: 'DOC-BWN-102',
    establishmentId: 'EST-KHP-502',
    practiceLocationId: 'LOC-KHP-502-1',
    dayOfWeek: 'Saturday',
    startTime: '16:00',
    endTime: '19:00',
    shiftName: 'Evening Pediatric Clinic',
    roomNumber: 'Specialist Chamber',
    tokenPolicy: 'Tokens via Compounder Desk',
    maxTokens: 25,
    isActive: true
  },
  {
    id: 'SCH-CKN-003',
    doctorId: 'DOC-BWN-103',
    establishmentId: 'EST-CKN-501',
    practiceLocationId: 'LOC-CKN-501-1',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '12:00',
    shiftName: 'Morning Medicine OPD',
    roomNumber: 'Chamber 1 (Ground Floor)',
    tokenPolicy: 'First Come First Served',
    maxTokens: 30,
    isActive: true
  },
  {
    id: 'SCH-GHT-004',
    doctorId: 'DOC-BWN-104',
    establishmentId: 'EST-GHT-503',
    practiceLocationId: 'LOC-GHT-503-1',
    dayOfWeek: 'Friday',
    startTime: '15:00',
    endTime: '18:30',
    shiftName: 'Ortho Consultation',
    roomNumber: 'Chamber 101',
    tokenPolicy: 'First Come First Served',
    maxTokens: 20,
    isActive: true
  }
];

export const SEED_OVERRIDES = [
  {
    id: 'OVR-101',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    date: '2026-09-28',
    dayOfWeek: 'Monday',
    overrideType: 'unavailable',
    standardShift: '16:00 - 20:00',
    publicReason: 'Attending State Medical Conference at Medical College Kolkata',
    internalNote: 'Chemist notified via WhatsApp at 09:30 AM',
    reportedBy: 'Chemist Compounder Desk'
  },
  {
    id: 'OVR-102',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-JHR-301',
    date: '2026-09-28',
    dayOfWeek: 'Thursday',
    overrideType: 'unavailable',
    standardShift: '17:00 - 19:00',
    publicReason: 'Personal leave / Emergency',
    internalNote: 'Doctor notified chamber desk',
    reportedBy: 'Front Desk'
  }
];

export const SEED_REPORTS = [
  {
    id: 'RPT-2026-001',
    doctorId: 'DOC-BWN-101',
    establishmentId: 'EST-BWN-842',
    issueType: 'doc_unavailable',
    issueTitle: 'Doctor did not sit in Monday evening shift',
    description: 'Waited from 4 PM to 5:30 PM. Pharmacy assistant told doctor is out of town.',
    severity: 'medium',
    status: 'pending',
    source: 'Mobile App Patient',
    reporterPhone: '+91 98320 00001'
  }
];

export const SEED_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    timestamp: new Date().toISOString(),
    actorId: 'USR-ADMIN-01',
    actorName: 'Shibu Dhara',
    action: 'System Boot',
    entityType: 'System',
    entityId: 'SYS-INIT',
    entityName: 'DocNear API',
    details: 'Hono HTTP Server and database initialized'
  }
];

export const SEED_HEALTH_TOPICS = [
  {
    id: 'TOPIC-01',
    name: 'Seasonal Fever & Dengue',
    slug: 'seasonal-fever-dengue',
    category: 'Infectious Disease',
    description: 'Post-monsoon vector-borne fever management in rural Bengal',
    icon: 'Thermometer'
  },
  {
    id: 'TOPIC-02',
    name: 'Child Immunization & Nutrition',
    slug: 'child-immunization-nutrition',
    category: 'Pediatrics',
    description: 'Essential vaccine schedules and toddler nourishment',
    icon: 'Baby'
  }
];

export const SEED_HEALTH_ARTICLES = [
  {
    id: 'ART-01',
    topicId: 'TOPIC-01',
    title: 'Recognizing Warning Signs of Dengue Fever',
    slug: 'recognizing-warning-signs-dengue',
    summary: 'When to visit a clinic immediately instead of taking over-the-counter painkillers.',
    content: 'Full guidance on hydration, platelet monitoring, and paracetamol dosage.',
    language: 'BOTH',
    readTimeMin: 4,
    status: 'Published',
    viewsCount: 342
  }
];
