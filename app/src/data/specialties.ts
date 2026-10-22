interface Text {
  en: string;
  bn: string;
}

interface SpecialtyInfo {
  plain: Text;
  conditions: Text[];
}

const SPECIALTIES: Record<string, SpecialtyInfo> = {
  'General Medicine': {
    plain: { en: 'Doctor for fever and everyday illness', bn: 'জ্বর ও সাধারণ অসুখের ডাক্তার' },
    conditions: [
      { en: 'Fever', bn: 'জ্বর' },
      { en: 'Cold and cough', bn: 'সর্দি-কাশি' },
      { en: 'Body ache and weakness', bn: 'গা ব্যথা ও দুর্বলতা' },
      { en: 'Blood pressure', bn: 'রক্তচাপ' },
      { en: 'Sugar (diabetes)', bn: 'সুগার (ডায়াবেটিস)' },
      { en: 'Stomach upset', bn: 'পেটের গোলমাল' },
    ],
  },
  Pediatrics: {
    plain: { en: "Children's doctor", bn: 'শিশুদের ডাক্তার' },
    conditions: [
      { en: 'Fever in children', bn: 'বাচ্চার জ্বর' },
      { en: 'Cough and breathing trouble', bn: 'কাশি ও শ্বাসকষ্ট' },
      { en: 'Loose motion', bn: 'পাতলা পায়খানা' },
      { en: 'Vaccination', bn: 'টিকা' },
      { en: 'Growth and feeding', bn: 'বৃদ্ধি ও খাওয়াদাওয়া' },
      { en: 'Newborn care', bn: 'নবজাতকের যত্ন' },
    ],
  },
  'Gynecology & Obstetrics': {
    plain: { en: "Women's health and pregnancy doctor", bn: 'মহিলা ও প্রসূতি রোগের ডাক্তার' },
    conditions: [
      { en: 'Pregnancy check-ups', bn: 'গর্ভাবস্থার চেকআপ' },
      { en: 'Period problems', bn: 'মাসিকের সমস্যা' },
      { en: 'White discharge', bn: 'সাদা স্রাব' },
      { en: 'Lower belly pain', bn: 'তলপেটে ব্যথা' },
      { en: 'Family planning', bn: 'পরিবার পরিকল্পনা' },
      { en: 'Menopause', bn: 'মেনোপজ' },
    ],
  },
  'General Surgery': {
    plain: { en: 'Surgeon for operations and wounds', bn: 'অপারেশন ও ক্ষতের ডাক্তার' },
    conditions: [
      { en: 'Hernia', bn: 'হার্নিয়া' },
      { en: 'Piles and fissure', bn: 'পাইলস ও ফিশার' },
      { en: 'Gallbladder stone', bn: 'পিত্তথলির পাথর' },
      { en: 'Appendix', bn: 'অ্যাপেন্ডিক্স' },
      { en: 'Lumps and boils', bn: 'টিউমার ও ফোড়া' },
      { en: 'Wounds and injuries', bn: 'ক্ষত ও আঘাত' },
    ],
  },
  ENT: {
    plain: { en: 'Ear, nose and throat doctor', bn: 'নাক-কান-গলার ডাক্তার' },
    conditions: [
      { en: 'Ear pain or discharge', bn: 'কানে ব্যথা বা পুঁজ' },
      { en: 'Hearing loss', bn: 'কানে কম শোনা' },
      { en: 'Blocked nose and sinus', bn: 'নাক বন্ধ ও সাইনাস' },
      { en: 'Sore throat and tonsils', bn: 'গলা ব্যথা ও টনসিল' },
      { en: 'Dizziness', bn: 'মাথা ঘোরা' },
    ],
  },
  Gastroenterology: {
    plain: { en: 'Stomach, liver and digestion doctor', bn: 'পেট, লিভার ও হজমের ডাক্তার' },
    conditions: [
      { en: 'Acidity and gas', bn: 'অম্বল ও গ্যাস' },
      { en: 'Stomach pain', bn: 'পেটে ব্যথা' },
      { en: 'Loose motion or constipation', bn: 'পাতলা পায়খানা বা কোষ্ঠকাঠিন্য' },
      { en: 'Jaundice and liver problems', bn: 'জন্ডিস ও লিভারের সমস্যা' },
      { en: 'Ulcer', bn: 'আলসার' },
      { en: 'Vomiting', bn: 'বমি' },
    ],
  },
  Orthopedics: {
    plain: { en: 'Bone and joint doctor', bn: 'হাড় ও জয়েন্টের ডাক্তার' },
    conditions: [
      { en: 'Joint pain and arthritis', bn: 'গাঁটে ব্যথা ও বাত' },
      { en: 'Back and neck pain', bn: 'কোমর ও ঘাড়ে ব্যথা' },
      { en: 'Fractures', bn: 'হাড় ভাঙা' },
      { en: 'Sprains', bn: 'মচকানো' },
      { en: 'Knee pain', bn: 'হাঁটুতে ব্যথা' },
    ],
  },
  Cardiology: {
    plain: { en: 'Heart doctor', bn: 'হৃদরোগের ডাক্তার' },
    conditions: [
      { en: 'Chest pain', bn: 'বুকে ব্যথা' },
      { en: 'High blood pressure', bn: 'উচ্চ রক্তচাপ' },
      { en: 'Breathlessness', bn: 'শ্বাসকষ্ট' },
      { en: 'Fast or irregular heartbeat', bn: 'বুক ধড়ফড়' },
      { en: 'Swelling in legs', bn: 'পা ফোলা' },
    ],
  },
  Diabetology: {
    plain: { en: 'Sugar (diabetes) doctor', bn: 'সুগার (ডায়াবেটিস) রোগের ডাক্তার' },
    conditions: [
      { en: 'High blood sugar', bn: 'রক্তে সুগার বেশি' },
      { en: 'Insulin and medicines', bn: 'ইনসুলিন ও ওষুধ' },
      { en: 'Diabetic foot care', bn: 'ডায়াবেটিসে পায়ের যত্ন' },
      { en: 'Diet advice', bn: 'খাদ্যাভ্যাসের পরামর্শ' },
    ],
  },
  Endocrinology: {
    plain: { en: 'Hormone, thyroid and sugar doctor', bn: 'হরমোন, থাইরয়েড ও সুগারের ডাক্তার' },
    conditions: [
      { en: 'Sugar (diabetes)', bn: 'সুগার (ডায়াবেটিস)' },
      { en: 'Thyroid problems', bn: 'থাইরয়েডের সমস্যা' },
      { en: 'Weight gain or loss', bn: 'ওজন বাড়া বা কমা' },
      { en: 'Hormone problems', bn: 'হরমোনের সমস্যা' },
    ],
  },
  Dermatology: {
    plain: { en: 'Skin, hair and nail doctor', bn: 'চামড়া, চুল ও নখের ডাক্তার' },
    conditions: [
      { en: 'Itching and rashes', bn: 'চুলকানি ও র‍্যাশ' },
      { en: 'Ringworm (daad)', bn: 'দাদ' },
      { en: 'Pimples', bn: 'ব্রণ' },
      { en: 'Hair fall', bn: 'চুল পড়া' },
      { en: 'Allergy', bn: 'অ্যালার্জি' },
      { en: 'White patches', bn: 'সাদা দাগ' },
    ],
  },
  Ophthalmology: {
    plain: { en: 'Eye doctor', bn: 'চোখের ডাক্তার' },
    conditions: [
      { en: 'Weak eyesight and glasses', bn: 'চোখে কম দেখা ও চশমা' },
      { en: 'Cataract', bn: 'ছানি' },
      { en: 'Red or watery eyes', bn: 'চোখ লাল বা জল পড়া' },
      { en: 'Eye pain', bn: 'চোখে ব্যথা' },
      { en: 'Eye injury', bn: 'চোখে আঘাত' },
    ],
  },
  Psychiatry: {
    plain: { en: 'Mental health doctor', bn: 'মানসিক স্বাস্থ্যের ডাক্তার' },
    conditions: [
      { en: 'Sleep problems', bn: 'ঘুমের সমস্যা' },
      { en: 'Worry and anxiety', bn: 'দুশ্চিন্তা ও উদ্বেগ' },
      { en: 'Low mood (depression)', bn: 'মন খারাপ (ডিপ্রেশন)' },
      { en: 'Alcohol or drug habit', bn: 'মদ বা নেশার অভ্যাস' },
      { en: 'Memory problems', bn: 'স্মৃতিশক্তির সমস্যা' },
    ],
  },
  Pulmonology: {
    plain: { en: 'Chest and breathing doctor', bn: 'বুক ও শ্বাসকষ্টের ডাক্তার' },
    conditions: [
      { en: 'Long-lasting cough', bn: 'অনেক দিনের কাশি' },
      { en: 'Asthma', bn: 'হাঁপানি' },
      { en: 'Breathlessness', bn: 'শ্বাসকষ্ট' },
      { en: 'TB care', bn: 'যক্ষ্মার চিকিৎসা' },
      { en: 'Snoring and sleep apnoea', bn: 'নাক ডাকা ও ঘুমে শ্বাস বন্ধ' },
    ],
  },
  Urology: {
    plain: { en: 'Kidney stone and urine problem doctor', bn: 'কিডনির পাথর ও প্রস্রাবের সমস্যার ডাক্তার' },
    conditions: [
      { en: 'Kidney stones', bn: 'কিডনিতে পাথর' },
      { en: 'Burning urine', bn: 'প্রস্রাবে জ্বালা' },
      { en: 'Frequent urination', bn: 'বারবার প্রস্রাব' },
      { en: 'Prostate problems', bn: 'প্রস্টেটের সমস্যা' },
      { en: 'Blood in urine', bn: 'প্রস্রাবে রক্ত' },
    ],
  },
  Neurology: {
    plain: { en: 'Brain and nerve doctor', bn: 'মস্তিষ্ক ও স্নায়ুর ডাক্তার' },
    conditions: [
      { en: 'Headache and migraine', bn: 'মাথাব্যথা ও মাইগ্রেন' },
      { en: 'Fits (seizures)', bn: 'খিঁচুনি' },
      { en: 'Stroke and paralysis', bn: 'স্ট্রোক ও প্যারালাইসিস' },
      { en: 'Numbness or tingling', bn: 'অবশ ভাব বা ঝিনঝিন' },
      { en: 'Tremor', bn: 'হাত-পা কাঁপা' },
    ],
  },
  Dentistry: {
    plain: { en: 'Teeth doctor', bn: 'দাঁতের ডাক্তার' },
    conditions: [
      { en: 'Toothache', bn: 'দাঁতে ব্যথা' },
      { en: 'Cavities', bn: 'দাঁতে পোকা' },
      { en: 'Bleeding gums', bn: 'মাড়ি থেকে রক্ত' },
      { en: 'Tooth removal', bn: 'দাঁত তোলা' },
    ],
  },
};

const ALIASES: [string, string][] = [
  ['endocrinology', 'Endocrinology'],
  ['gyn', 'Gynecology & Obstetrics'],
];

export const getSpecialtyInfo = (specialty: string): SpecialtyInfo | null => {
  if (SPECIALTIES[specialty]) return SPECIALTIES[specialty];
  const lower = specialty.toLowerCase();
  const alias = ALIASES.find(([prefix]) => lower.startsWith(prefix));
  if (alias) return SPECIALTIES[alias[1]];
  const key = Object.keys(SPECIALTIES).find((name) => lower.startsWith(name.toLowerCase()));
  return key ? SPECIALTIES[key] : null;
};
