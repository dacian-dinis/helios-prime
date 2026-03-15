export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  return Notification.requestPermission();
}

export function showNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
  });
}

const MESSAGES: Record<string, { title: string; body: string }> = {
  mealLogging: { title: "Time to log your meal!", body: "Keep your food diary up to date." },
  water: { title: "Stay hydrated!", body: "Time to drink some water." },
  workout: { title: "Workout time!", body: "Let's get moving today." },
  fasting: { title: "Fasting reminder", body: "Check your fasting window." },
  weighIn: { title: "Daily weigh-in", body: "Step on the scale and log your weight." },
};

export function getNotificationMessage(type: string): { title: string; body: string } {
  return MESSAGES[type] || { title: "Helios Prime", body: "You have a reminder." };
}
