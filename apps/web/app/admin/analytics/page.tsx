import Panel from "@/components/ui/Panel";
import StatusPill from "@/components/ui/StatusPill";
import type { Tone } from "@/components/ui/StatusPill";
import { adminApi } from "@/lib/api/admin";
import { getCookieHeader } from "@/lib/auth/session";

const STATUS_LABEL: Record<string, { tone: Tone; label: string }> = {
  active: { tone: "good", label: "Active" },
  past_due: { tone: "alert", label: "Past Due" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  ended: { tone: "neutral", label: "Ended" },
};

const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const AdminAnalyticsPage = async () => {
  const cookie = await getCookieHeader();
  const { summary, mrrCents, subscriptionsByStatus, newMembersByMonth, attendanceByDay } = await adminApi.analytics({
    cookie,
  });

  const tiles = [
    { label: "Active Members", value: summary.activeMembers },
    { label: "Instructors", value: summary.instructors },
    { label: "Monthly Revenue", value: formatPrice(mrrCents) },
    { label: "Past Due", value: summary.pastDueSubscriptions },
    { label: "Pending Nutrition", value: summary.pendingNutritionPlans },
    { label: "Classes This Week", value: summary.classesThisWeek },
  ];

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse md:text-5xl">Analytics</h1>
        <p className="mt-2 text-muted-inverse">How the gym is doing right now.</p>
      </header>

      <div className="mb-8 grid grid-cols-2 divide-x divide-y divide-line-dark border border-line-dark sm:divide-y-0 md:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="px-6 py-6">
            <p className="font-tnum font-display text-4xl text-ink-inverse">{tile.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-inverse">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Subscriptions</h2>
          <Panel>
            <div className="px-6 py-5">
              {subscriptionsByStatus.length === 0 ? (
                <p className="py-4 text-sm text-muted">No subscriptions yet.</p>
              ) : (
                subscriptionsByStatus.map((row) => {
                  const meta = STATUS_LABEL[row.status] ?? { tone: "neutral" as Tone, label: row.status };
                  return (
                    <div
                      key={row.status}
                      className="flex items-center justify-between border-b border-line px-1 py-3.5 last:border-b-0"
                    >
                      <StatusPill tone={meta.tone} label={meta.label} />
                      <p className="font-tnum text-sm font-semibold text-ink">{row.count}</p>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">New Members (6 mo)</h2>
          <Panel>
            <div className="px-6 py-5">
              {newMembersByMonth.length === 0 ? (
                <p className="py-4 text-sm text-muted">No signups in this window.</p>
              ) : (
                newMembersByMonth.map((row) => (
                  <div
                    key={row.month}
                    className="flex items-center justify-between border-b border-line px-1 py-3.5 last:border-b-0"
                  >
                    <p className="text-sm font-semibold text-ink">{row.month}</p>
                    <p className="font-tnum text-sm font-semibold text-ink">{row.count}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Attendance (Last 7 Days)</h2>
        <Panel>
          <div className="px-6 py-5">
            {attendanceByDay.length === 0 ? (
              <p className="py-4 text-sm text-muted">No check-ins this week yet.</p>
            ) : (
              attendanceByDay.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between border-b border-line px-1 py-3.5 last:border-b-0"
                >
                  <p className="text-sm font-semibold text-ink">{row.day}</p>
                  <p className="font-tnum text-sm font-semibold text-ink">{row.count} check-ins</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </section>
    </>
  );
};

export default AdminAnalyticsPage;
