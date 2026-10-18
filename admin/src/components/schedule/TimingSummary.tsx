import { Clock } from 'lucide-react';
import type { Room, Schedule } from '../../lib/types';
import { formatDays, formatRange, groupSchedules } from '../../lib/time';

export const TimingSummary = ({ sessions, rooms = [], compact }: { sessions: Schedule[]; rooms?: Room[]; compact?: boolean }) => {
  const groups = groupSchedules(sessions.filter(s => s.isActive));
  if (!groups.length) {
    return <p className="text-sm text-amber-700">No weekly timing yet</p>;
  }
  const roomName = (id: string) => rooms.find(r => r.id === id)?.roomDesignation;
  return (
    <ul className={compact ? 'space-y-0.5' : 'space-y-1'}>
      {groups.map(g => (
        <li key={`${g.days.join()}-${g.startTime}-${g.roomId}`} className="flex items-baseline gap-2 text-sm text-slate-700">
          {!compact && <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 translate-y-0.5" />}
          <span>
            <span className="font-medium text-slate-900">{formatDays(g.days)}</span>
            <span className="text-slate-400"> · </span>
            {formatRange(g.startTime, g.endTime)}
            {rooms.length > 1 && roomName(g.roomId) && <span className="text-slate-500"> · {roomName(g.roomId)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
};
