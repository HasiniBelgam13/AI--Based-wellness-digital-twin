/**
 * Date utilities for WellNest
 */

export function getTimeBasedGreeting(name = "") {
  const hour = new Date().getHours();
  let greetingPrefix = "Good morning";
  if (hour >= 12 && hour < 17) {
    greetingPrefix = "Good afternoon";
  } else if (hour >= 17) {
    greetingPrefix = "Good evening";
  }

  const cleanName = name ? name.trim().split(" ")[0] : "";
  return cleanName ? `${greetingPrefix}, ${cleanName}` : `${greetingPrefix}`;
}

export function formatFullDate(dateStringOrDate = new Date()) {
  const d = new Date(dateStringOrDate);
  if (isNaN(d.getTime())) return "Unknown Date";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatShortDate(dateStringOrDate) {
  const d = new Date(dateStringOrDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

export function getDayOfWeek(dateStringOrDate) {
  const d = new Date(dateStringOrDate);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRelativeTimeLabel(dateString) {
  const today = getTodayDateInputValue();
  if (dateString === today) return "Today";
  
  const d = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - d);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  return formatShortDate(dateString);
}
