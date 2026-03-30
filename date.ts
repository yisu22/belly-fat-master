const pad = (value: number) => String(value).padStart(2, '0');

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getTodayDayIndex(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export function formatShortDate(dateKey: string) {
  const [, month, day] = dateKey.split('-');
  return `${month}/${day}`;
}

export function getWeekFromStartDate(startDateStr: string | null): number {
  if (!startDateStr) return 1;
  const diffMs = Date.now() - new Date(startDateStr).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 0) return 1;
  return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
}
