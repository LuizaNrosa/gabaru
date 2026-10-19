import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export async function remindTomorrow() {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("study", {
      name: "Lembretes de estudo",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted)
    throw new Error("Permissão de notificação não concedida.");
  const old = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of old)
    if (n.content.data?.kind === "study-reminder")
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Seu próximo passo no Gabaru",
      body: "Que tal resolver algumas questões hoje?",
      data: { kind: "study-reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 86400,
      channelId: "study",
    },
  });
}
export async function cancelReminders() {
  for (const n of await Notifications.getAllScheduledNotificationsAsync())
    if (n.content.data?.kind === "study-reminder")
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
}
