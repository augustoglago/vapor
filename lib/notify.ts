// src/lib/notify.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function ensureNotifSetup() {
  // Handler: mostrar alerta em foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Padrão",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function askNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleDailyAt(
  hour: number,
  minute: number,
  title = "Lembrete diário",
  body = "Veja as novidades de jogos hoje!"
) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: "default", // android
    },
  });
}

export async function scheduleEveryMinutes(
  minutes: number,
  title = "Hora de jogar",
  body = "Volte e continue seu progresso!"
) {
  // iOS: intervalo mínimo de 60s para repetição (recomendo >= 5 min).
  const seconds = Math.max(60, minutes * 60);
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      seconds,
      repeats: true,
      channelId: "default",
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
