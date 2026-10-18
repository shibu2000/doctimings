import { AvailabilityStatus, Doctor, EstablishmentType, PracticeLocation, ScheduleItem } from '../types';

export interface ApiEstablishment {
  id: string;
  name: string;
  type: string;
  district: string;
  subDistrict: string;
  address: string;
  pinCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  updatedAt?: string;
}

export interface ApiSchedule {
  id: string;
  establishmentId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  shiftName: string;
  roomNumber: string;
  isActive: boolean;
}

export interface ApiOverride {
  id: string;
  establishmentId: string;
  date: string;
  overrideType: 'unavailable' | 'changed' | 'additional';
  newStartTime: string | null;
  newEndTime: string | null;
  publicReason: string;
}

export interface ApiDoctor {
  id: string;
  fullName: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  primaryPhone: string;
  registrationNumber: string;
  council: string;
  languages: string[];
  photoUrl: string | null;
  verificationStatus: string;
  updatedAt?: string;
  affiliatedEstablishments: ApiEstablishment[];
  schedules: ApiSchedule[];
  overrides?: ApiOverride[];
}

export interface Origin {
  latitude: number;
  longitude: number;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_BN = ['সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার'];
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const SPECIALTY_BN: Record<string, string> = {
  'General Medicine': 'জেনারেল মেডিসিন',
  Pediatrics: 'শিশু রোগ বিশেষজ্ঞ',
  'Gynecology & Obstetrics': 'স্ত্রী ও প্রসূতি রোগ',
  Dermatology: 'চর্মরোগ বিশেষজ্ঞ',
  Orthopedics: 'হাড় ও জয়েন্ট বিশেষজ্ঞ',
  Cardiology: 'হৃদরোগ বিশেষজ্ঞ',
  ENT: 'নাক-কান-গলা বিশেষজ্ঞ',
  Ophthalmology: 'চক্ষু বিশেষজ্ঞ',
  Dentistry: 'দন্ত চিকিৎসক',
  'General Surgery': 'জেনারেল সার্জারি',
  Pulmonology: 'বক্ষ ও শ্বাসরোগ বিশেষজ্ঞ',
  Gastroenterology: 'পেট ও লিভার বিশেষজ্ঞ',
  Neurology: 'স্নায়ুরোগ বিশেষজ্ঞ',
  Psychiatry: 'মনোরোগ বিশেষজ্ঞ',
  Urology: 'মূত্ররোগ বিশেষজ্ঞ',
  Nephrology: 'কিডনি রোগ বিশেষজ্ঞ',
  Endocrinology: 'হরমোন ও ডায়াবেটিস বিশেষজ্ঞ',
  Oncology: 'ক্যান্সার বিশেষজ্ঞ'
};

const ESTABLISHMENT_TYPES: Record<string, EstablishmentType> = {
  Pharmacy: 'pharmacy',
  'Doctor Chamber': 'doctor_chamber',
  Clinic: 'clinic',
  Polyclinic: 'clinic',
  'Nursing Home': 'nursing_home',
  Hospital: 'hospital',
  'Diagnostic Center': 'diagnostic_center'
};

const istFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

export const istToday = () => {
  const parts = Object.fromEntries(istFormatter.formatToParts(new Date()).map(p => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const dayIndex = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  return { date, dayName: DAY_NAMES[dayIndex], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
};

export const distanceKm = (a: Origin, b: Origin) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10;
};

const toBengaliDigits = (text: string) => text.replace(/\d/g, d => BN_DIGITS[Number(d)]);

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const bengaliPeriod = (time: string) => {
  const h = Number(time.split(':')[0]);
  if (h < 12) return 'সকাল';
  if (h < 15) return 'দুপুর';
  if (h < 18) return 'বিকেল';
  if (h < 20) return 'সন্ধ্যা';
  return 'রাত';
};

const formatTimeBn = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return `${bengaliPeriod(time)} ${toBengaliDigits(`${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`)}`;
};

export const slotLabel = (start: string, end: string) => `${formatTime(start)} – ${formatTime(end)}`;
const slotLabelBn = (start: string, end: string) => `${formatTimeBn(start)} – ${formatTimeBn(end)}`;

const practiceStatus = (schedules: ApiSchedule[], overrides: ApiOverride[], today: ReturnType<typeof istToday>): AvailabilityStatus => {
  const todays = overrides.filter(o => o.date === today.date);
  const regular = schedules.filter(s => s.dayOfWeek === today.dayName);
  if (todays.some(o => o.overrideType === 'unavailable') && regular.length) return 'not_available';
  if (regular.length || todays.some(o => o.overrideType !== 'unavailable' && o.newStartTime)) return 'available_today';
  if (schedules.length) return 'scheduled_today';
  return 'unknown';
};

const RANK: Record<AvailabilityStatus, number> = { available_today: 0, not_available: 1, scheduled_today: 2, unknown: 3 };

const verification = (status: string): Doctor['verificationStatus'] =>
  status === 'Verified' ? 'verified' : status === 'Pending' ? 'pending' : 'unverified';

export const mapDoctor = (api: ApiDoctor, origin?: Origin): Doctor => {
  const today = istToday();
  const activeSchedules = api.schedules.filter(s => s.isActive);
  const overrides = api.overrides ?? [];

  const practices: PracticeLocation[] = api.affiliatedEstablishments
    .map(est => {
      const sessions = activeSchedules.filter(s => s.establishmentId === est.id);
      const estOverrides = overrides.filter(o => o.establishmentId === est.id);
      const todayNote = estOverrides.find(o => o.date === today.date)?.publicReason;
      const schedules: ScheduleItem[] = sessions
        .map(s => {
          const index = DAY_NAMES.indexOf(s.dayOfWeek);
          return {
            id: s.id,
            doctorPracticeId: `${api.id}-${est.id}`,
            dayOfWeek: index + 1,
            dayName: s.dayOfWeek,
            dayNameBn: DAY_NAMES_BN[index] ?? s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            slotLabel: slotLabel(s.startTime, s.endTime),
            slotLabelBn: slotLabelBn(s.startTime, s.endTime),
            isToday: s.dayOfWeek === today.dayName
          };
        })
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));

      return {
        id: `${api.id}-${est.id}`,
        establishmentId: est.id,
        establishmentName: est.name,
        establishmentType: ESTABLISHMENT_TYPES[est.type] ?? 'doctor_chamber',
        addressLine: est.address,
        locality: [est.subDistrict, est.district].filter(Boolean).join(', '),
        pincode: est.pinCode,
        latitude: est.latitude,
        longitude: est.longitude,
        phone: est.phone,
        distanceKm: origin ? distanceKm(origin, est) : undefined,
        notes: todayNote,
        notesBn: todayNote,
        schedules,
        availability: practiceStatus(sessions, estOverrides, today),
        lastVerifiedAt: est.updatedAt ?? api.updatedAt ?? new Date().toISOString()
      };
    })
    .sort((a, b) => RANK[a.availability] - RANK[b.availability] || (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  const bioParts = [api.qualifications, api.experienceYears > 0 ? `${api.experienceYears} years of experience` : '', api.council ? `Registered with ${api.council}` : '']
    .filter(Boolean)
    .join('. ');

  return {
    id: api.id,
    name: api.fullName,
    displayName: api.fullName,
    photoUrl: api.photoUrl ?? undefined,
    bio: bioParts,
    qualifications: api.qualifications,
    experienceYears: api.experienceYears,
    consultationFee: 0,
    phone: api.primaryPhone || undefined,
    registrationNumber: api.registrationNumber,
    registrationCouncil: api.council,
    verificationStatus: verification(api.verificationStatus),
    lastVerifiedAt: api.updatedAt ?? new Date().toISOString(),
    specialties: [api.specialty],
    specialtiesBn: [SPECIALTY_BN[api.specialty] ?? api.specialty],
    languages: api.languages,
    practices,
    todayAvailability: practices[0]?.availability ?? 'unknown'
  };
};
