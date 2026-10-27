import Panel from "@/components/ui/Panel";
import CheckInButton from "@/components/member/CheckInButton";
import { memberApi } from "@/lib/api/member";
import { getCookieHeader } from "@/lib/auth/session";

const WEEKS = 12;
const DAY_MS = 86_400_000;
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const localDateString = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    date,
  );

const weekdayIndex = (date: Date, timezone: string) => {
  const label = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" }).format(date);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(label);
};

const formatEntryDate = (iso: string, timezone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: timezone, month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );

const formatEntryTime = (iso: string, timezone: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

const MemberAttendancePage = async () => {
  const cookie = await getCookieHeader();
  const [{ member }, { entries }] = await Promise.all([
    memberApi.me({ cookie }),
    memberApi.attendanceHistory({ cookie }),
  ]);
  const timezone = member.timezone || "UTC";
  const alreadyCheckedIn = member.last_checkin_local_date === localDateString(new Date(), timezone);

  const checkedDays = new Set(entries.map((e) => localDateString(new Date(e.checked_in_at), timezone)));

  const now = new Date();
  const todayIndex = weekdayIndex(now, timezone);
  const totalDays = WEEKS * 7;
  // Grid starts on the Monday of the earliest visible week, so today lands
  // in the correct weekday row of the last column.
  const start = new Date(now.getTime() - (totalDays - 1 - todayIndex) * DAY_MS);

  const columns = Array.from({ length: WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = new Date(start.getTime() + (week * 7 + day) * DAY_MS);
      const key = localDateString(date, timezone);
      return { key, hit: checkedDays.has(key), future: date.getTime() > now.getTime() };
    }),
  );

  const tiles = [
    { label: "Current Streak", value: member.current_streak },
    { label: "Longest Streak", value: member.longest_streak },
    { label: "Total Check-Ins", value: entries.length },
  ];

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Attendance</h1>
        <p className="mt-2 text-muted-inverse">Your check-in streak, day by day.</p>
      </header>

      <div className="mb-8 grid grid-cols-3 divide-x divide-line-dark border border-line-dark">
        {tiles.map((tile) => (
          <div key={tile.label} className="px-6 py-6">
            <p className="font-tnum font-display text-4xl text-ink-inverse">{tile.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-inverse">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <CheckInButton alreadyCheckedIn={alreadyCheckedIn} />
      </div>

      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Last {WEEKS} Weeks</h2>
        <Panel>
          <div className="overflow-x-auto px-6 py-6">
            <div className="flex gap-1.5">
              <div className="flex flex-col gap-1.5 pr-1">
                {DAY_LABELS.map((label, i) => (
                  <span key={i} className="flex h-3.5 w-4 items-center text-[9px] font-semibold text-muted">
                    {i % 2 === 0 ? label : ""}
                  </span>
                ))}
              </div>
              {columns.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <span
                      key={day.key}
                      title={day.key}
                      className={`h-3.5 w-3.5 rounded-[2px] ${
                        day.future ? "bg-transparent" : day.hit ? "bg-accent" : "bg-line/40"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">History</h2>
        <Panel>
          <div className="px-6 py-5">
            {entries.length === 0 ? (
              <p className="py-4 text-sm text-muted">No check-ins yet — hit the button above to start your streak.</p>
            ) : (
              entries.map((entry, i) => (
                <div
                  key={`${entry.checked_in_at}-${i}`}
                  className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{formatEntryDate(entry.checked_in_at, timezone)}</p>
                    <p className="text-xs text-muted">{formatEntryTime(entry.checked_in_at, timezone)}</p>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    {entry.method === "qr" ? "QR" : "Manual"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>
    </>
  );
};

export default MemberAttendancePage;
