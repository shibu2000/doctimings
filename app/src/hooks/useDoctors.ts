import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useApp } from '../store/AppContext';

const PROBLEM_TO_SPECIALTY: { words: string[]; specialty: string }[] = [
  { words: ['skin', 'rash', 'itch', 'চামড়া', 'চর্ম', 'চুলকানি'], specialty: 'Dermatology' },
  { words: ['child', 'baby', 'kid', 'বাচ্চা', 'শিশু'], specialty: 'Pediatrics' },
  { words: ['eye', 'vision', 'চোখ'], specialty: 'Ophthalmology' },
  { words: ['stomach', 'gastric', 'acidity', 'পেট', 'হজম', 'গ্যাস্ট্রিক'], specialty: 'Gastroenterology' },
  { words: ['bone', 'joint', 'হাড়', 'বাত', 'জয়েন্ট'], specialty: 'Orthopedics' },
  { words: ['tooth', 'teeth', 'dental', 'দাঁত'], specialty: 'Dentistry' },
  { words: ['women', 'pregnan', 'period', 'মহিলা', 'স্ত্রী', 'প্রসূতি'], specialty: 'Gynecology' },
  { words: ['heart', 'chest', 'হৃদ', 'বুক'], specialty: 'Cardiology' },
  { words: ['ear', 'nose', 'throat', 'কান', 'নাক', 'গলা'], specialty: 'ENT' },
  { words: ['general', 'fever', 'জ্বর', 'সাধারণ'], specialty: 'General Medicine' }
];

export const interpretQuery = (text: string): { q?: string; specialty?: string } => {
  const lower = text.toLowerCase().trim();
  if (!lower) return {};
  const match = PROBLEM_TO_SPECIALTY.find(m => m.words.some(w => lower.includes(w)));
  return match ? { specialty: match.specialty } : { q: text.trim() };
};

export const useDoctorSearch = (text: string, availableOnly = false) => {
  const { currentLocation, searchRadius, locationStatus } = useApp();
  const client = useQueryClient();
  const interpreted = interpretQuery(text);
  return useQuery({
    queryKey: ['search', currentLocation.latitude, currentLocation.longitude, searchRadius, interpreted, availableOnly],
    queryFn: async () => {
      const result = await api.searchDoctors({
        ...interpreted,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radiusKm: searchRadius,
        availableOnly
      });
      result.doctors.forEach(d => client.setQueryData(['doctor', d.id], d));
      return result;
    },
    enabled: locationStatus !== 'detecting',
    placeholderData: keepPreviousData,
    staleTime: 60_000
  });
};

export const useDoctor = (id?: string) => {
  const { currentLocation } = useApp();
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.getDoctor(id!, currentLocation),
    enabled: Boolean(id),
    staleTime: 60_000
  });
};
