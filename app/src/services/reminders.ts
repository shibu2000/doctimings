import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import i18n from '../locales/i18n';
import { MyVisit } from '../types';

const CHANNEL_ID = 'visit-reminders';
const EVENING_BEFORE = { hour: 19, minute: 0 };
const MORNING_OF = { hour: 7, minute: 30 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady: Promise<unknown> | null = null;

const ensureChannel = () => {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelReady ??= Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: i18n.t('reminders.channelName'),
    importance: Notifications.AndroidImportance.HIGH,
  });
  return channelReady;
};

export const ensureReminderPermission = async (): Promise<boolean> => {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
};

const atLocalTime = (isoDate: string, dayOffset: number, time: { hour: number; minute: number }) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day + dayOffset, time.hour, time.minute);
};

export const scheduleVisitReminders = async (visit: MyVisit): Promise<string[]> => {
  await ensureChannel();
  const now = Date.now();
  const details = i18n.t('reminders.body', { time: visit.visitTime, place: visit.establishmentName });
  const reminders = [
    { at: atLocalTime(visit.visitDate, -1, EVENING_BEFORE), title: i18n.t('reminders.tomorrowTitle', { doctor: visit.doctorName }) },
    { at: atLocalTime(visit.visitDate, 0, MORNING_OF), title: i18n.t('reminders.todayTitle', { doctor: visit.doctorName }) },
  ].filter((reminder) => reminder.at.getTime() > now);

  const ids: string[] = [];
  for (const reminder of reminders) {
    try {
      ids.push(
        await Notifications.scheduleNotificationAsync({
          content: { title: reminder.title, body: details, data: { visitId: visit.id, doctorId: visit.doctorId } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.at, channelId: CHANNEL_ID },
        })
      );
    } catch {}
  }
  return ids;
};

export const cancelReminders = async (ids: string[] = []) => {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
};
