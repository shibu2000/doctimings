export function formatTime12h(time?: string | null): string {
  if (!time || typeof time !== 'string') return '';
  const trimmed = time.trim();
  if (!trimmed) return '';

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    const h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  }

  const militaryMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (militaryMatch) {
    const rawH = parseInt(militaryMatch[1], 10);
    const m = militaryMatch[2];
    const period = rawH >= 12 ? 'PM' : 'AM';
    const h12 = rawH % 12 === 0 ? 12 : rawH % 12;
    return `${String(h12).padStart(2, '0')}:${m} ${period}`;
  }

  return trimmed;
}

export function formatTimeRange12h(startTime?: string | null, endTime?: string | null): string {
  const start = formatTime12h(startTime);
  const end = formatTime12h(endTime);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (end) return end;
  return '—';
}

export function formatTimestamp12h(timestamp?: string | null): string {
  if (!timestamp || typeof timestamp !== 'string') return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hoursFormatted = String(hours).padStart(2, '0');

  return `${day} ${month} ${year}, ${hoursFormatted}:${minutes} ${period}`;
}

export function formatTimeOnly12h(timestamp?: string | null): string {
  if (!timestamp || typeof timestamp !== 'string') return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hoursFormatted = String(hours).padStart(2, '0');

  return `${hoursFormatted}:${minutes} ${period}`;
}
