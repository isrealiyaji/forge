// Attendance is always stored in UTC; "today" for streak purposes is always
// the member's own local day, derived here rather than stored pre-converted.

const localDateString = (utcDate, timezone) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    utcDate,
  );

const daysBetween = (isoDateA, isoDateB) => {
  const a = new Date(`${isoDateA}T00:00:00Z`);
  const b = new Date(`${isoDateB}T00:00:00Z`);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

module.exports = { localDateString, daysBetween };
