import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Doctor, Establishment, Override, Room, Schedule, Snapshot } from './types';
import { useToast } from '../components/ui/Toast';

export const SNAPSHOT_KEY = ['snapshot'] as const;

export interface Sitting {
  doctor: Doctor;
  establishment: Establishment;
  sessions: Schedule[];
  overrides: Override[];
}

const pairKey = (doctorId: string, establishmentId: string) => `${doctorId}|${establishmentId}`;

export const buildDirectory = (snapshot: Snapshot) => {
  const doctorById = new Map(snapshot.doctors.map(d => [d.id, d]));
  const establishmentById = new Map(snapshot.establishments.map(e => [e.id, e]));
  const roomsByEstablishment = new Map<string, Room[]>();
  for (const room of snapshot.locations) {
    roomsByEstablishment.set(room.establishmentId, [...(roomsByEstablishment.get(room.establishmentId) ?? []), room]);
  }
  const sessionsByPair = new Map<string, Schedule[]>();
  for (const s of snapshot.schedules) {
    const key = pairKey(s.doctorId, s.establishmentId);
    sessionsByPair.set(key, [...(sessionsByPair.get(key) ?? []), s]);
  }
  const overridesByPair = new Map<string, Override[]>();
  for (const o of snapshot.overrides) {
    const key = pairKey(o.doctorId, o.establishmentId);
    overridesByPair.set(key, [...(overridesByPair.get(key) ?? []), o]);
  }

  const sitting = (doctor: Doctor, establishment: Establishment): Sitting => ({
    doctor,
    establishment,
    sessions: sessionsByPair.get(pairKey(doctor.id, establishment.id)) ?? [],
    overrides: overridesByPair.get(pairKey(doctor.id, establishment.id)) ?? []
  });

  return {
    ...snapshot,
    doctor: (id: string) => doctorById.get(id),
    establishment: (id: string) => establishmentById.get(id),
    rooms: (establishmentId: string) => roomsByEstablishment.get(establishmentId) ?? [],
    room: (establishmentId: string, roomId: string) =>
      roomsByEstablishment.get(establishmentId)?.find(r => r.id === roomId),
    sittingsOf: (doctor: Doctor) =>
      doctor.affiliatedEstablishmentIds
        .map(id => establishmentById.get(id))
        .filter((e): e is Establishment => Boolean(e))
        .map(e => sitting(doctor, e)),
    doctorsAt: (establishment: Establishment) =>
      snapshot.doctors
        .filter(d => d.affiliatedEstablishmentIds.includes(establishment.id))
        .map(d => sitting(d, establishment)),
    overridesOf: (doctorId: string) => snapshot.overrides.filter(o => o.doctorId === doctorId),
    sessionCount: (doctorId: string) => snapshot.schedules.filter(s => s.doctorId === doctorId).length
  };
};

export type Directory = ReturnType<typeof buildDirectory>;

export const useDirectory = () => {
  const query = useQuery({ queryKey: SNAPSHOT_KEY, queryFn: api.snapshot, staleTime: 20_000 });
  const directory = useMemo(() => (query.data ? buildDirectory(query.data) : null), [query.data]);
  return { ...query, directory };
};

export const useAction = <TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  options: { success?: string | ((result: TResult, args: TArgs) => string); onDone?: (result: TResult, args: TArgs) => void } = {}
) => {
  const client = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, args) => {
      await client.invalidateQueries({ queryKey: SNAPSHOT_KEY });
      const message = typeof options.success === 'function' ? options.success(result, args) : options.success;
      if (message) toast.success(message);
      options.onDone?.(result, args);
    },
    onError: (error: Error) => toast.error(error.message)
  });
};
