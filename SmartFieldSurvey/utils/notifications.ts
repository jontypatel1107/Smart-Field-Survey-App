import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function schedulePendingSurveyReminder(surveyCount: number) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (surveyCount > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pending Surveys',
        body: `You have ${surveyCount} pending survey${surveyCount > 1 ? 's' : ''} to complete. Stay on track!`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });
  }
}

export async function sendImmediateNotification(title: string, body: string) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
