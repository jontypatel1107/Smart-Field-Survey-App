let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Notifications) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function schedulePendingSurveyReminder(surveyCount: number) {
  try {
    if (!Notifications) return;
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
  } catch {}
}

export async function sendImmediateNotification(title: string, body: string) {
  try {
    if (!Notifications) return;
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {}
}
