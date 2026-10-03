export function formatTo12Hour(timeStr: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (trimmed.includes("AM") || trimmed.includes("PM") || trimmed.includes("am") || trimmed.includes("pm")) {
    return trimmed;
  }
  const parts = trimmed.split(":");
  if (parts.length < 2) return trimmed;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return trimmed;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHours}:${displayMinutes} ${period}`;
}

export function formatShiftString(shiftStr: string): string {
  if (!shiftStr) return "";
  return shiftStr.replace(/\b(\d{1,2}):(\d{2})(?!\s*(?:AM|PM|am|pm))\b/g, (match, h, m) => {
    const hours = parseInt(h, 10);
    const minutes = parseInt(m, 10);
    if (isNaN(hours) || isNaN(minutes) || hours > 23 || minutes > 59) return match;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${displayHours}:${displayMinutes} ${period}`;
  });
}
