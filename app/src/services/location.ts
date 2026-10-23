import * as Location from 'expo-location';
import { LocationItem } from '../types';
import { distanceKm } from './doctorMapper';
import type { Town } from './api';

const NEAR_TOWN_KM = 15;
const RECENT_FIX_MS = 10 * 60 * 1000;
const NETWORK_FIX_TIMEOUT_MS = 8000;
const GPS_FIX_TIMEOUT_MS = 20000;

export const CURRENT_LOCATION_ID = 'current-location';

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

const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
  Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);

const currentFix = async (accuracy: Location.Accuracy, timeoutMs: number) => {
  try {
    return await withTimeout(Location.getCurrentPositionAsync({ accuracy }), timeoutMs);
  } catch {
    return null;
  }
};

const lastKnownFix = async (maxAge?: number) => {
  try {
    return await Location.getLastKnownPositionAsync(maxAge ? { maxAge } : undefined);
  } catch {
    return null;
  }
};

export const detectCoords = async (): Promise<DetectResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return { ok: false, reason: 'denied' };
    if (!(await Location.hasServicesEnabledAsync())) return { ok: false, reason: 'off' };
  } catch {
    return { ok: false, reason: 'off' };
  }

  const fix =
    (await lastKnownFix(RECENT_FIX_MS)) ??
    (await currentFix(Location.Accuracy.Balanced, NETWORK_FIX_TIMEOUT_MS)) ??
    (await currentFix(Location.Accuracy.High, GPS_FIX_TIMEOUT_MS)) ??
    (await lastKnownFix());

  return fix
    ? { ok: true, latitude: fix.coords.latitude, longitude: fix.coords.longitude }
    : { ok: false, reason: 'off' };
};

export const canDetectWithoutPrompt = async (): Promise<boolean> => {
  try {
    const { granted } = await Location.getForegroundPermissionsAsync();
    return granted && (await Location.hasServicesEnabledAsync());
  } catch {
    return false;
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
    id: CURRENT_LOCATION_ID,
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
