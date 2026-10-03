export interface Establishment {
  id: string;
  name: string;
  type: string;
  district: string;
  subDistrict: string;
  address: string;
  pinCode: string;
  phone: string;
  proprietorName: string;
  licenseNumber: string;
  latitude: number;
  longitude: number;
  verificationStatus: string;
  accountStatus: string;
  isActive: boolean;
}

export interface PracticeLocation {
  id: string;
  establishmentId: string;
  name: string;
  roomDesignation: string;
  floor: string;
  isActive: boolean;
}

export interface Schedule {
  id: string;
  doctorId: string;
  establishmentId: string;
  practiceLocationId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  shiftName: string;
  roomNumber: string;
  tokenPolicy: string;
  maxTokens: number;
  isActive: boolean;
}

export interface TodayAvailability {
  isAvailable: boolean;
  day: string;
  shifts: string[];
  note: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  registrationNumber: string;
  council: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  email?: string;
  languages: string[];
  photoUrl?: string;
  verificationStatus: string;
  isActive: boolean;
  affiliatedEstablishmentIds: string[];
  distanceKm?: number;
  primaryEstablishment?: Establishment | null;
  affiliatedEstablishments: Establishment[];
  schedules: Schedule[];
  todayAvailability: TodayAvailability;
}

export interface SearchApiResponse {
  data: Doctor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  searchMeta: {
    query: string | null;
    specialty: string | null;
    coordinates: { latitude: number; longitude: number } | null;
    appliedRadiusKm: number;
    autoExpandedRadius: boolean;
    targetDay: string;
  };
}

export interface BengalCity {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  isPopular?: boolean;
}
