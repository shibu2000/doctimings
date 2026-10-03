import { Doctor, Establishment, SearchApiResponse } from "@/types";

const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://doctimings-api.docnear.workers.dev/api/v1";
  }
  return "/api/v1";
};

export interface FetchDoctorsParams {
  q?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  specialty?: string;
  dayOfWeek?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function fetchDoctors(params: FetchDoctorsParams = {}): Promise<SearchApiResponse> {
  const url = new URL(`${getApiBaseUrl()}/search`, typeof window === "undefined" ? "http://localhost:4000" : window.location.origin);
  
  if (params.q) url.searchParams.set("q", params.q);
  if (params.latitude !== undefined) url.searchParams.set("latitude", params.latitude.toString());
  if (params.longitude !== undefined) url.searchParams.set("longitude", params.longitude.toString());
  if (params.radiusKm !== undefined) url.searchParams.set("radiusKm", params.radiusKm.toString());
  if (params.specialty && params.specialty !== "All") url.searchParams.set("specialty", params.specialty);
  if (params.dayOfWeek) url.searchParams.set("dayOfWeek", params.dayOfWeek);
  if (params.availableOnly) url.searchParams.set("availableOnly", "true");
  if (params.page) url.searchParams.set("page", params.page.toString());
  if (params.limit) url.searchParams.set("limit", params.limit.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch doctors: ${res.statusText}`);
  }

  return res.json();
}

export async function fetchEstablishments(): Promise<Establishment[]> {
  const url = `${getApiBaseUrl()}/establishments`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch establishments: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data || [];
}

export async function fetchDoctorById(id: string): Promise<Doctor | null> {
  const url = `${getApiBaseUrl()}/doctors/${id}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch doctor: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data || null;
}
