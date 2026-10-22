import { Share } from 'react-native';
import i18n from '../locales/i18n';
import { Doctor, LanguageCode } from '../types';
import { getSpecialtyInfo } from '../data/specialties';
import { findNextSitting } from './sittings';

export const WEBSITE_URL = 'https://doctimings.vercel.app';

const directionsUrl = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

export const buildDoctorShareMessage = (doctor: Doctor, language: LanguageCode) => {
  const t = i18n.getFixedT(language);
  const bn = language === 'bn';
  const locale = bn ? 'bn-IN' : 'en-IN';

  const name = bn && doctor.nameBn ? doctor.nameBn : doctor.name;
  const specialty = bn && doctor.specialtiesBn.length ? doctor.specialtiesBn[0] : doctor.specialties[0];
  const info = getSpecialtyInfo(doctor.specialties[0]);
  const next = findNextSitting(doctor.practices);
  const practice = next?.practice ?? doctor.practices[0];

  const lines = [`🩺 *${name}*`, info ? `${bn ? info.plain.bn : info.plain.en} (${specialty})` : specialty, ''];

  if (next) {
    const day =
      next.dayOffset === 0
        ? t('doctor.today')
        : next.dayOffset === 1
          ? t('doctor.tomorrow')
          : new Date(`${next.date}T00:00:00Z`).toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              timeZone: 'UTC',
            });
    lines.push(`📅 ${t('share.nextSitting')}: ${day}, ${bn ? next.schedule.slotLabelBn : next.schedule.slotLabel}`);
  } else if (practice?.schedules.length) {
    const days = [...new Set(practice.schedules.map((s) => (bn ? s.dayNameBn : s.dayName)))];
    lines.push(`📅 ${t('share.sitsOn')}: ${days.join(', ')}`);
  }

  if (practice) {
    lines.push(`🏥 ${[practice.establishmentName, practice.locality].filter(Boolean).join(', ')}`);
    if (practice.hasExactLocation) {
      lines.push(`📍 ${t('share.directions')}: ${directionsUrl(practice.latitude, practice.longitude)}`);
    }
  }

  const phone = practice?.phone || doctor.phone;
  if (phone) lines.push(`📞 ${t('share.counter')}: ${phone}`);

  if (phone) lines.push('', t('share.confirmFirst'));
  lines.push('', t('share.promo'), WEBSITE_URL);
  return lines.join('\n');
};

export const shareDoctor = async (doctor: Doctor, language: LanguageCode) => {
  try {
    await Share.share({ message: buildDoctorShareMessage(doctor, language) });
  } catch {}
};
