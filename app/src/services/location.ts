import * as Location from 'expo-location';
import { LocationItem } from '../types';
import { distanceKm } from './doctorMapper';
import type { Town } from './api';

const NEAR_TOWN_KM = 15;

export const MEDINIPUR: LocationItem = {
  id: 'medinipur-sadar',
  name: 'Medinipur',
  nameBn: 'মেদিনীপুর',
  district: 'Paschim Medinipur',
  districtBn: 'পশ্চিম মেদিনীপুর',
  state: 'West Bengal',
  pincode: '',
  latitude: 22.4257,
  longitude: 87.3199
};

export type DetectResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: 'denied' | 'off' };

export const detectCoords = async (): Promise<DetectResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { ok: false, reason: 'denied' };
    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) return { ok: false, reason: 'off' };
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>(resolve => setTimeout(() => resolve(null), 12000))
    ]);
    const fix = position ?? (await Location.getLastKnownPositionAsync());
    if (!fix) return { ok: false, reason: 'off' };
    return { ok: true, latitude: fix.coords.latitude, longitude: fix.coords.longitude };
  } catch {
    return { ok: false, reason: 'off' };
  }
};

export const locationFromCoords = (towns: Town[], latitude: number, longitude: number): LocationItem => {
  let nearest: { town: Town; km: number } | null = null;
  for (const town of towns) {
    const km = distanceKm({ latitude, longitude }, town);
    if (!nearest || km < nearest.km) nearest = { town, km };
  }
  const close = nearest && nearest.km <= NEAR_TOWN_KM ? nearest.town : null;
  return {
    id: 'current-location',
    name: close ? `Near ${close.name}` : 'Your location',
    nameBn: close ? `${close.nameBn}-এর কাছে` : 'আপনার অবস্থান',
    district: close?.district ?? '',
    districtBn: close?.districtBn ?? '',
    state: 'West Bengal',
    pincode: '',
    latitude,
    longitude
  };
};
