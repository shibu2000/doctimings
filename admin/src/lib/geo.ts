const PATTERNS = [
  /@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
  /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/,
  /[?&](?:q|ll|query|destination)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/,
  /^\s*(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{1,3}\.\d+)\s*$/
];

export const parseCoordinates = (text: string): { latitude: number; longitude: number } | null => {
  const decoded = decodeURIComponent(text.trim());
  for (const pattern of PATTERNS) {
    const match = decoded.match(pattern);
    if (match) {
      const latitude = Number(match[1]);
      const longitude = Number(match[2]);
      if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) return { latitude, longitude };
    }
  }
  return null;
};

export const isShortMapsLink = (text: string) => /maps\.app\.goo\.gl|goo\.gl\/maps/.test(text);

export const formatCoordinates = (latitude: number, longitude: number) => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

export const mapsUrl = (latitude: number, longitude: number) => `https://www.google.com/maps?q=${latitude},${longitude}`;
