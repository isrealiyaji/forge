import { Check } from "lucide-react";
import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import StatusPill from "@/components/ui/StatusPill";
import type { Tone } from "@/components/ui/StatusPill";
import CheckInButton from "@/components/member/CheckInButton";
import { memberApi } from "@/lib/api/member";
import { getCookieHeader } from "@/lib/auth/session";
import { getWeekPattern, formatClassSchedule, formatShortDate } from "@/lib/dateTime";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const SUBSCRIPTION_STATUS: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  past_due: { tone: "alert", label: "Past Due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

const localDateString = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    date,
  );

const MemberDashboard = async () => {
  const cookie = await getCookieHeader();

  const [{ member }, instructor, { subscription }, { bookings }, { entries }] = await Promise.all([
    memberApi.me({ cookie }),
    memberApi.myInstructor({ cookie }),
    memberApi.mySubscription({ cookie }),
    memberApi.myBookings({ cookie }),
    memberApi.attendanceHistory({ cookie }),
  ]);

  const timezone = member.timezone || "UTC";
  const weekPattern = getWeekPattern(
    entries.map((e) => e.checked_in_at),
    timezone,
  );
  const alreadyCheckedIn = member.last_checkin_local_date === localDateString(new Date(), timezone);
  const subStatus = subscription ? SUBSCRIPTION_STATUS[subscription.status] : null;

  return (
    <>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-poster text-ink-inverse">
            Welcome back, {member.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-inverse">Here&apos;s where things stand today.</p>
        </div>
        {subStatus ? <StatusPill tone={subStatus.tone} label={subStatus.label} /> : null}
      </header>

      {/* Main event: the record */}
      <Panel className="mb-8">
        <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Your Record</p>
            <p className="font-tnum font-display text-8xl leading-none tracking-poster text-ink sm:text-9xl">
              {member.current_streak}
            </p>
            <p className="mt-1 text-lg font-bold uppercase tracking-wide text-accent">Day Streak</p>
            <p className="mt-2 text-sm text-muted">Best run: {member.longest_streak} days</p>
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {weekPattern.map((hit, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                      hit ? "bg-accent text-accent-ink" : "border border-line text-muted"
                    }`}
                  >
                    {hit ? <Check size={16} strokeWidth={3} /> : ""}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-muted">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
            <CheckInButton alreadyCheckedIn={alreadyCheckedIn} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Upcoming Classes</h2>
          <Panel>
            <div className="px-6 py-5">
              {bookings.length === 0 ? (
                <p className="py-4 text-sm text-muted">No upcoming classes booked yet.</p>
              ) : (
                bookings.map((b) => {
                  const { dayLabel, timeLabel } = formatClassSchedule(b.start_time, timezone);
                  return (
                    <RosterRow
                      key={b.booking_id}
                      title={b.class_name}
                      meta={`${dayLabel} · ${timeLabel}${b.instructor_name ? ` · Coach ${b.instructor_name.split(" ")[0]}` : ""}`}
                      tone={b.status === "booked" ? "good" : "neutral"}
                      statusLabel={b.status === "booked" ? "Booked" : "Waitlisted"}
                      keyStat={timeLabel}
                    />
                  );
                })
              )}
            </div>
          </Panel>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Your Corner</h2>
          <Panel>
            <div className="px-6 py-6">
              {instructor ? (
                <>
                  <p className="font-display text-2xl tracking-poster text-ink">{instructor.name}</p>
                  <p className="mt-1 text-sm font-semibold text-accent">{instructor.specialty}</p>
                </>
              ) : (
                <p className="text-sm text-muted">No instructor assigned yet.</p>
              )}
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Plan</p>
                {subscription ? (
                  <>
                    <p className="mt-1 font-semibold text-ink">{subscription.plan_name}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {subscription.current_period_end
                        ? `Renews ${formatShortDate(subscription.current_period_end, timezone)}`
                        : ""}
                    </p>
                    <a
                      href="/member/subscription"
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-accent hover:underline"
                    >
                      Manage Subscription →
                    </a>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-muted">No active subscription.</p>
                    <a
                      href="/member/subscription"
                      className="mt-3 inline-block text-xs font-bold uppercase tracking-wide text-accent hover:underline"
                    >
                      Choose a Plan →
                    </a>
                  </>
                )}
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </>
  );
};

export default MemberDashboard;
