import { Check } from "lucide-react";
import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import StatusPill from "@/components/ui/StatusPill";
import { memberProfile } from "@/lib/mock-data";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const MemberDashboard = () => {
  return (
    <>
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-poster text-ink-inverse">
            Welcome back, {memberProfile.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-inverse">Here&apos;s where things stand today.</p>
        </div>
        <StatusPill tone={memberProfile.subscription.status} label={memberProfile.subscription.statusLabel} />
      </header>

      {/* Main event: the record */}
      <Panel className="mb-8">
        <div className="flex flex-col gap-8 px-6 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Your Record</p>
            <p className="font-tnum font-display text-8xl leading-none tracking-poster text-ink sm:text-9xl">
              {memberProfile.streak}
            </p>
            <p className="mt-1 text-lg font-bold uppercase tracking-wide text-accent">Day Streak</p>
            <p className="mt-2 text-sm text-muted">Best run: {memberProfile.longestStreak} days</p>
          </div>

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {memberProfile.weekPattern.map((hit, i) => (
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
            <a
              href="#"
              className="w-full rounded-sm bg-ink px-6 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-panel transition-opacity hover:opacity-80 sm:w-auto"
            >
              Check In Today
            </a>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Upcoming Classes</h2>
          <Panel>
            <div className="px-6 py-5">
              {memberProfile.upcomingClasses.map((c) => (
                <RosterRow key={c.id} title={c.title} meta={c.meta} tone={c.tone} statusLabel={c.statusLabel} keyStat={c.keyStat} />
              ))}
            </div>
          </Panel>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Your Corner</h2>
          <Panel>
            <div className="px-6 py-6">
              <p className="font-display text-2xl tracking-poster text-ink">{memberProfile.instructor.name}</p>
              <p className="mt-1 text-sm font-semibold text-accent">{memberProfile.instructor.specialty}</p>
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Plan</p>
                <p className="mt-1 font-semibold text-ink">{memberProfile.subscription.plan}</p>
                <p className="mt-0.5 text-sm text-muted">Renews {memberProfile.subscription.renews}</p>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </>
  );
};

export default MemberDashboard;
