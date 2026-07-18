import { Alert } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  return true;
}

export async function schedulePendingSurveyReminder(surveyCount: number) {}

export async function sendImmediateNotification(title: string, body: string) {
  Alert.alert(title, body);
}
