const dayFormatter = (timezone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });

const weekdayFormatter = (timezone: string) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" });

const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const DAY_MS = 86_400_000;

/** Mon..Sun booleans — whether a check-in landed on that calendar day (in `timezone`) of the current week. */
export const getWeekPattern = (checkInTimestamps: string[], timezone = "UTC"): boolean[] => {
  const dayFmt = dayFormatter(timezone);
  const now = new Date();
  const todayIndex = WEEKDAY_INDEX[weekdayFormatter(timezone).format(now)] ?? 0;
  const checkedDays = new Set(checkInTimestamps.map((ts) => dayFmt.format(new Date(ts))));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() + (i - todayIndex) * DAY_MS);
    return checkedDays.has(dayFmt.format(date));
  });
};

/** "Today"/"Tomorrow"/weekday label plus a formatted time, for a class schedule row. */
export const formatClassSchedule = (startTimeIso: string, timezone = "UTC") => {
  const date = new Date(startTimeIso);
  const dayFmt = dayFormatter(timezone);
  const now = new Date();

  let dayLabel: string;
  if (dayFmt.format(date) === dayFmt.format(now)) {
    dayLabel = "Today";
  } else if (dayFmt.format(date) === dayFmt.format(new Date(now.getTime() + DAY_MS))) {
    dayLabel = "Tomorrow";
  } else {
    dayLabel = weekdayFormatter(timezone).format(date);
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(
    date,
  );
  return { dayLabel, timeLabel };
};

export const formatShortDate = (iso: string, timezone = "UTC") =>
  new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric" }).format(new Date(iso));
