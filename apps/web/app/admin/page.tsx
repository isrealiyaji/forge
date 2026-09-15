import Panel from "@/components/ui/Panel";
import RosterRow from "@/components/ui/RosterRow";
import { adminActionQueue, adminStats, adminRecentMembers } from "@/lib/mock-data";

const AdminDashboard = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-5xl tracking-poster text-ink-inverse">Today&apos;s Card</h1>
        <p className="mt-2 text-muted-inverse">
          {adminActionQueue.length} items need a decision before the day is done.
        </p>
      </header>

      <Panel className="mb-8">
        <div className="px-6 py-5">
          {adminActionQueue.map((item) => (
            <RosterRow
              key={item.id}
              title={item.title}
              meta={item.meta}
              tone={item.tone}
              statusLabel={item.statusLabel}
              keyStat={item.keyStat}
              action={
                <a
                  href="#"
                  className="rounded-sm bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-panel transition-opacity hover:opacity-80"
                >
                  Review
                </a>
              }
            />
          ))}
        </div>
      </Panel>

      {/* Tale of the tape */}
      <div className="mb-8 grid grid-cols-2 divide-x divide-line-dark border border-line-dark md:grid-cols-4">
        {[
          { label: "Active Members", value: adminStats.activeMembers },
          { label: "Instructors", value: adminStats.instructors },
          { label: "Classes This Week", value: adminStats.classesThisWeek },
          { label: "Avg. Assignment Load", value: `${adminStats.avgAssignmentLoad}/${adminStats.assignmentCap}` },
        ].map((stat) => (
          <div key={stat.label} className="px-6 py-6">
            <p className="font-tnum font-display text-4xl text-ink-inverse">{stat.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-inverse">{stat.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl tracking-poster text-ink-inverse">Recent Members</h2>
        <Panel>
          <div className="px-6 py-5">
            {adminRecentMembers.map((member) => (
              <RosterRow
                key={member.id}
                title={member.title}
                meta={member.meta}
                tone={member.tone}
                statusLabel={member.statusLabel}
                keyStat={member.keyStat}
              />
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
};

export default AdminDashboard;
