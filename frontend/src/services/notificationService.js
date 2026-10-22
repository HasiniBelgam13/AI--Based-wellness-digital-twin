const SETTINGS_PREFIX = 'wellnest_daily_reminder_';
const LAST_SENT_PREFIX = 'wellnest_daily_reminder_sent_';

export function getDailyReminderSettings(userId) {
  if (!userId) return { enabled: false, time: '09:00' };

  try {
    const stored = localStorage.getItem(SETTINGS_PREFIX + userId);
    return stored ? { enabled: false, time: '09:00', ...JSON.parse(stored) } : { enabled: false, time: '09:00' };
  } catch {
    return { enabled: false, time: '09:00' };
  }
}

export function saveDailyReminderSettings(userId, settings) {
  if (!userId) return;
  localStorage.setItem(SETTINGS_PREFIX + userId, JSON.stringify(settings));
}

export function startDailyReminder(userId) {
  if (!userId || typeof window === 'undefined' || !('Notification' in window)) {
    return () => {};
  }

  const checkReminder = () => {
    const settings = getDailyReminderSettings(userId);
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const lastSent = localStorage.getItem(LAST_SENT_PREFIX + userId);

    if (currentTime < settings.time || lastSent === today) return;

    const notification = new Notification('Your daily WellNest check-in', {
      body: "Take a moment to record today's wellness details.",
      tag: `wellnest-daily-${today}`
    });
    notification.onclick = () => window.focus();
    localStorage.setItem(LAST_SENT_PREFIX + userId, today);
  };

  checkReminder();
  const intervalId = window.setInterval(checkReminder, 60_000);
  return () => window.clearInterval(intervalId);
}